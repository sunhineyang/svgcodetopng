import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ipSalt = process.env.FEEDBACK_IP_SALT || 'default-salt-change-me';
const rateLimitPerHour = parseInt(process.env.FEEDBACK_RATE_LIMIT_PER_HOUR || '20', 10);

const VALID_TAGS = [
  'missing_elements',
  'blurry',
  'color_issue',
  'transparency_failed',
  'text_error',
  'other',
] as const;
const VALID_MODES = ['svg', 'html'] as const;
const VALID_FORMATS = ['png', 'jpg', 'gif', 'webp', 'pdf'] as const;

function sha256(input: string): string {
  return createHash('sha256').update(input + ipSalt).digest('hex');
}

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { ok: false, error: 'internal_error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const ip = getIp(req);
    const ipHash = sha256(ip);

    const { count, error: countError } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if (countError) {
      console.error('Rate limit check failed:', countError);
      return json(503, { ok: false, error: 'rate_limit_unavailable' });
    } else if (count !== null && count >= rateLimitPerHour) {
      return json(429, { ok: false, error: 'rate_limited' });
    }

    const form = await req.formData();

    const sentiment = form.get('sentiment') as string | null;
    if (!sentiment || !['positive', 'negative'].includes(sentiment)) {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    const contextRaw = form.get('context') as string | null;
    if (!contextRaw) {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    let context: Record<string, unknown>;
    try {
      context = JSON.parse(contextRaw);
    } catch {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    if (!context || typeof context !== 'object' || Array.isArray(context)) {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    const mode = context.mode;
    const format = context.format;
    if (
      typeof mode !== 'string' ||
      !VALID_MODES.includes(mode as (typeof VALID_MODES)[number]) ||
      typeof format !== 'string' ||
      !VALID_FORMATS.includes(format as (typeof VALID_FORMATS)[number])
    ) {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    const clientId = form.get('client_id') as string | null;
    if (!clientId) {
      return json(400, { ok: false, error: 'invalid_payload' });
    }

    let issueTags: string[] | null = null;
    let description: string | null = null;

    if (sentiment === 'negative') {
      const tagsRaw = form.get('issue_tags') as string | null;
      if (tagsRaw) {
        try {
          const parsed = JSON.parse(tagsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            issueTags = parsed.filter((t: string) => VALID_TAGS.includes(t as any));
          }
        } catch {
          // ignore
        }
      }

      description = (form.get('description') as string) || null;
      if (description && description.length > 2000) {
        description = description.substring(0, 2000);
      }
    }

    let svgStoragePath: string | null = null;
    let svgSizeBytes: number | null = null;

    const file = form.get('svg_file');
    if (file && file instanceof File && file.size > 0) {
      if (file.size > 512 * 1024) {
        return json(400, { ok: false, error: 'file_too_large' });
      }

      const text = await file.text();
      if (!text.includes('<svg')) {
        return json(400, { ok: false, error: 'invalid_svg' });
      }

      const now = new Date();
      const yyyy = now.getFullYear().toString();
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const fileUuid = crypto.randomUUID();
      const path = `${yyyy}/${mm}/${fileUuid}.svg`;

      const { error: uploadError } = await supabase.storage
        .from('feedback-svgs')
        .upload(path, new Blob([text], { type: 'image/svg+xml' }), {
          contentType: 'image/svg+xml',
        });

      if (uploadError) {
        console.error('SVG upload failed:', uploadError);
      } else {
        svgStoragePath = path;
        svgSizeBytes = file.size;
      }
    }

    const { data, error: insertError } = await supabase
      .from('feedback')
      .insert({
        sentiment,
        issue_tags: issueTags,
        description,
        svg_storage_path: svgStoragePath,
        svg_size_bytes: svgSizeBytes,
        mode,
        format,
        quality: context.quality,
        width: context.width,
        height: context.height,
        background: context.background,
        scale: context.scale,
        locale: context.locale,
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        ip_hash: ipHash,
        client_id: clientId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('DB insert failed:', insertError);
      return json(500, { ok: false, error: 'internal_error' });
    }

    return json(200, { ok: true, id: data.id });
  } catch (err) {
    console.error('Feedback API error:', err);
    return json(500, { ok: false, error: 'internal_error' });
  }
}

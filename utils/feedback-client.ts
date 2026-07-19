const STORAGE_KEY = 'svgcodetopng:feedback';
const MAX_SVG_SIZE = 512 * 1024;

interface FeedbackState {
  client_id: string;
  conversion_count: number;
  last_feedback_at: number | null;
  dismissed_count: number;
  dont_show_again: boolean;
  cooldown_until: number | null;
}

interface ConversionContext {
  mode: 'svg' | 'html';
  format: string;
  quality: number;
  width: number;
  height: number;
  background: string;
  scale: number;
  locale: string;
}

function generateClientId(): string {
  return crypto.randomUUID();
}

function getStoredState(): FeedbackState {
  if (typeof window === 'undefined') {
    return {
      client_id: generateClientId(),
      conversion_count: 0,
      last_feedback_at: null,
      dismissed_count: 0,
      dont_show_again: false,
      cooldown_until: null,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    client_id: generateClientId(),
    conversion_count: 0,
    last_feedback_at: null,
    dismissed_count: 0,
    dont_show_again: false,
    cooldown_until: null,
  };
}

function saveState(state: FeedbackState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getFeedbackState(): FeedbackState {
  return getStoredState();
}

export function incrementConversionCount(): void {
  const state = getStoredState();
  state.conversion_count += 1;
  saveState(state);
}

export function shouldShowFeedback(): boolean {
  const state = getStoredState();
  if (state.dont_show_again) return false;
  if (state.cooldown_until && Date.now() < state.cooldown_until) return false;

  // 短期冲量：只要没被"关闭冷却"或"不再提示"拦住，每次下载成功都弹反馈卡片
  return true;
}

export function resetConversionCount(): void {
  const state = getStoredState();
  state.conversion_count = 0;
  saveState(state);
}

export function markPositiveFeedback(): void {
  const state = getStoredState();
  state.last_feedback_at = Date.now();
  state.cooldown_until = Date.now() + 7 * 24 * 60 * 60 * 1000;
  state.conversion_count = 0;
  saveState(state);
}

export function markNegativeFeedback(): void {
  const state = getStoredState();
  state.last_feedback_at = Date.now();
  state.cooldown_until = Date.now() + 14 * 24 * 60 * 60 * 1000;
  state.conversion_count = 0;
  saveState(state);
}

export function markDismissed(): void {
  const state = getStoredState();
  state.dismissed_count += 1;
  state.cooldown_until = Date.now() + 24 * 60 * 60 * 1000;
  saveState(state);
}

export function markDontShowAgain(): void {
  const state = getStoredState();
  state.dont_show_again = true;
  saveState(state);
}

export async function submitFeedback(params: {
  sentiment: 'positive' | 'negative';
  issueTags?: string[];
  description?: string;
  svgCode?: string;
  context: ConversionContext;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const state = getStoredState();
  const form = new FormData();

  form.append('sentiment', params.sentiment);
  form.append('context', JSON.stringify(params.context));
  form.append('client_id', state.client_id);

  if (params.sentiment === 'negative') {
    if (params.issueTags && params.issueTags.length > 0) {
      form.append('issue_tags', JSON.stringify(params.issueTags));
    }
    if (params.description) {
      form.append('description', params.description);
    }
    if (params.svgCode) {
      const svgBlob = new Blob([params.svgCode], { type: 'image/svg+xml' });
      if (svgBlob.size <= MAX_SVG_SIZE) {
        form.append('svg_file', svgBlob, 'your-svg.svg');
      }
    }
  }

  try {
    const res = await fetch('/api/feedback/', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();

    if (res.ok) {
      if (params.sentiment === 'positive') {
        markPositiveFeedback();
      } else {
        markNegativeFeedback();
      }
      return { ok: true, id: data.id };
    }

    return { ok: false, error: data.error || 'unknown_error' };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

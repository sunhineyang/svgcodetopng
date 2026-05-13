import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../../utils/ai-svg/prompts';
import { extractSvgCode, cleanSvgCode } from '../../../utils/ai-svg/extractor';
import { validateSvgSyntax } from '../../../utils/ai-svg/validator';
import { ErrorType } from '../../../utils/ai-svg/types';
import { AI_CONFIG } from '../../../utils/ai-svg/constants';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const IS_DEV = process.env.NODE_ENV === 'development';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const DEEPSEEK_ERROR_MAP: Record<string, { code: ErrorType; suggestion: string }> = {
  '402': { code: 'RATE_LIMIT', suggestion: 'Your DeepSeek balance is insufficient. Please top up your account.' },
  '429': { code: 'RATE_LIMIT', suggestion: 'Too many requests. Please wait a moment and try again.' },
  '503': { code: 'AI_ERROR', suggestion: 'DeepSeek service is temporarily unavailable. Please try again later.' },
  'Timeout': { code: 'TIMEOUT', suggestion: 'The AI service took too long to respond. Please try a simpler request.' },
};

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY is not configured');

      if (IS_DEV) {
        return NextResponse.json({
          success: false,
          error: 'DEEPSEEK_API_KEY is not configured',
          code: 'AI_ERROR' as ErrorType,
          suggestion: 'Add DEEPSEEK_API_KEY to your .env.local file',
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        error: 'Service temporarily unavailable',
        code: 'AI_ERROR' as ErrorType,
        suggestion: 'Please try again later',
      }, { status: 503 });
    }

    const body = await request.json();
    const { conversationHistory, currentSvgCode, userIntent } = body;

    if (!currentSvgCode || !userIntent) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: currentSvgCode or userIntent',
        code: 'AI_ERROR' as ErrorType,
        suggestion: 'Please provide SVG code and your request',
      }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(conversationHistory || [], currentSvgCode, userIntent);

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

    const response = await fetch(`${AI_CONFIG.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages,
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = String(response.status);
      const mapped = DEEPSEEK_ERROR_MAP[status];
      if (mapped) {
        return NextResponse.json({
          success: false,
          error: `DeepSeek API returned status ${status}`,
          code: mapped.code,
          suggestion: mapped.suggestion,
        }, { status: response.status });
      }

      let errorBody = '';
      try { errorBody = await response.text(); } catch {}
      console.error(`DeepSeek API error (${response.status}):`, errorBody);

      return NextResponse.json({
        success: false,
        error: `DeepSeek API error: ${response.status}`,
        code: 'AI_ERROR' as ErrorType,
        suggestion: 'Please try again later',
      }, { status: response.status });
    }

    const data = await response.json();

    const rawResponse: string = data.choices?.[0]?.message?.content || '';

    if (!rawResponse) {
      return NextResponse.json({
        success: false,
        error: 'Empty response from DeepSeek',
        code: 'AI_ERROR' as ErrorType,
        suggestion: 'Please try a different request or try again',
      }, { status: 500 });
    }

    const extractedSvg = extractSvgCode(rawResponse);

    if (!extractedSvg) {
      return NextResponse.json({
        success: false,
        error: 'Failed to extract SVG from AI response',
        code: 'EXTRACTION_FAILED' as ErrorType,
        suggestion: 'Please try a different request',
        rawResponse,
      }, { status: 500 });
    }

    const cleanedSvg = cleanSvgCode(extractedSvg);

    const syntaxValidation = validateSvgSyntax(cleanedSvg);
    if (!syntaxValidation.isValid) {
      console.error('SVG syntax validation failed:', syntaxValidation.issues);
      return NextResponse.json({
        success: false,
        error: 'AI generated invalid SVG code',
        code: 'SVG_SYNTAX_ERROR' as ErrorType,
        issues: syntaxValidation.issues,
        suggestion: 'Try simplifying your request',
        rawResponse,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      svgCode: cleanedSvg,
      rawResponse,
    });

  } catch (error: any) {
    console.error('AI API error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: 'Request timed out',
        code: 'TIMEOUT' as ErrorType,
        suggestion: 'The AI service took too long. Please try a simpler request.',
      }, { status: 504 });
    }

    return NextResponse.json({
      success: false,
      error: IS_DEV ? (error.message || 'Internal server error') : 'Internal server error',
      code: 'NETWORK_ERROR' as ErrorType,
      suggestion: 'Please try again',
    }, { status: 500 });
  }
}

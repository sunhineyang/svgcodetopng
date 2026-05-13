import { SVG_LIMITS } from './constants';
import { ConversationTurn } from './types';

export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const calculateTotalTokens = (
  svgCode: string,
  conversationHistory: ConversationTurn[]
): number => {
  let total = estimateTokens(svgCode);

  for (const turn of conversationHistory.slice(-SVG_LIMITS.MAX_CONVERSATION_TURNS)) {
    total += estimateTokens(turn.content);
  }

  total += 500;

  return total;
};

export const isWithinTokenLimit = (
  svgCode: string,
  conversationHistory: ConversationTurn[]
): { within: boolean; estimated: number; limit: number } => {
  const estimated = calculateTotalTokens(svgCode, conversationHistory);
  const within = estimated <= SVG_LIMITS.MAX_TOTAL_TOKENS;

  return {
    within,
    estimated,
    limit: SVG_LIMITS.MAX_TOTAL_TOKENS,
  };
};

export const trimConversationHistory = (
  history: ConversationTurn[],
  maxLength: number = SVG_LIMITS.MAX_CONVERSATION_TURNS
): ConversationTurn[] => {
  if (history.length <= maxLength) {
    return history;
  }

  return history.slice(-maxLength);
};

export const truncateSvgCode = (
  svgCode: string,
  maxLength: number = SVG_LIMITS.MAX_SVG_LENGTH
): string => {
  if (svgCode.length <= maxLength) {
    return svgCode;
  }

  const frontLength = Math.floor(maxLength * 0.6);
  const backLength = Math.floor(maxLength * 0.4);

  const front = svgCode.substring(0, frontLength);
  const back = svgCode.substring(svgCode.length - backLength);

  return `${front}\n<!-- ... content truncated ... -->\n${back}`;
};

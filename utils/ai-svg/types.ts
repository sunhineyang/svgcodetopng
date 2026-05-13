export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  svgSnapshot?: string;
}

export interface SvgVersion {
  id: string;
  code: string;
  timestamp: number;
  description: string;
  isCurrent: boolean;
  isAiModified: boolean;
}

export interface SvgDiff {
  added: DiffElement[];
  removed: DiffElement[];
  modified: DiffModification[];
}

export interface DiffElement {
  type: string;
  index: number;
  raw: string;
  properties: Record<string, any>;
}

export interface DiffModification {
  element: string;
  index: number;
  property: string;
  oldValue: any;
  newValue: any;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  rawResponse?: string;
}

export interface QuickPrompt {
  label: string;
  icon?: string;
  prompt: string;
  category: string;
}

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
}

export type ErrorType =
  | 'SVG_TOO_LONG'
  | 'SVG_SYNTAX_ERROR'
  | 'EXTRACTION_FAILED'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'AI_ERROR';

export interface AiApiRequest {
  conversationHistory: ConversationTurn[];
  currentSvgCode: string;
  userIntent: string;
}

export interface AiApiResponse {
  success: boolean;
  svgCode?: string;
  rawResponse?: string;
  error?: string;
  code?: ErrorType;
  issues?: string[];
  suggestion?: string;
}

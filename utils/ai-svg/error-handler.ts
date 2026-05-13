import { ERROR_MESSAGES } from './constants';
import { ErrorType, ErrorInfo } from './types';

export const getErrorInfo = (errorType: ErrorType): ErrorInfo => {
  const errorConfig = ERROR_MESSAGES[errorType];
  const canRetry = !['SVG_TOO_LONG'].includes(errorType);

  return {
    type: errorType,
    ...errorConfig,
    canRetry,
  };
};

export const parseNetworkError = (error: Error): ErrorInfo => {
  if (error.message.includes('timeout')) {
    return getErrorInfo('TIMEOUT');
  }

  if (error.message.includes('fetch') || error.message.includes('network')) {
    return getErrorInfo('NETWORK_ERROR');
  }

  return getErrorInfo('AI_ERROR');
};

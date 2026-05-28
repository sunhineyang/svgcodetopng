'use client';

import FeedbackProvider from './FeedbackProvider';

export default function FeedbackProviderWrapper({ children }: { children: React.ReactNode }) {
  return <FeedbackProvider>{children}</FeedbackProvider>;
}

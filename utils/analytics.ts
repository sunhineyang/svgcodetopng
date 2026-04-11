declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', action: string, params?: any) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Analytics error:', error);
    }
  }
};

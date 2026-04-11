interface Window {
  gtag?: (
    command: 'event' | 'config' | 'js',
    action: string,
    params?: any
  ) => void;
  dataLayer?: any[];
}

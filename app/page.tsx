import { redirect } from 'next/navigation';

// Root page redirects to default locale (English)
export default function RootPage() {
  redirect('/en');
}
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to Onboarding by default for this specialized Revenue Platform application
  redirect('/onboarding');
}

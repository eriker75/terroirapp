import TerminosPage from '@/components/pages/TerminosPage';
import { useRouter } from 'expo-router';

export default function AuthTerminosScreen() {
  const router = useRouter();

  return (
    <TerminosPage
      showBackButton={true}
      useSafeArea={false}
      onBack={() => router.back()}
    />
  );
}

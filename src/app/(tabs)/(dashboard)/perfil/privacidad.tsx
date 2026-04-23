import PrivacidadPage from '@/components/pages/PrivacidadPage';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <PrivacidadPage
      showBackButton={true}
      useSafeArea={false}
      onBack={() => router.push('/(tabs)/perfil')}
    />
  );
}

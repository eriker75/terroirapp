import PreferenciasPage from '@/components/pages/PreferenciasPage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <PreferenciasPage
      showBackButton={true}
      useSafeArea={false}
      onBack={() => router.push('/(tabs)/perfil')}
    />
  );
}

import TarjetasPage from '@/components/pages/TarjetasPage';
import { useRouter } from 'expo-router';

export default function CardsScreen() {
  const router = useRouter();

  return (
    <TarjetasPage
      showBackButton={true}
      onBack={() => router.push('/(tabs)/perfil')}
    />
  );
}

import FavoritosPage from '@/components/pages/FavoritosPage';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();

  return (
    <FavoritosPage
      showBackButton={true}
      onBack={() => router.push('/(tabs)/perfil')}
    />
  );
}

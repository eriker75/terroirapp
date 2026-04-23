import DireccionesPage from '@/components/pages/DireccionesPage';
import { useRouter } from 'expo-router';

export default function AddressesScreen() {
  const router = useRouter();

  return (
    <DireccionesPage
      showBackButton={true}
      onBack={() => router.push('/(tabs)/perfil')}
    />
  );
}

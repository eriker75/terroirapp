import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileQuery } from '@/services';

export default function PerfilLayout() {
  // Hidrata el perfil completo del usuario (teléfono, dirección, etc. que el
  // login no devuelve) y lo sincroniza en el store al entrar a la cuenta.
  useProfileQuery();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="editar" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="direcciones" />
        <Stack.Screen name="tarjetas" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="privacidad" />
        <Stack.Screen name="ordenes" />
        <Stack.Screen name="ordenes/[id]" />
        <Stack.Screen name="cambiar-password" />
      </Stack>
    </SafeAreaView>
  );
}

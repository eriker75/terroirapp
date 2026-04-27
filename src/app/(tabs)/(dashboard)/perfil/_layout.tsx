import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilLayout() {
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

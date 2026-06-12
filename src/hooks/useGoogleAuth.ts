import { useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useGoogleLoginMutation } from '@/services/auth/auth.service';

// Client IDs OAuth de Google (Google Cloud Console). El `webClientId` es
// imprescindible: hace que signIn() devuelva un id_token cuyo `aud` es ese client
// ID (el que verifica el backend). El `iosClientId` es el cliente iOS nativo.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Configuración global del SDK (una sola vez). Si falta el webClientId, se omite:
// el botón mostrará un error claro en vez de romper la app.
if (WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    // Pedimos sólo lo básico; con esto basta para obtener el id_token.
    scopes: ['email', 'profile'],
  });
}

/**
 * Inicio de sesión con Google en móvil (SDK nativo @react-native-google-signin,
 * igual que el ejemplo helloapp). Abre la hoja de Google, obtiene el id_token y
 * lo canjea en nuestro backend (POST /users/google), integrándose con el mismo
 * sistema de tokens que el login normal (ver useGoogleLoginMutation → persistAuth).
 *
 * Requiere un dev/standalone build (no funciona en Expo Go por ser módulo nativo).
 */
export function useGoogleAuth() {
  const { mutateAsync } = useGoogleLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (): Promise<boolean> => {
    setError(null);

    if (!WEB_CLIENT_ID) {
      setError('Login con Google no configurado');
      return false;
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        // Incluye el caso de cancelación del usuario.
        return false;
      }

      // Canjea el id_token por nuestra sesión (persiste tokens + perfil).
      await mutateAsync(response.data.idToken);
      return true;
    } catch (e) {
      if (isErrorWithCode(e)) {
        switch (e.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            return false; // cancelación silenciosa
          case statusCodes.IN_PROGRESS:
            setError('Inicio de sesión en progreso');
            return false;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError('Google Play Services no está disponible');
            return false;
          default:
            // DEVELOPER_ERROR = la firma (SHA-1) del APK instalado no coincide
            // con ningún OAuth client Android del proyecto de Google (los
            // builds de EAS y los locales firman con keystores distintos →
            // huellas distintas; cada una necesita su client en la consola).
            console.error('[google-auth] error', e.code, e.message);
            setError(`No se pudo iniciar sesión con Google (${e.code})`);
            return false;
        }
      }
      setError(
        e instanceof Error ? e.message : 'No se pudo iniciar sesión con Google',
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}

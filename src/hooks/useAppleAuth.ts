import { useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleLoginMutation } from '@/services/auth/auth.service';

/**
 * Inicio de sesión con Apple en móvil (expo-apple-authentication). Sólo iOS 13+.
 * Abre la hoja nativa de Apple, obtiene el identity_token y lo canjea en nuestro
 * backend (POST /users/apple), integrándose con el mismo sistema de tokens que el
 * login normal (ver useAppleLoginMutation → persistAuth).
 *
 * El nombre llega SÓLO en el primer inicio de sesión (Apple no lo reenvía después);
 * lo mandamos al backend para guardarlo al crear la cuenta.
 *
 * Requiere un dev/standalone build con la entitlement de Apple (usesAppleSignIn).
 */
export function useAppleAuth() {
  const { mutateAsync } = useAppleLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apple sólo está disponible en iOS. La UI ya oculta el botón en Android.
  const isAvailable = Platform.OS === 'ios';

  const signIn = async (): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError('No se obtuvo el token de Apple');
        return false;
      }

      await mutateAsync({
        identityToken: credential.identityToken,
        firstName: credential.fullName?.givenName ?? undefined,
        lastName: credential.fullName?.familyName ?? undefined,
      });
      return true;
    } catch (e) {
      // El usuario canceló la hoja de Apple: no es un error que mostrar.
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        return false;
      }
      setError(
        e instanceof Error ? e.message : 'No se pudo iniciar sesión con Apple',
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error, isAvailable };
}

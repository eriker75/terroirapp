import axios from 'axios';
import { API_URL } from '@/config/baseUrl';
import { tokenStorage } from '@/store/useTokenStorage';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';

/**
 * Cierra la sesión del usuario:
 * 1. Revoca el refresh token en el backend (best-effort). Usa axios directo (sin
 *    el interceptor de `api`) para no entrar en recursión cuando signOut se llama
 *    justamente porque el refresh falló.
 * 2. Borra ambos tokens del almacenamiento seguro.
 * 3. Limpia el perfil, la wishlist y las notificaciones (datos del usuario).
 *    El carrito se conserva como carrito invitado, igual que en la web.
 */
export async function signOut(): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    tokenStorage.getAccessToken(),
    tokenStorage.getRefreshToken(),
  ]);

  if (refreshToken) {
    try {
      await axios.post(
        `${API_URL}/users/logout`,
        { refreshToken },
        accessToken
          ? { headers: { Authorization: `Bearer ${accessToken}` } }
          : undefined,
      );
    } catch {
      // Best-effort: si el backend ya rechazó el token, el refresh expira solo.
    }
  }

  await tokenStorage.clear();
  useProfileStore.getState().clearProfile();
  useAuthStore.getState().reset();
  useWishlistStore.getState().clearWishlist();
  useNotificationsStore.getState().clearAll();
}

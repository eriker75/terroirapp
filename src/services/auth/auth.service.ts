import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  loginRequest,
  registerRequest,
  getProfileRequest,
  updateProfileRequest,
  changePasswordRequest,
} from '@/requests/auth/auth.requests';
import { tokenStorage } from '@/store/useTokenStorage';
import { signOut } from '@/store/signOut';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { QUERY_KEYS } from '@/config/queryKeys';
import type {
  LoginRequestDto,
  RegisterRequestDto,
  UpdateProfileRequestDto,
} from '@/dtos/auth/auth.request.dto';
import type { AuthResponseDto } from '@/dtos/auth/auth.response.dto';
import type { UserProfile } from '@/types/auth.types';

/**
 * Persiste la sesión devuelta por login/register: guarda el par de tokens en el
 * almacenamiento seguro y marca al usuario como autenticado. La hidratación del
 * carrito/wishlist del servidor la disparan sus respectivas queries al volverse
 * `enabled` tras quedar autenticado.
 */
async function persistAuth(data: AuthResponseDto): Promise<void> {
  await tokenStorage.setTokens(data.accessToken, data.refreshToken);
  useProfileStore.getState().setUser(data.user);
  useAuthStore.getState().setAuthenticated(true);
}

export function useLoginMutation() {
  return useMutation<AuthResponseDto, AxiosError, LoginRequestDto>({
    mutationFn: loginRequest,
    onSuccess: persistAuth,
  });
}

export function useRegisterMutation() {
  return useMutation<AuthResponseDto, AxiosError, RegisterRequestDto>({
    mutationFn: registerRequest,
    onSuccess: persistAuth,
  });
}

export function useLogoutMutation() {
  return useMutation<void, AxiosError, void>({
    mutationFn: signOut,
  });
}

/**
 * Trae el perfil completo del usuario autenticado (`GET /users/:id`, que incluye
 * teléfono, dirección, etc. que login no devuelve) y lo sincroniza en el store
 * persistido. Solo se activa con sesión iniciada.
 */
export function useProfileQuery() {
  const user = useProfileStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<UserProfile, AxiosError>({
    queryKey: QUERY_KEYS.AUTH.PROFILE(user?.id ?? ''),
    queryFn: async () => {
      const profile = await getProfileRequest(user!.id);
      useProfileStore.getState().setUser(profile);
      return profile;
    },
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useUpdateProfileMutation() {
  return useMutation<UserProfile, AxiosError, UpdateProfileRequestDto>({
    mutationFn: (dto) => {
      const user = useProfileStore.getState().user;
      if (!user) throw new Error('No hay sesión iniciada');
      return updateProfileRequest(user.id, dto);
    },
    onSuccess: (data) => {
      useProfileStore.getState().setUser(data);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation<{ success: true }, AxiosError, { currentPassword: string; newPassword: string }>({
    mutationFn: (dto) => {
      const user = useProfileStore.getState().user;
      if (!user) throw new Error('No hay sesión iniciada');
      return changePasswordRequest(user.id, dto);
    },
  });
}

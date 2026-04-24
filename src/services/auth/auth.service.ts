import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { loginRequest, registerRequest, getProfileRequest, updateProfileRequest } from '@/requests/auth/auth.requests';
import { tokenStorage } from '@/store/useTokenStorage';
import { signOut } from '@/store/signOut';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { LoginRequestDto, RegisterRequestDto, UpdateProfileRequestDto } from '@/dtos/auth/auth.request.dto';
import type { AuthResponseDto } from '@/dtos/auth/auth.response.dto';
import type { UserProfile } from '@/types/auth.types';

export function useLoginMutation() {
  return useMutation<AuthResponseDto, AxiosError, LoginRequestDto>({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      await tokenStorage.setAccessToken(data.accessToken);
      useProfileStore.getState().setUser(data.user);
      useAuthStore.getState().setAuthenticated(true);
    },
  });
}

export function useRegisterMutation() {
  return useMutation<AuthResponseDto, AxiosError, RegisterRequestDto>({
    mutationFn: registerRequest,
    onSuccess: async (data) => {
      await tokenStorage.setAccessToken(data.accessToken);
      useProfileStore.getState().setUser(data.user);
      useAuthStore.getState().setAuthenticated(true);
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onMutate: () => signOut(),
  });
}

export function useProfileQuery() {
  const user = useProfileStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<UserProfile, AxiosError>({
    queryKey: QUERY_KEYS.AUTH.PROFILE(user?.id ?? ''),
    queryFn: () => getProfileRequest(user!.id),
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useUpdateProfileMutation() {
  const user = useProfileStore((s) => s.user);

  return useMutation<UserProfile, AxiosError, UpdateProfileRequestDto>({
    mutationFn: (dto) => updateProfileRequest(user!.id, dto),
    onSuccess: (data) => {
      useProfileStore.getState().setUser(data);
    },
  });
}

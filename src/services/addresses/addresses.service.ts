import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getUserAddressesRequest,
  getAddressRequest,
  createAddressRequest,
  updateAddressRequest,
  deleteAddressRequest,
} from '@/requests/addresses/addresses.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { CreateAddressRequestDto, UpdateAddressRequestDto } from '@/dtos/addresses/addresses.request.dto';
import type { AddressResponseDto } from '@/dtos/addresses/addresses.response.dto';

// Direcciones guardadas del usuario autenticado (embebidas en su perfil).
export function useAddressesQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<AddressResponseDto[], AxiosError>({
    queryKey: QUERY_KEYS.ADDRESSES.USER(userId ?? ''),
    queryFn: () => getUserAddressesRequest(userId!),
    enabled: isAuthenticated && !!userId,
  });
}

export function useAddressQuery(id: string) {
  return useQuery<AddressResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.ADDRESSES.DETAIL(id),
    queryFn: () => getAddressRequest(id),
    enabled: !!id,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<AddressResponseDto, AxiosError, CreateAddressRequestDto>({
    mutationFn: createAddressRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.USER(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.LIST() });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<AddressResponseDto, AxiosError, { id: string; dto: UpdateAddressRequestDto }>({
    mutationFn: ({ id, dto }) => updateAddressRequest(id, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.ADDRESSES.DETAIL(data.id), data);
      // La lista del usuario también cambia (p. ej. isDefault desmarca a las demás).
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.USER(userId) });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<AddressResponseDto, AxiosError, string>({
    mutationFn: deleteAddressRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.LIST() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.USER(userId) });
    },
  });
}

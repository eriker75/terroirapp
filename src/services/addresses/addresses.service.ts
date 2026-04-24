import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getAddressRequest,
  createAddressRequest,
  updateAddressRequest,
  deleteAddressRequest,
} from '@/requests/addresses/addresses.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { CreateAddressRequestDto, UpdateAddressRequestDto } from '@/dtos/addresses/addresses.request.dto';
import type { AddressResponseDto } from '@/dtos/addresses/addresses.response.dto';

export function useAddressQuery(id: string) {
  return useQuery<AddressResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.ADDRESSES.DETAIL(id),
    queryFn: () => getAddressRequest(id),
    enabled: !!id,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddressResponseDto, AxiosError, CreateAddressRequestDto>({
    mutationFn: createAddressRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.LIST() }),
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddressResponseDto, AxiosError, { id: string; dto: UpdateAddressRequestDto }>({
    mutationFn: ({ id, dto }) => updateAddressRequest(id, dto),
    onSuccess: (data) => queryClient.setQueryData(QUERY_KEYS.ADDRESSES.DETAIL(data.id), data),
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddressResponseDto, AxiosError, string>({
    mutationFn: deleteAddressRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.LIST() }),
  });
}

import { api } from '@/config/api';
import type { CreateAddressRequestDto, UpdateAddressRequestDto } from '@/dtos/addresses/addresses.request.dto';
import type { AddressResponseDto } from '@/dtos/addresses/addresses.response.dto';

// El backend no expone "listar mis direcciones"; vienen embebidas en el perfil
// (`GET /api/users/:id` → { ..., addresses: Address[] }).
export const getUserAddressesRequest = (userId: string): Promise<AddressResponseDto[]> =>
  api
    .get<{ addresses?: AddressResponseDto[] }>(`/users/${userId}`)
    .then((r) => r.data.addresses ?? []);

export const getAddressRequest = (id: string): Promise<AddressResponseDto> =>
  api.get<AddressResponseDto>(`/addresses/${id}`).then((r) => r.data);

export const createAddressRequest = (dto: CreateAddressRequestDto): Promise<AddressResponseDto> =>
  api.post<AddressResponseDto>('/addresses', dto).then((r) => r.data);

export const updateAddressRequest = (id: string, dto: UpdateAddressRequestDto): Promise<AddressResponseDto> =>
  api.patch<AddressResponseDto>(`/addresses/${id}`, dto).then((r) => r.data);

export const deleteAddressRequest = (id: string): Promise<AddressResponseDto> =>
  api.delete<AddressResponseDto>(`/addresses/${id}`).then((r) => r.data);

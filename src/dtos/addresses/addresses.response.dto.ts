import type { Address } from '@/types/address.types';
import type { PaginatedResponse } from '@/types/api.types';

export type AddressResponseDto = Address;
export type AddressesResponseDto = PaginatedResponse<Address>;

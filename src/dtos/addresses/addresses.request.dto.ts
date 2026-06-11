export interface CreateAddressRequestDto {
  userId: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  label?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export type UpdateAddressRequestDto = Partial<Omit<CreateAddressRequestDto, 'userId'>>;

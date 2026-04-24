export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  avatar?: string;
}

export interface UpdateProfileRequestDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

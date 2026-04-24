import { api } from '@/config/api';
import type { LoginRequestDto, RegisterRequestDto, UpdateProfileRequestDto } from '@/dtos/auth/auth.request.dto';
import type { AuthResponseDto } from '@/dtos/auth/auth.response.dto';
import type { UserProfile } from '@/types/auth.types';

export const loginRequest = (dto: LoginRequestDto): Promise<AuthResponseDto> => {
  console.log(`[Mock Frontend] Simulando login para:`, dto.email);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'mock_token_123',
        user: {
          id: 'user_123',
          email: dto.email,
          firstName: 'Usuario',
          lastName: 'Demo',
          role: 'customer',
          status: 'active',
          loyaltyLevel: 'silver',
          loyaltyPoints: 120,
          memberSince: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: ''
        },
      });
    }, 1000);
  });
};

export const registerRequest = (dto: RegisterRequestDto): Promise<AuthResponseDto> => {
  console.log(`[Mock Frontend] Simulando registro para:`, dto.email);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'mock_token_123',
        user: {
          id: 'user_123',
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'customer',
          status: 'active',
          loyaltyLevel: 'bronze',
          loyaltyPoints: 0,
          memberSince: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '04120327469',
          address: 'Av Intercomunal el valle',
          city: 'Caracas',
          state: 'Distrito Capital',
          zip: '1041',
          country: 'Venezuela'
        },
      });
    }, 1000);
  });
};

export const getProfileRequest = (id: string): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        email: 'demo@terroir.com',
        firstName: 'Usuario',
        lastName: 'Demo',
        role: 'customer',
        status: 'active',
        loyaltyLevel: 'silver',
        loyaltyPoints: 120,
        memberSince: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 500);
  });
};

export const updateProfileRequest = (id: string, dto: UpdateProfileRequestDto): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        email: dto.email || 'demo@terroir.com',
        firstName: dto.firstName || 'Usuario',
        lastName: dto.lastName || 'Demo',
        role: 'customer',
        status: 'active',
        loyaltyLevel: 'silver',
        loyaltyPoints: 120,
        memberSince: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 1000);
  });
};

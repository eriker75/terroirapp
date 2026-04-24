import type { UserProfile } from '@/types/auth.types';

export interface AuthResponseDto {
  user: UserProfile;
  accessToken: string;
}

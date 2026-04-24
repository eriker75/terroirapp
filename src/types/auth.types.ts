export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyPoints?: number;
  memberSince?: string;
  createdAt: string;
  updatedAt: string;
}

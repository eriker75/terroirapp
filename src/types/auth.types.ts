export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'inactive';
// Segmento comercial: B2C (minorista, con puntos) o B2B (mayorista, precio
// mayorista, sin puntos). Distinto de `role`, que son permisos.
export type AccountType = 'B2C' | 'B2B';

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
  accountType?: AccountType;
  birthDate?: string;
  loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyPoints?: number;
  memberSince?: string;
  createdAt: string;
  updatedAt: string;
}

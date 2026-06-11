export interface Address {
  id: string;
  userId: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

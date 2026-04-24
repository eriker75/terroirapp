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
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

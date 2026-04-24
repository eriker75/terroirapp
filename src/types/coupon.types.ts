export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  amount: number;
  isActive: boolean;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

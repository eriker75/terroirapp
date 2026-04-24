import type { Coupon } from '@/types/coupon.types';
import type { PaginatedResponse } from '@/types/api.types';

export type CouponResponseDto = Coupon;
export type CouponsResponseDto = PaginatedResponse<Coupon>;

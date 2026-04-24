import { api } from '@/config/api';
import type { GetCouponsQueryDto } from '@/dtos/coupons/coupons.request.dto';
import type { CouponsResponseDto, CouponResponseDto } from '@/dtos/coupons/coupons.response.dto';

export const getCouponsRequest = (query?: GetCouponsQueryDto): Promise<CouponsResponseDto> =>
  api.get<CouponsResponseDto>('/coupons', { params: query }).then((r) => r.data);

export const getCouponByIdRequest = (id: string): Promise<CouponResponseDto> =>
  api.get<CouponResponseDto>(`/coupons/${id}`).then((r) => r.data);

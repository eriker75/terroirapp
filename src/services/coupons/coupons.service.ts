import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getCouponsRequest, getCouponByIdRequest } from '@/requests/coupons/coupons.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { GetCouponsQueryDto } from '@/dtos/coupons/coupons.request.dto';
import type { CouponsResponseDto, CouponResponseDto } from '@/dtos/coupons/coupons.response.dto';

export function useCouponsQuery(query?: GetCouponsQueryDto) {
  return useQuery<CouponsResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.COUPONS.LIST(query),
    queryFn: () => getCouponsRequest(query),
  });
}

export function useCouponQuery(id: string) {
  return useQuery<CouponResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.COUPONS.DETAIL(id),
    queryFn: () => getCouponByIdRequest(id),
    enabled: !!id,
  });
}

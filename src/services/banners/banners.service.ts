import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getBannersRequest, getBannerByIdRequest } from '@/requests/banners/banners.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { BannersResponseDto, BannerResponseDto } from '@/dtos/banners/banners.response.dto';

export function useBannersQuery() {
  return useQuery<BannersResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.BANNERS.LIST(),
    queryFn: getBannersRequest,
  });
}

export function useBannerQuery(id: string) {
  return useQuery<BannerResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.BANNERS.DETAIL(id),
    queryFn: () => getBannerByIdRequest(id),
    enabled: !!id,
  });
}

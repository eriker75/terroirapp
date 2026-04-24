import { api } from '@/config/api';
import type { BannersResponseDto, BannerResponseDto } from '@/dtos/banners/banners.response.dto';

export const getBannersRequest = (): Promise<BannersResponseDto> =>
  api.get<BannersResponseDto>('/banners').then((r) => r.data);

export const getBannerByIdRequest = (id: string): Promise<BannerResponseDto> =>
  api.get<BannerResponseDto>(`/banners/${id}`).then((r) => r.data);

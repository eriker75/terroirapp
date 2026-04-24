import type { Banner } from '@/types/banner.types';
import type { PaginatedResponse } from '@/types/api.types';

export type BannerResponseDto = Banner;
export type BannersResponseDto = PaginatedResponse<Banner>;

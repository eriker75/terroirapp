import { api } from '@/config/api';
import type {
  AddWishlistItemRequestDto,
  ReplaceWishlistItemsRequestDto,
} from '@/dtos/wishlist/wishlist.request.dto';
import type { WishlistResponseDto } from '@/dtos/wishlist/wishlist.response.dto';

const base = (userId: string) => `/wishlist/user/${userId}`;

export const getWishlistRequest = (userId: string): Promise<WishlistResponseDto> =>
  api.get<WishlistResponseDto>(base(userId)).then((r) => r.data);

export const addWishlistItemRequest = (userId: string, dto: AddWishlistItemRequestDto): Promise<WishlistResponseDto> =>
  api.post<WishlistResponseDto>(`${base(userId)}/items`, dto).then((r) => r.data);

export const replaceWishlistItemsRequest = (userId: string, dto: ReplaceWishlistItemsRequestDto): Promise<WishlistResponseDto> =>
  api.patch<WishlistResponseDto>(`${base(userId)}/items`, dto).then((r) => r.data);

export const removeWishlistItemRequest = (userId: string, productId: string): Promise<WishlistResponseDto> =>
  api.delete<WishlistResponseDto>(`${base(userId)}/items/${productId}`).then((r) => r.data);

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getWishlistRequest,
  addWishlistItemRequest,
  replaceWishlistItemsRequest,
  removeWishlistItemRequest,
} from '@/requests/wishlist/wishlist.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { AddWishlistItemRequestDto, ReplaceWishlistItemsRequestDto } from '@/dtos/wishlist/wishlist.request.dto';
import type { WishlistResponseDto } from '@/dtos/wishlist/wishlist.response.dto';

function useWishlistKey() {
  const userId = useProfileStore((s) => s.user?.id ?? '');
  return QUERY_KEYS.WISHLIST.USER(userId);
}

export function useWishlistQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<WishlistResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.WISHLIST.USER(userId ?? ''),
    queryFn: () => getWishlistRequest(userId!),
    enabled: isAuthenticated && !!userId,
  });
}

export function useAddWishlistItemMutation() {
  const queryClient = useQueryClient();
  const wishlistKey = useWishlistKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistResponseDto, AxiosError, AddWishlistItemRequestDto>({
    mutationFn: (dto) => addWishlistItemRequest(userId, dto),
    onSuccess: (data) => queryClient.setQueryData(wishlistKey, data),
  });
}

export function useReplaceWishlistItemsMutation() {
  const queryClient = useQueryClient();
  const wishlistKey = useWishlistKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistResponseDto, AxiosError, ReplaceWishlistItemsRequestDto>({
    mutationFn: (dto) => replaceWishlistItemsRequest(userId, dto),
    onSuccess: (data) => queryClient.setQueryData(wishlistKey, data),
  });
}

export function useRemoveWishlistItemMutation() {
  const queryClient = useQueryClient();
  const wishlistKey = useWishlistKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistResponseDto, AxiosError, string>({
    mutationFn: (productId) => removeWishlistItemRequest(userId, productId),
    onSuccess: (data) => queryClient.setQueryData(wishlistKey, data),
  });
}

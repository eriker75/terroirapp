import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getCartRequest,
  addToCartRequest,
  updateCartItemRequest,
  replaceCartItemsRequest,
  removeCartItemRequest,
  clearCartRequest,
  applyCouponRequest,
  removeCouponRequest,
} from '@/requests/cart/cart.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { QUERY_KEYS } from '@/config/queryKeys';
import type {
  AddToCartRequestDto,
  UpdateCartItemRequestDto,
  ReplaceCartItemsRequestDto,
  ApplyCouponRequestDto,
} from '@/dtos/cart/cart.request.dto';
import type { CartResponseDto } from '@/dtos/cart/cart.response.dto';

function useCartKey() {
  const userId = useProfileStore((s) => s.user?.id ?? '');
  return QUERY_KEYS.CART.USER(userId);
}

export function useCartQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<CartResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.CART.USER(userId ?? ''),
    queryFn: () => getCartRequest(userId!),
    enabled: isAuthenticated && !!userId,
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, AddToCartRequestDto>({
    mutationFn: (dto) => addToCartRequest(userId, dto),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, { productId: string; dto: UpdateCartItemRequestDto }>({
    mutationFn: ({ productId, dto }) => updateCartItemRequest(userId, productId, dto),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

export function useReplaceCartItemsMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, ReplaceCartItemsRequestDto>({
    mutationFn: (dto) => replaceCartItemsRequest(userId, dto),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, string>({
    mutationFn: (productId) => removeCartItemRequest(userId, productId),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: () => clearCartRequest(userId),
    onSuccess: () => queryClient.setQueryData(cartKey, null),
  });
}

export function useApplyCouponMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, ApplyCouponRequestDto>({
    mutationFn: (dto) => applyCouponRequest(userId, dto),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

export function useRemoveCouponMutation() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartResponseDto, AxiosError, void>({
    mutationFn: () => removeCouponRequest(userId),
    onSuccess: (data) => queryClient.setQueryData(cartKey, data),
  });
}

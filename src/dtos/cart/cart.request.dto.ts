export interface AddToCartRequestDto {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequestDto {
  quantity: number;
}

export interface ReplaceCartItemsRequestDto {
  items: Array<{ productId: string; quantity: number }>;
}

export interface ApplyCouponRequestDto {
  couponCode: string;
}

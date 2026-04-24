import { api } from '@/config/api';
import type {
  AddToCartRequestDto,
  UpdateCartItemRequestDto,
  ReplaceCartItemsRequestDto,
  ApplyCouponRequestDto,
} from '@/dtos/cart/cart.request.dto';
import type { CartResponseDto } from '@/dtos/cart/cart.response.dto';

const base = (userId: string) => `/cart/user/${userId}`;

let mockState: CartResponseDto = {
  id: 'cart_123',
  userId: 'user_123',
  items: [
    {
      id: 'cart_item_1',
      cartId: 'cart_123',
      productId: 'prod_1',
      quantity: 2,
      product: {
        id: 'prod_1',
        slug: 'cafe-origen-colombia',
        name: 'Café de Origen - Colombia',
        description: 'Delicioso café con notas a cacao y frutos rojos.',
        price: 15.99,
        stock: 50,
        status: 'active',
        images: ['https://via.placeholder.com/150'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categoryId: 'cat_1',
      } as any
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const getCartRequest = (userId: string): Promise<CartResponseDto> =>
  new Promise((res) => setTimeout(() => res(mockState), 500));

export const addToCartRequest = (userId: string, dto: AddToCartRequestDto): Promise<CartResponseDto> =>
  new Promise((res) => setTimeout(() => res(mockState), 500));

export const updateCartItemRequest = (userId: string, productId: string, dto: UpdateCartItemRequestDto): Promise<CartResponseDto> =>
  new Promise((res) => {
    setTimeout(() => {
      mockState = {
        ...mockState,
        items: mockState.items.map(i => i.productId === productId ? { ...i, quantity: dto.quantity } : i)
      };
      res(mockState);
    }, 500);
  });

export const replaceCartItemsRequest = (userId: string, dto: ReplaceCartItemsRequestDto): Promise<CartResponseDto> =>
  new Promise((res) => setTimeout(() => res(mockState), 500));

export const removeCartItemRequest = (userId: string, productId: string): Promise<CartResponseDto> =>
  new Promise((res) => {
    setTimeout(() => {
      mockState = {
        ...mockState,
        items: mockState.items.filter(i => i.productId !== productId)
      };
      res(mockState);
    }, 500);
  });

export const clearCartRequest = (userId: string): Promise<void> =>
  new Promise((res) => {
    setTimeout(() => {
      mockState = { ...mockState, items: [] };
      res();
    }, 500);
  });

export const applyCouponRequest = (userId: string, dto: ApplyCouponRequestDto): Promise<CartResponseDto> =>
  new Promise((res) => setTimeout(() => res(mockState), 500));

export const removeCouponRequest = (userId: string): Promise<CartResponseDto> =>
  new Promise((res) => setTimeout(() => res(mockState), 500));


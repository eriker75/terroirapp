export const QUERY_KEYS = {
  AUTH: {
    PROFILE: (id: string) => ['users', 'profile', id] as const,
  },
  PRODUCTS: {
    LIST: (params?: object) => ['products', 'list', params] as const,
    DETAIL: (id: string) => ['products', id] as const,
  },
  CATEGORIES: {
    LIST: (params?: object) => ['categories', 'list', params] as const,
    DETAIL: (id: string) => ['categories', id] as const,
  },
  TAGS: {
    LIST: (params?: object) => ['tags', 'list', params] as const,
    DETAIL: (id: string) => ['tags', id] as const,
  },
  CART: {
    USER: (userId: string) => ['cart', 'user', userId] as const,
  },
  WISHLIST: {
    USER: (userId: string) => ['wishlist', 'user', userId] as const,
  },
  ORDERS: {
    LIST: () => ['orders'] as const,
    DETAIL: (id: string) => ['orders', id] as const,
  },
  ADDRESSES: {
    LIST: () => ['addresses'] as const,
    DETAIL: (id: string) => ['addresses', id] as const,
  },
  COUPONS: {
    LIST: (params?: object) => ['coupons', 'list', params] as const,
    DETAIL: (id: string) => ['coupons', id] as const,
  },
  BANNERS: {
    LIST: (params?: object) => ['banners', 'list', params] as const,
    DETAIL: (id: string) => ['banners', id] as const,
  },
  NOTIFICATIONS: {
    LIST: () => ['notifications'] as const,
    DETAIL: (id: string) => ['notifications', id] as const,
  },
} as const;

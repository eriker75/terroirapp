import type { Category } from '@/types/category.types';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mainImage?: string;
  images: string[];
  stock: number;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

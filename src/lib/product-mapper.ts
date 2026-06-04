import type { ImageSourcePropType } from 'react-native';
import { BACKEND_URL } from '@/config/baseUrl';
import type { Product as CardProduct } from '@/data/products';

// Imagen de respaldo cuando el producto no trae imagen resoluble.
const PLACEHOLDER_IMAGE: ImageSourcePropType = require('@/assets/images/coffee-product-1.jpg');

// Imágenes "seed" del catálogo. El backend solo sirve estáticos bajo /uploads,
// así que las rutas seed (assets del public del frontend, p.ej. /products/x.jpg)
// no son alcanzables desde el móvil — pero el bundle ya trae esos mismos archivos.
// Las resolvemos por nombre de archivo a los assets locales. (Metro exige rutas
// literales en require, de ahí el mapa estático.)
const SEED_IMAGES: Record<string, ImageSourcePropType> = {
  'cappuccino.jpg': require('@/assets/images/cappuccino.jpg'),
  'coffee-filter.jpg': require('@/assets/images/coffee-filter.jpg'),
  'coffee-origin-1.jpg': require('@/assets/images/coffee-origin-1.jpg'),
  'coffee-origin-2.jpg': require('@/assets/images/coffee-origin-2.jpg'),
  'coffee-origin-3.jpg': require('@/assets/images/coffee-origin-3.jpg'),
  'coffee-process.jpg': require('@/assets/images/coffee-process.jpg'),
  'coffee-product-1.jpg': require('@/assets/images/coffee-product-1.jpg'),
  'coffee-product-2.jpg': require('@/assets/images/coffee-product-2.jpg'),
  'coffee-product-3.jpg': require('@/assets/images/coffee-product-3.jpg'),
  'coffee-product-4.jpg': require('@/assets/images/coffee-product-4.jpg'),
  'coffee-product-5.jpg': require('@/assets/images/coffee-product-5.jpg'),
  'ground-coffee.jpg': require('@/assets/images/ground-coffee.jpg'),
  'philosophy-coffee.jpg': require('@/assets/images/philosophy-coffee.jpg'),
  'product-espresso.jpg': require('@/assets/images/product-espresso.jpg'),
  'product-latte.jpg': require('@/assets/images/product-latte.jpg'),
  'caramel-latte.jpg': require('@/assets/images/products/caramel-latte.jpg'),
  'cold-brew-etiopia.jpg': require('@/assets/images/products/cold-brew-etiopia.jpg'),
  'cortado-miel.jpg': require('@/assets/images/products/cortado-miel.jpg'),
  'espresso-terroir.jpg': require('@/assets/images/products/espresso-terroir.jpg'),
};

// ── Shape del producto tal como lo devuelve el backend (Prisma → JSON) ────────
// `price`/`offerPrice` llegan como string (Decimal de Prisma serializado).
export interface BackendProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface BackendProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  price: string | number;
  offerPrice?: string | number | null;
  wholesalePrice?: string | number | null;
  visibility?: 'ALL' | 'RETAIL_ONLY' | 'WHOLESALE_ONLY';
  mainImage?: string | null;
  images?: string[];
  stock: number;
  pointsPrice?: number | null;
  pointsEarned?: number | null;
  categoryId?: string | null;
  category?: BackendProductCategory | null;
  attributes?: BackendProductAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

const ROAST_ATTR_NAMES = ['roast', 'tueste', 'tostado'];
const ORIGIN_ATTR_NAMES = ['origin', 'origen', 'procedencia'];
const VALID_ROASTS = ['light', 'medium', 'dark'] as const;

/**
 * Resuelve la imagen de un producto a una fuente que Image pueda renderizar:
 * - URLs absolutas (http…) → remota tal cual.
 * - /uploads/… (imágenes subidas por el admin) → remota servida por el backend.
 * - Rutas seed conocidas → asset local del bundle (ver SEED_IMAGES).
 * - Cualquier otra / sin imagen → placeholder local.
 */
function toImageSource(raw?: string | null): ImageSourcePropType {
  if (!raw) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(raw)) return { uri: raw };
  if (raw.startsWith('/uploads')) return { uri: `${BACKEND_URL}${raw}` };
  const basename = raw.split('/').pop() ?? '';
  return SEED_IMAGES[basename] ?? PLACEHOLDER_IMAGE;
}

function findAttr(
  attributes: BackendProductAttribute[] | undefined,
  names: string[],
): string | undefined {
  return attributes?.find((a) => names.includes(a.name.trim().toLowerCase()))?.value;
}

/** Deriva la categoría de UI (coffee/beverages/accessories) desde la del backend. */
function mapCategory(category?: BackendProductCategory | null): CardProduct['category'] {
  const ref = `${category?.slug ?? ''} ${category?.name ?? ''}`.toLowerCase();
  if (/(bebida|beverage|drink)/.test(ref)) return 'beverages';
  if (/(accesori|accessor)/.test(ref)) return 'accessories';
  return 'coffee';
}

/**
 * Convierte el producto del backend al shape que consume `ProductCard`
 * (`@/data/products`). Campos que el API no expone (rating/reviewCount) se
 * rellenan con valores neutros; el descuento se deriva del `offerPrice`.
 *
 * Nota: la card recalcula el precio final como price·(1−discount/100), así que
 * con descuentos no enteros puede haber una diferencia de céntimos respecto al
 * `offerPrice` exacto. Suficiente para el listado; si se necesitan precios de
 * oferta exactos, conviene que la card consuma `offerPrice` directamente.
 */
export function mapApiProductToCard(bp: BackendProduct): CardProduct {
  const price = Number(bp.price);
  const offer = bp.offerPrice != null ? Number(bp.offerPrice) : undefined;
  const hasOffer = offer != null && offer > 0 && offer < price;
  const discount = hasOffer ? Math.round((1 - offer / price) * 100) : undefined;

  const roastRaw = findAttr(bp.attributes, ROAST_ATTR_NAMES)?.toLowerCase();
  const roastLevel = VALID_ROASTS.includes(roastRaw as never)
    ? (roastRaw as CardProduct['roastLevel'])
    : undefined;

  return {
    id: bp.id,
    name: bp.name,
    description: bp.description ?? '',
    longDescription: bp.description ?? '',
    price,
    category: mapCategory(bp.category),
    roastLevel,
    origin: findAttr(bp.attributes, ORIGIN_ATTR_NAMES),
    rating: 0,
    reviewCount: 0,
    inStock: bp.stock > 0,
    stock: bp.stock,
    discount,
    image: toImageSource(bp.mainImage ?? bp.images?.[0]),
  };
}

export function mapApiProductsToCards(items: BackendProduct[]): CardProduct[] {
  return items.map(mapApiProductToCard);
}

/** Resuelve la imagen de un producto (mainImage o primera de images) a una
 * fuente renderizable. Reutilizable fuera del catálogo (p.ej. ítems de orden). */
export function resolveProductImageSource(
  mainImage?: string | null,
  images?: string[],
): ImageSourcePropType {
  return toImageSource(mainImage ?? images?.[0]);
}

/** Resuelve cualquier ruta de imagen del backend (http, /uploads, seed o vacía)
 * a una fuente renderizable. Genérico (categorías, banners, etc.). */
export function resolveImageSource(raw?: string | null): ImageSourcePropType {
  return toImageSource(raw);
}

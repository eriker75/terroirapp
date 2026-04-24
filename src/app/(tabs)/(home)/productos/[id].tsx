import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { ArrowLeft, Heart, ShoppingCart, Star, MapPin, Flame, Check } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { products } from '@/data/products';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

const { width } = Dimensions.get('window');

const ROAST_LABELS: Record<string, string> = {
  light: 'Tostado Claro',
  medium: 'Tostado Medio',
  dark: 'Tostado Oscuro',
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const addToCartAction = useCartStore((s) => s.addToCart);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const [addedToCart, setAddedToCart] = useState(false);
  const [qty, setQty] = useState(1);

  const inWishlist = product ? wishlistIds.includes(product.id) : false;

  if (!product) {
    return (
      <View style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Producto no encontrado</Text>
        </View>
      </View>
    );
  }

  const upsells = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCartAction(product, qty);
    setAddedToCart(true);
    setTimeout(() => router.push('/(tabs)/carrito'), 1200);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  const categoryLabel =
    product.category === 'coffee' ? 'Café' :
    product.category === 'beverages' ? 'Bebida' : 'Accesorio';

  const USD_TO_BS = 6.96;
  const hasDiscount = !!product.discount && product.discount > 0;
  const basePrice = product.price;
  const finalPrice = hasDiscount ? basePrice * (1 - product.discount! / 100) : basePrice;
  const points = Math.floor(finalPrice * 10);

  return (
    <View style={styles.safeArea}>
      {/* Floating back + wishlist */}
      <View style={styles.floatingBar}>
        <TouchableOpacity style={styles.floatingBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingBtn} onPress={handleToggleWishlist}>
          <Heart
            size={20}
            color={inWishlist ? COLORS.accent : COLORS.darkBrown}
            fill={inWishlist ? COLORS.accent : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={product.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          {product.discount && (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>-{product.discount}% OFERTA</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category + rating */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Star size={13} color={COLORS.yellow} fill={COLORS.yellow} />
              <Text style={styles.pointsText}>{points} pts</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.priceRow}>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${basePrice.toFixed(2)}
              </Text>
            )}
            <Text style={styles.price}>${finalPrice.toFixed(2)}</Text>
            <Text style={styles.pricebs}>Bs {(finalPrice * USD_TO_BS).toFixed(2)}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.origin && (
              <View style={styles.tag}>
                <MapPin size={11} color={COLORS.muted} />
                <Text style={styles.tagText}>{product.origin}</Text>
              </View>
            )}
            {product.roastLevel && (
              <View style={styles.tag}>
                <Flame size={11} color={COLORS.muted} />
                <Text style={styles.tagText}>{ROAST_LABELS[product.roastLevel]}</Text>
              </View>
            )}
            <View style={[styles.tag, product.inStock ? styles.tagGreen : styles.tagRed]}>
              <Text style={[styles.tagText, product.inStock ? styles.tagTextGreen : styles.tagTextRed]}>
                {product.inStock ? 'En stock' : 'Sin stock'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.longDesc}>{product.longDescription}</Text>
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.qtyTotal}>${(finalPrice * qty).toFixed(2)}</Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, addedToCart && styles.ctaBtnDone]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            {addedToCart ? (
              <>
                <Check size={18} color={COLORS.white} />
                <Text style={styles.ctaBtnText}>¡Agregado al carrito!</Text>
              </>
            ) : (
              <>
                <ShoppingCart size={18} color={COLORS.darkBrown} />
                <Text style={styles.ctaBtnText}>Agregar al carrito</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Upsells */}
          {upsells.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>También te puede gustar</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upsellsRow}
              >
                {upsells.map((item) => {
                  const uBasePrice = item.price;
                  const uHasDiscount = !!item.discount && item.discount > 0;
                  const uFinalPrice = uHasDiscount ? uBasePrice * (1 - item.discount! / 100) : uBasePrice;
                  
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.upsellCard}
                      onPress={() => router.push(`/productos/${item.id}` as any)}
                      activeOpacity={0.88}
                    >
                      <Image source={item.image} style={styles.upsellImage} resizeMode="cover" />
                      {uHasDiscount && (
                        <View style={styles.upsellBadge}>
                          <Text style={styles.upsellBadgeText}>-{item.discount}%</Text>
                        </View>
                      )}
                      <View style={styles.upsellInfo}>
                        <Text style={styles.upsellName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.upsellPrice}>${uFinalPrice.toFixed(2)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  floatingBar: {
    position: 'absolute', top: 52, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, zIndex: 10,
  },
  floatingBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  backBtn: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.muted },
  scrollContent: { paddingBottom: 24 },
  heroContainer: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: COLORS.lightBeige, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  heroBadge: {
    position: 'absolute', top: 60, right: 16,
    backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  heroBadgeText: { color: COLORS.darkBrown, fontSize: 11, fontWeight: '800' },
  content: { paddingHorizontal: 20, marginTop: -20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { backgroundColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.darkBrown },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF9C3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
  pointsText: { fontSize: 13, fontWeight: '700', color: '#854D0E' },
  productName: { fontSize: 24, fontWeight: '800', color: COLORS.darkBrown, marginBottom: 4, lineHeight: 30 },
  description: { fontSize: 14, color: COLORS.muted, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
  price: { fontSize: 26, fontWeight: '800', color: COLORS.accent },
  originalPrice: { fontSize: 16, color: COLORS.muted, textDecorationLine: 'line-through', marginBottom: 4 },
  pricebs: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginBottom: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  tagGreen: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  tagRed: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  tagText: { fontSize: 11, color: COLORS.muted, fontWeight: '500' },
  tagTextGreen: { color: COLORS.green },
  tagTextRed: { color: COLORS.red },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 10 },
  longDesc: { fontSize: 14, color: COLORS.muted, lineHeight: 22 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, color: COLORS.darkBrown, fontWeight: '500', lineHeight: 22 },
  qtyValue: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown, minWidth: 28, textAlign: 'center' },
  qtyTotal: { fontSize: 18, fontWeight: '700', color: COLORS.accent, marginLeft: 8 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 16, marginBottom: 28,
  },
  ctaBtnDone: { backgroundColor: COLORS.green },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.darkBrown },
  upsellsRow: { gap: 12, paddingBottom: 4 },
  upsellCard: {
    width: 150, backgroundColor: COLORS.white, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  upsellImage: { width: '100%', height: 110 },
  upsellBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  upsellBadgeText: { color: COLORS.darkBrown, fontSize: 9, fontWeight: '700' },
  upsellInfo: { padding: 10 },
  upsellName: { fontSize: 12, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 4, lineHeight: 16 },
  upsellPrice: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
});

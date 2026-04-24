import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Heart, Plus, Check, ShoppingCart, Star } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { Product } from '@/data/products';

const { width } = Dimensions.get('window');
const cardW = (width - 44) / 2;
const USD_TO_BS = 6.96;

export interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
  inWishlist?: boolean;
  inCart?: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  onPress?: () => void;
}

export function ProductCard({
  product,
  variant = 'grid',
  inWishlist = false,
  inCart = false,
  onToggleWishlist,
  onAddToCart,
  onPress,
}: ProductCardProps) {
  const categoryLabel =
    product.category === 'coffee' ? 'Café' :
    product.category === 'beverages' ? 'Bebida' : 'Accesorio';

  // Calculate prices
  const hasDiscount = !!product.discount && product.discount > 0;
  const basePrice = product.price;
  const finalPrice = hasDiscount ? basePrice * (1 - product.discount! / 100) : basePrice;
  const points = Math.floor(finalPrice * 10);

  if (variant === 'list') {
    return (
      <TouchableOpacity activeOpacity={0.92} style={listStyles.card} onPress={onPress}>
        <View style={listStyles.imageBox}>
          <Image source={product.image} style={listStyles.image} resizeMode="cover" />
          {hasDiscount && (
            <View style={listStyles.discountBadge}>
              <Text style={listStyles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>
        <View style={listStyles.info}>
          <Text style={listStyles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={listStyles.description} numberOfLines={1}>{product.description}</Text>
          {product.origin && <Text style={listStyles.origin}>📍 {product.origin}</Text>}

          <View style={listStyles.priceContainer}>
            {hasDiscount && (
              <Text style={listStyles.oldPrice}>${basePrice.toFixed(2)}</Text>
            )}
            <Text style={listStyles.price}>${finalPrice.toFixed(2)}</Text>
          </View>
          <Text style={listStyles.pricebs}>Bs {(finalPrice * USD_TO_BS).toFixed(2)}</Text>

          <View style={listStyles.pointsRow}>
            <Star size={11} color={COLORS.yellow} fill={COLORS.yellow} />
            <Text style={listStyles.pointsText}>{points} pts</Text>
          </View>
        </View>
        <View style={listStyles.actions}>
          <TouchableOpacity style={listStyles.heartBtn} onPress={onToggleWishlist}>
            <Heart size={15}
              color={inWishlist ? COLORS.accent : COLORS.darkBrown + '60'}
              fill={inWishlist ? COLORS.accent : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[listStyles.cartBtn, inCart && listStyles.cartBtnDone]}
            onPress={onAddToCart}
          >
            {inCart ? <Check size={14} color={COLORS.white} /> : <ShoppingCart size={14} color={COLORS.darkBrown} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // GRID VARIANT
  return (
    <TouchableOpacity activeOpacity={0.92} style={gridStyles.card} onPress={onPress}>
      <View style={gridStyles.imageBox}>
        <Image source={product.image} style={gridStyles.image} resizeMode="cover" />
        <TouchableOpacity style={gridStyles.heartBtn} onPress={onToggleWishlist}>
          <Heart size={15}
            color={inWishlist ? COLORS.accent : COLORS.darkBrown + '70'}
            fill={inWishlist ? COLORS.accent : 'transparent'}
          />
        </TouchableOpacity>
        {hasDiscount && (
          <View style={gridStyles.discountBadge}>
            <Text style={gridStyles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        {product.origin && (
          <View style={gridStyles.originBadge}>
            <Text style={gridStyles.originText}>{product.origin}</Text>
          </View>
        )}
      </View>
      <View style={gridStyles.info}>
        <Text style={gridStyles.category}>{categoryLabel}</Text>
        <Text style={gridStyles.name} numberOfLines={2}>{product.name}</Text>

        {hasDiscount && (
          <Text style={gridStyles.oldPrice}>${basePrice.toFixed(2)}</Text>
        )}

        <View style={gridStyles.priceRow}>
          <Text style={gridStyles.price}>${finalPrice.toFixed(2)}</Text>
          <View style={gridStyles.pointsBadge}>
            <Star size={10} color={COLORS.yellow} fill={COLORS.yellow} />
            <Text style={gridStyles.pointsText}>{points} pts</Text>
          </View>
        </View>

        <View style={gridStyles.footer}>
          <Text style={gridStyles.pricebs}>Bs {(finalPrice * USD_TO_BS).toFixed(2)}</Text>
          <TouchableOpacity
            style={[gridStyles.cartBtn, inCart && gridStyles.cartBtnDone]}
            onPress={onAddToCart}
          >
            {inCart ? <Check size={14} color={COLORS.white} /> : <Plus size={14} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const gridStyles = StyleSheet.create({
  card: {
    width: cardW, backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  imageBox: { height: 140, backgroundColor: COLORS.lightBeige, position: 'relative' },
  image: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: COLORS.white, borderRadius: 16, padding: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  discountText: { color: COLORS.darkBrown, fontSize: 10, fontWeight: '700' },
  originBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: COLORS.darkBrown + 'CC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  originText: { color: COLORS.white, fontSize: 9, fontWeight: '600' },
  info: { padding: 10 },
  category: { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 4, lineHeight: 17 },

  oldPrice: {
    fontSize: 11,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3', // yellow light
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsText: { fontSize: 10, fontWeight: '700', color: '#854D0E' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 },
  pricebs: { fontSize: 12, fontWeight: '500', color: COLORS.muted, marginBottom: 4 },
  cartBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  cartBtnDone: { backgroundColor: COLORS.green },
});

const listStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: COLORS.white,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 12, alignItems: 'center',
  },
  imageBox: {
    width: 86, height: 86, backgroundColor: COLORS.lightBeige,
    borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: COLORS.accent, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4,
  },
  discountText: { color: COLORS.darkBrown, fontSize: 9, fontWeight: '700' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.darkBrown },
  description: { fontSize: 11, color: COLORS.muted },
  origin: { fontSize: 10, color: COLORS.muted },

  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  oldPrice: { fontSize: 12, color: COLORS.muted, textDecorationLine: 'line-through' },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  pricebs: { fontSize: 12, fontWeight: '500', color: COLORS.muted },

  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  pointsText: { fontSize: 11, fontWeight: '600', color: '#854D0E' },

  actions: { gap: 8, alignItems: 'center' },
  heartBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.lightBeige, alignItems: 'center', justifyContent: 'center',
  },
  cartBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  cartBtnDone: { backgroundColor: COLORS.green },
});

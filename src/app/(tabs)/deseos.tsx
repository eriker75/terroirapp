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
import { Heart, ShoppingBag, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';
import { products } from '@/src/data/products';
import { useAppStore } from '@/src/store/useAppStore';

const { width } = Dimensions.get('window');
const CARD_W = (width - 44) / 2;

const initialFavorites = ['1', '2', '5', '7', '10'];

export default function DeseosScreen() {
  const router = useRouter();
  const addToCart = useAppStore((s) => s.addToCart);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f !== id));
  };

  const clearAll = () => {
    Alert.alert('Limpiar favoritos', '¿Quitar todos los favoritos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar todo', style: 'destructive', onPress: () => setFavorites([]) },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Deseos</Text>
        {favorites.length > 0 ? (
          <TouchableOpacity onPress={clearAll}>
            <Trash2 size={20} color={COLORS.red} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Count */}
      {favorites.length > 0 && (
        <View style={styles.countRow}>
          <Heart size={14} color={COLORS.accent} fill={COLORS.accent} />
          <Text style={styles.countText}>{favorites.length} productos guardados</Text>
        </View>
      )}

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyHeart}>
            <Heart size={40} color={COLORS.border} />
          </View>
          <Text style={styles.emptyTitle}>Sin deseos aún</Text>
          <Text style={styles.emptySubtitle}>
            Agrega productos a tu lista de deseos para tenerlos siempre a mano
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/productos')}
          >
            <ShoppingBag size={16} color={COLORS.darkBrown} />
            <Text style={styles.exploreBtnText}>Explorar productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {favoriteProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.card}
              onPress={() => router.push(`/productos/${product.id}` as any)}
              activeOpacity={0.88}
            >
              {/* Image */}
              <View style={styles.imageBox}>
                <Image source={product.image} style={styles.productImg} resizeMode="cover" />
                {/* Remove button */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => removeFromFavorites(product.id)}
                >
                  <Heart size={16} color={COLORS.accent} fill={COLORS.accent} />
                </TouchableOpacity>
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardCategory}>
                  {product.category === 'coffee'
                    ? 'Café'
                    : product.category === 'beverages'
                    ? 'Bebida'
                    : 'Accesorio'}
                </Text>
                <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={1}>{product.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.cardRating}>★ {product.rating}</Text>
                </View>
              </View>

              {/* Add to cart */}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart()}
              >
                <ShoppingBag size={14} color={COLORS.darkBrown} />
                <Text style={styles.addBtnText}>Agregar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: { fontSize: 13, color: COLORS.muted },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyHeart: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  exploreBtnText: { color: COLORS.darkBrown, fontSize: 14, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageBox: {
    height: 130,
    backgroundColor: COLORS.lightBeige,
    position: 'relative',
  },
  productImg: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: COLORS.darkBrown, fontSize: 10, fontWeight: '700' },
  cardInfo: { flex: 1, padding: 12, gap: 3 },
  cardCategory: { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardName: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown },
  cardDesc: { fontSize: 11, color: COLORS.muted },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPrice: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  cardRating: { fontSize: 12, color: COLORS.yellow },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    backgroundColor: COLORS.lightBeige,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
});

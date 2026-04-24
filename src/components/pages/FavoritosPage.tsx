import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { COLORS } from '@/constants/colors';
import { products } from '@/data/products';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductCard } from '@/components/ui/ProductCard';

const { width } = Dimensions.get('window');
const CARD_W = (width - 44) / 2;

const initialFavorites = ['1', '2', '5', '7', '10'];

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
  hideHeader?: boolean;
}

export default function FavoritosPage({ showBackButton = false, onBack, hideHeader = false }: Props) {
  const router = useRouter();
  
  const addToCartAction = useCartStore((s) => s.addToCart);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  
  const [cartAdded, setCartAdded] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const PAGE_SIZE = 8;
  
  const handleAddToCart = (product: any) => {
    addToCartAction(product);
    setCartAdded((prev) => [...prev, product.id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== product.id)), 1500);
  };

  const favoriteProducts = products.filter((p) => wishlistIds.includes(p.id));
  const visible = favoriteProducts.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < favoriteProducts.length;

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoading(false);
      loadingRef.current = false;
    }, 1000);
  }, [hasMore]);

  const clearAll = () => {
    clearWishlist();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      {!hideHeader && (
        <View style={styles.header}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color={COLORS.darkBrown} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
          {wishlistIds.length > 0 ? (
            <TouchableOpacity onPress={clearAll}>
              <Trash2 size={20} color={COLORS.red} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      )}

      {/* Count */}
      {wishlistIds.length > 0 && (
        <View style={styles.countRow}>
          <Heart size={14} color={COLORS.accent} fill={COLORS.accent} />
          <Text style={styles.countText}>{wishlistIds.length} productos guardados</Text>
        </View>
      )}

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyHeart}>
            <Heart size={40} color={COLORS.border} />
          </View>
          <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
          <Text style={styles.emptySubtitle}>
            Agrega productos a tus favoritos para tenerlos siempre a mano
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
        <FlatList
          key="wishlist-grid"
          data={visible}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.flatContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            <View style={styles.footer}>
              {isLoading ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                  <Text style={styles.loaderText}>Cargando favoritos…</Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              key={item.id}
              product={item}
              variant="grid"
              inWishlist={true}
              inCart={cartAdded.includes(item.id)}
              onToggleWishlist={() => toggleWishlist(item.id)}
              onAddToCart={() => handleAddToCart(item)}
              onPress={() => router.push(`/productos/${item.id}` as any)}
            />
          )}
        />
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
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
  flatContent: { padding: 16, paddingBottom: 32 },
  gridRow: { gap: 12, marginBottom: 12 },
  footer: { paddingVertical: 20, alignItems: 'center' },
  loaderBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loaderText: { fontSize: 13, color: COLORS.muted },
});

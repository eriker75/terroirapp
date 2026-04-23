import { VStack } from '@/components/ui/vstack';
import { COLORS } from '@/src/constants/colors';
import { Product, products } from '@/src/data/products';
import { useRouter } from 'expo-router';
import HeaderLayout from '@/src/components/layouts/HeaderLayout';
import {
  Check,
  Grid3X3,
  Heart,
  List,
  Plus,
  Search,
  ShoppingCart,
  Sliders, X,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;
const USD_TO_BS = 6.96; // tasa de cambio USD → Bs

/* ─── Mock catalog: 40 items cycling through the 12 real products ─── */
const CATALOG: Product[] = Array.from({ length: 40 }, (_, i) => ({
  ...products[i % products.length],
  id: String(i + 1),
  price: parseFloat(
    (products[i % products.length].price * (1 + Math.floor(i / products.length) * 0.04)).toFixed(2)
  ),
}));

/* ─── Filters ─────────────────────────────────────────────────────── */
const FILTERS = [
  { id: 'all',         label: 'Todos' },
  { id: 'coffee',      label: '☕ Café' },
  { id: 'beverages',   label: '🥛 Bebidas' },
  { id: 'accessories', label: '🔧 Accesorios' },
  { id: 'discount',    label: '🏷️ Ofertas' },
  { id: 'dark',        label: '🔥 Tostado Oscuro' },
  { id: 'medium',      label: '🌰 Tostado Medio' },
  { id: 'light',       label: '🌿 Tostado Claro' },
  { id: 'Etiopía',     label: '🌍 Etiopía' },
  { id: 'Colombia',    label: '🌎 Colombia' },
  { id: 'Kenia',       label: '🌍 Kenia' },
];

const SORT_OPTIONS = [
  { id: 'newest',     label: 'Más recientes' },
  { id: 'price-low',  label: 'Precio: menor a mayor' },
  { id: 'price-high', label: 'Precio: mayor a menor' },
  { id: 'rating',     label: 'Mejor valorados' },
];

type SortBy = 'newest' | 'price-low' | 'price-high' | 'rating';

function applyFilters(data: Product[], filter: string, search: string, sort: SortBy): Product[] {
  let result = data.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    let matchFilter = false;
    if (filter === 'all')                                                matchFilter = true;
    else if (['coffee', 'beverages', 'accessories'].includes(filter))   matchFilter = p.category === filter;
    else if (filter === 'discount')                                      matchFilter = !!p.discount;
    else if (['dark', 'medium', 'light'].includes(filter))              matchFilter = p.roastLevel === filter;
    else                                                                 matchFilter = p.origin === filter;
    return matchSearch && matchFilter;
  });

  if (sort === 'price-low')  result = [...result].sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
  else if (sort === 'rating')     result = [...result].sort((a, b) => b.rating - a.rating);

  return result;
}

/* ─── Screen ──────────────────────────────────────────────────────── */
export default function ProductsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [sortBy, setSortBy]     = useState<SortBy>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist]   = useState<string[]>([]);
  const [cartAdded, setCartAdded] = useState<string[]>([]);

  // Pagination state
  const [page, setPage]         = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false); // prevent double-fires

  // Derive full filtered list, then slice to current page
  const allFiltered = applyFilters(CATALOG, filter, search, sortBy);
  const visible     = allFiltered.slice(0, page * PAGE_SIZE);
  const hasMore     = visible.length < allFiltered.length;

  // Reset pagination whenever filter/search/sort changes
  useEffect(() => {
    setPage(1);
  }, [filter, search, sortBy]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);
    // Simulate network delay (800–1200 ms)
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoading(false);
      loadingRef.current = false;
    }, 1000);
  }, [hasMore]);

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const addToCart = (id: string) => {
    setCartAdded((prev) => [...prev, id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== id)), 1500);
  };

  /* ── Render helpers ────────────────────────────────────────────── */
  const renderGridItem = useCallback(({ item }: { item: Product }) => (
    <ProductCardGrid
      product={item}
      inWishlist={wishlist.includes(item.id)}
      inCart={cartAdded.includes(item.id)}
      onToggleWishlist={() => toggleWishlist(item.id)}
      onAddToCart={() => addToCart(item.id)}
      onPress={() => router.push(`/producto/${item.id}` as any)}
    />
  ), [wishlist, cartAdded]);

  const renderListItem = useCallback(({ item }: { item: Product }) => (
    <ProductCardList
      product={item}
      inWishlist={wishlist.includes(item.id)}
      inCart={cartAdded.includes(item.id)}
      onToggleWishlist={() => toggleWishlist(item.id)}
      onAddToCart={() => addToCart(item.id)}
      onPress={() => router.push(`/producto/${item.id}` as any)}
    />
  ), [wishlist, cartAdded]);

  const ListFooter = () => (
    <View style={styles.footer}>
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.loaderText}>Cargando más productos…</Text>
        </View>
      ) : !hasMore && visible.length > 0 ? (
        <Text style={styles.endText}>— Has visto todos los productos —</Text>
      ) : null}
    </View>
  );

  const EmptyState = () => (
    <VStack style={styles.emptyState}>
      <Image
        source={require('@/assets/images/404Coffe.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>No se encontraron productos</Text>
      <Text style={styles.emptySubtext}>Intenta con otro filtro o búsqueda</Text>
    </VStack>
  );

  return (
    <HeaderLayout>
      <View style={styles.safeArea}>
        <VStack>
          {/* Custom Header Row for Products */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Productos</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFiltersOpen(true)}>
                <Sliders size={20} color={COLORS.darkBrown} />
              </TouchableOpacity>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Grid3X3 size={16} color={viewMode === 'grid' ? COLORS.darkBrown : COLORS.darkBrown + '60'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={16} color={viewMode === 'list' ? COLORS.darkBrown : COLORS.darkBrown + '60'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={16} color={COLORS.darkBrown + '80'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar café, origen, tostado..."
              placeholderTextColor={COLORS.darkBrown + '60'}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={15} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter badges slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.pill, filter === f.id && styles.pillActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.pillText, filter === f.id && styles.pillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results row */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {visible.length} de {allFiltered.length} productos
            </Text>
            {sortBy !== 'newest' && (
              <Text style={styles.sortIndicator}>
                {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
              </Text>
            )}
          </View>
        </VStack>

        {/* FlatList — key forces remount when columns change */}
        {viewMode === 'grid' ? (
          <FlatList
            key="grid"
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.flatContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={EmptyState}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            key="list"
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={styles.flatContentList}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={EmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Sort Modal */}
        <Modal visible={filtersOpen} transparent animationType="slide">
          <Pressable style={styles.overlay} onPress={() => setFiltersOpen(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Ordenar por</Text>
              <TouchableOpacity onPress={() => setFiltersOpen(false)}>
                <X size={20} color={COLORS.darkBrown} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.sortOption}
                onPress={() => { setSortBy(opt.id as SortBy); setFiltersOpen(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === opt.id && styles.sortOptionActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.id && <Check size={16} color={COLORS.accent} />}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      </View>
    </HeaderLayout>
  );
}

/* ─── Grid Card ───────────────────────────────────────────────────── */
function ProductCardGrid({
  product, inWishlist, inCart, onToggleWishlist, onAddToCart, onPress,
}: {
  product: Product; inWishlist: boolean; inCart: boolean;
  onToggleWishlist: () => void; onAddToCart: () => void; onPress: () => void;
}) {
  const categoryLabel =
    product.category === 'coffee' ? 'Café' :
    product.category === 'beverages' ? 'Bebida' : 'Accesorio';

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
        {product.discount && (
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
        <View style={gridStyles.footer}>
          <View>
            <Text style={gridStyles.price}>${product.price.toFixed(2)}</Text>
            <Text style={gridStyles.pricebs}>Bs {(product.price * USD_TO_BS).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[gridStyles.cartBtn, inCart && gridStyles.cartBtnDone]}
            onPress={onAddToCart}
          >
            {inCart ? <Check size={14} color={COLORS.white} /> : <Plus size={14} color={COLORS.darkBrown} />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── List Card ───────────────────────────────────────────────────── */
function ProductCardList({
  product, inWishlist, inCart, onToggleWishlist, onAddToCart, onPress,
}: {
  product: Product; inWishlist: boolean; inCart: boolean;
  onToggleWishlist: () => void; onAddToCart: () => void; onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.92} style={listStyles.card} onPress={onPress}>
      <View style={listStyles.imageBox}>
        <Image source={product.image} style={listStyles.image} resizeMode="cover" />
        {product.discount && (
          <View style={listStyles.discountBadge}>
            <Text style={listStyles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>
      <View style={listStyles.info}>
        <Text style={listStyles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={listStyles.description} numberOfLines={1}>{product.description}</Text>
        {product.origin && <Text style={listStyles.origin}>📍 {product.origin}</Text>}
        <Text style={listStyles.price}>${product.price.toFixed(2)}</Text>
        <Text style={listStyles.pricebs}>Bs {(product.price * USD_TO_BS).toFixed(2)}</Text>
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

/* ─── Styles ──────────────────────────────────────────────────────── */
const cardW = (width - 44) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 6 },
  viewToggle: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 3,
  },
  toggleBtn: { padding: 5, borderRadius: 5 },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 16, marginTop: 8, marginBottom: 0,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.darkBrown },
  pillsRow: { paddingHorizontal: 16, paddingVertical: 4, gap: 8, alignItems: 'center' },
  pill: {
    height: 38, paddingHorizontal: 16, borderRadius: 19,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillText: { fontSize: 13, fontWeight: '500', color: COLORS.darkBrown + '99' },
  pillTextActive: { color: COLORS.darkBrown, fontWeight: '700' },
  resultsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 2, paddingBottom: 6,
  },
  resultsText: { fontSize: 12, color: COLORS.muted },
  sortIndicator: { fontSize: 11, color: COLORS.accent, fontWeight: '500' },
  flatContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  flatContentList: { paddingHorizontal: 16, paddingTop: 4, gap: 10, paddingBottom: 24 },
  gridRow: { gap: 12, marginBottom: 12 },
  footer: { paddingVertical: 20, alignItems: 'center' },
  loaderBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loaderText: { fontSize: 13, color: COLORS.muted },
  endText: { fontSize: 12, color: COLORS.muted + '99', fontStyle: 'italic' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 32,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyImage: { width: 220, height: 220 },
  emptyText: { fontSize: 16, color: COLORS.darkBrown, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: '#00000050' },
  filterSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 8,
  },
  filterTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  sortOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sortOptionText: { fontSize: 15, color: COLORS.darkBrown + '99' },
  sortOptionActive: { color: COLORS.darkBrown, fontWeight: '600' },
  overlay2: { flex: 1, backgroundColor: '#00000050' },
});

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
  name: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 8, lineHeight: 17 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  pricebs: { fontSize: 11, fontWeight: '500', color: COLORS.muted, marginTop: 1 },
  rating: { fontSize: 11, color: COLORS.yellow, marginTop: 1 },
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
  rating: { fontSize: 11, color: COLORS.yellow },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.accent, marginTop: 2 },
  pricebs: { fontSize: 11, fontWeight: '500', color: COLORS.muted },
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

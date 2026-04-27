import { VStack } from '@/components/ui/vstack';
import { COLORS } from '@/constants/colors';
import { Product, products } from '@/data/products';
import { useRouter } from 'expo-router';
import HeaderLayout from '@/components/layouts/HeaderLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PriceFilterInput } from '@/components/ui/PriceFilterInput';
import {
  Check,
  Grid3X3,
  List,
  Search,
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

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
const QUICK_FILTERS = [
  { id: 'all',         label: 'Todos' },
  { id: 'coffee',      label: '☕ Café' },
  { id: 'beverages',   label: '🥛 Bebidas' },
  { id: 'accessories', label: '🔧 Accesorios' },
  { id: 'discount',    label: '🏷️ Ofertas' },
];

const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'coffee', label: 'Café' },
  { id: 'beverages', label: 'Bebidas' },
  { id: 'accessories', label: 'Accesorios' },
  { id: 'discount', label: 'Ofertas' },
];

const SORT_OPTIONS = [
  { id: 'newest',     label: 'Más recientes' },
  { id: 'price-low',  label: 'Precio: menor a mayor' },
  { id: 'price-high', label: 'Precio: mayor a menor' },
  { id: 'rating',     label: 'Mejor valorados' },
];

type SortBy = 'newest' | 'price-low' | 'price-high' | 'rating';

type FilterState = {
  category: string;
  minPrice: string;
  maxPrice: string;
  minPoints: string;
  maxPoints: string;
};

const INITIAL_FILTERS: FilterState = {
  category: 'all',
  minPrice: '',
  maxPrice: '',
  minPoints: '',
  maxPoints: '',
};

function applyFilters(
  data: Product[],
  filters: FilterState,
  search: string,
  sort: SortBy
): Product[] {
  let result = data.filter((p) => {
    // Search
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;

    // Category
    if (filters.category !== 'all') {
      if (filters.category === 'discount') {
        if (!p.discount) return false;
      } else if (p.category !== filters.category) return false;
    }

    // Price
    if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false;

    // Points (points = price * 10)
    const pts = Math.floor(p.price * 10);
    if (filters.minPoints && pts < parseInt(filters.minPoints, 10)) return false;
    if (filters.maxPoints && pts > parseInt(filters.maxPoints, 10)) return false;

    return true;
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

  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy]               = useState<SortBy>('newest');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [tempSortBy, setTempSortBy]   = useState<SortBy>('newest');
  const [filterMode, setFilterMode]   = useState<'usd' | 'pts'>('usd');

  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToCartAction = useCartStore((s) => s.addToCart);
  const [cartAdded, setCartAdded] = useState<string[]>([]);

  // Pagination state
  const [page, setPage]         = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false); // prevent double-fires

  // Derive full filtered list, then slice to current page
  const allFiltered = applyFilters(CATALOG, activeFilters, search, sortBy);
  const visible     = allFiltered.slice(0, page * PAGE_SIZE);
  const hasMore     = visible.length < allFiltered.length;

  // Reset pagination whenever filter/search/sort changes
  useEffect(() => {
    setPage(1);
  }, [activeFilters, search, sortBy]);

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

  const addToCart = (product: Product) => {
    addToCartAction(product);
    setCartAdded((prev) => [...prev, product.id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== product.id)), 1500);
  };

  const openFilters = () => {
    setTempFilters(activeFilters);
    setTempSortBy(sortBy);
    setFiltersOpen(true);
  };

  const applyTempFilters = () => {
    setActiveFilters(tempFilters);
    setSortBy(tempSortBy);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setTempFilters(INITIAL_FILTERS);
    setTempSortBy('newest');
  };

  /* ── Render helpers ────────────────────────────────────────────── */
  const renderGridItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant="grid"
      inWishlist={wishlistIds.includes(item.id)}
      inCart={cartAdded.includes(item.id)}
      onToggleWishlist={() => toggleWishlist(item.id)}
      onAddToCart={() => addToCart(item)}
      onPress={() => router.push(`/productos/${item.id}` as any)}
    />
  ), [wishlistIds, cartAdded]);

  const renderListItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant="list"
      inWishlist={wishlistIds.includes(item.id)}
      inCart={cartAdded.includes(item.id)}
      onToggleWishlist={() => toggleWishlist(item.id)}
      onAddToCart={() => addToCart(item)}
      onPress={() => router.push(`/productos/${item.id}` as any)}
    />
  ), [wishlistIds, cartAdded]);

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
              <TouchableOpacity style={styles.iconBtn} onPress={openFilters}>
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
            {QUICK_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.pill, activeFilters.category === f.id && styles.pillActive]}
                onPress={() => setActiveFilters(prev => ({ ...prev, category: f.id }))}
              >
                <Text style={[styles.pillText, activeFilters.category === f.id && styles.pillTextActive]}>
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

        {/* Filter & Sort Modal */}
        <Modal visible={filtersOpen} transparent animationType="slide">
          <KeyboardAvoidingView
            style={styles.overlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={{flex: 1}} onPress={() => setFiltersOpen(false)} />
            <View style={styles.filterSheet}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filtros y Ordenamiento</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setFiltersOpen(false)}>
                  <X size={20} color={COLORS.darkBrown} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Ordenar por */}
                <Text style={styles.filterSectionTitle}>Ordenar por</Text>
                <View style={styles.filterOptionsRow}>
                  {SORT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.filterChip, tempSortBy === opt.id && styles.filterChipActive]}
                      onPress={() => setTempSortBy(opt.id as SortBy)}
                    >
                      <Text style={[styles.filterChipText, tempSortBy === opt.id && styles.filterChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Categoría */}
                <Text style={styles.filterSectionTitle}>Categoría</Text>
                <View style={styles.filterOptionsRow}>
                  {CATEGORIES.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.filterChip, tempFilters.category === opt.id && styles.filterChipActive]}
                      onPress={() => setTempFilters(prev => ({ ...prev, category: opt.id }))}
                    >
                      <Text style={[styles.filterChipText, tempFilters.category === opt.id && styles.filterChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.filterModeToggle}>
                  <TouchableOpacity
                    style={[styles.filterModeBtn, filterMode === 'usd' && styles.filterModeBtnActive]}
                    onPress={() => setFilterMode('usd')}
                  >
                    <Text style={[styles.filterModeText, filterMode === 'usd' && styles.filterModeTextActive]}>Precio ($/Bs)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterModeBtn, filterMode === 'pts' && styles.filterModeBtnActive]}
                    onPress={() => setFilterMode('pts')}
                  >
                    <Text style={[styles.filterModeText, filterMode === 'pts' && styles.filterModeTextActive]}>Puntos</Text>
                  </TouchableOpacity>
                </View>

                {filterMode === 'usd' ? (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Rango de Precio</Text>
                    <PriceFilterInput
                      globalMin={0}
                      globalMax={200}
                      prefix="$"
                      lowValue={tempFilters.minPrice}
                      highValue={tempFilters.maxPrice}
                      onValuesChange={(l, h) => setTempFilters(prev => ({...prev, minPrice: l, maxPrice: h}))}
                    />
                    {(tempFilters.minPrice || tempFilters.maxPrice) ? (
                      <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, textAlign: 'center' }}>
                        Equivalente: Bs {(Number(tempFilters.minPrice || 0) * USD_TO_BS).toFixed(2)} - Bs {(Number(tempFilters.maxPrice || 200) * USD_TO_BS).toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Rango de Puntos</Text>
                    <PriceFilterInput
                      globalMin={0}
                      globalMax={2000}
                      suffix=" pts"
                      lowValue={tempFilters.minPoints}
                      highValue={tempFilters.maxPoints}
                      onValuesChange={(l, h) => setTempFilters(prev => ({...prev, minPoints: l, maxPoints: h}))}
                    />
                  </View>
                )}
              </ScrollView>

              <View style={styles.filterFooter}>
                <TouchableOpacity style={styles.filterBtnOutline} onPress={clearFilters}>
                  <Text style={styles.filterBtnOutlineText}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterBtnSolid} onPress={applyTempFilters}>
                  <Text style={styles.filterBtnSolidText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </HeaderLayout>
  );
}

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

  // Filter Modal Styles
  overlay: { flex: 1, backgroundColor: '#00000050', justifyContent: 'flex-end' },
  filterSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8,
    maxHeight: '85%',
  },
  filterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filterTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  closeBtn: { padding: 4 },
  filterScroll: { marginTop: 8 },
  filterSectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown, marginTop: 16, marginBottom: 12 },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterChipText: { fontSize: 13, color: COLORS.darkBrown + '99', fontWeight: '500' },
  filterChipTextActive: { color: COLORS.darkBrown, fontWeight: '700' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rangeInput: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16,
    color: COLORS.darkBrown, fontSize: 14,
  },
  rangeDivider: { fontSize: 16, color: COLORS.muted, fontWeight: '500' },
  filterFooter: {
    flexDirection: 'row', gap: 12, marginTop: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 20,
  },
  filterBtnOutline: {
    flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white,
  },
  filterBtnOutlineText: { color: COLORS.darkBrown, fontSize: 15, fontWeight: '600' },
  filterBtnSolid: {
    flex: 1, height: 48, borderRadius: 24, backgroundColor: COLORS.darkBrown,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnSolidText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  filterModeToggle: { flexDirection: 'row', backgroundColor: COLORS.lightBeige, borderRadius: 12, padding: 4, marginTop: 16 },
  filterModeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  filterModeBtnActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  filterModeText: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  filterModeTextActive: { color: COLORS.darkBrown, fontWeight: '700' },
  filterSection: { marginTop: 4 },
});

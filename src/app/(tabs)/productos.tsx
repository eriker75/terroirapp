import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Grid3X3, List, Heart, Sliders, X, Check } from 'lucide-react-native';
import { COLORS } from '@/src/constants/colors';
import { products, Product } from '@/src/data/products';

const { width } = Dimensions.get('window');

const coffeeCategories = [
  { id: 'all', name: 'Todos' },
  { id: 'coffee', name: 'Café' },
  { id: 'beverages', name: 'Bebidas' },
  { id: 'accessories', name: 'Accesorios' },
];

const sortOptions = [
  { id: 'newest', label: 'Más recientes' },
  { id: 'price-low', label: 'Precio: menor a mayor' },
  { id: 'price-high', label: 'Precio: mayor a menor' },
  { id: 'rating', label: 'Mejor valorados' },
];

type SortBy = 'newest' | 'price-low' | 'price-high' | 'rating';

export default function ProductsScreen() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [wishlist, setWishlist] = useState<string[]>([]);

  let filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
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
          placeholder="Buscar café..."
          placeholderTextColor={COLORS.darkBrown + '80'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
        style={styles.pillsContainer}
      >
        {coffeeCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.pill, selectedCategory === cat.id && styles.pillActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.pillText, selectedCategory === cat.id && styles.pillTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} productos</Text>
      </View>

      {/* Products */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.productsContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>☕</Text>
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filtered.map((product) => (
              <ProductCardGrid
                key={product.id}
                product={product}
                inWishlist={wishlist.includes(product.id)}
                onToggleWishlist={() => toggleWishlist(product.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((product) => (
              <ProductCardList
                key={product.id}
                product={product}
                inWishlist={wishlist.includes(product.id)}
                onToggleWishlist={() => toggleWishlist(product.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal visible={filtersOpen} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setFiltersOpen(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Ordenar por</Text>
            <TouchableOpacity onPress={() => setFiltersOpen(false)}>
              <X size={20} color={COLORS.darkBrown} />
            </TouchableOpacity>
          </View>
          {sortOptions.map((opt) => (
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
    </SafeAreaView>
  );
}

function ProductCardGrid({
  product,
  inWishlist,
  onToggleWishlist,
}: {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: () => void;
}) {
  return (
    <View style={gridCardStyles.card}>
      <View style={gridCardStyles.imageBox}>
        <Text style={gridCardStyles.emoji}>{product.emoji}</Text>
        <TouchableOpacity style={gridCardStyles.heartBtn} onPress={onToggleWishlist}>
          <Heart
            size={16}
            color={inWishlist ? COLORS.accent : COLORS.darkBrown + '60'}
            fill={inWishlist ? COLORS.accent : 'transparent'}
          />
        </TouchableOpacity>
        {product.discount && (
          <View style={gridCardStyles.badge}>
            <Text style={gridCardStyles.badgeText}>-{product.discount}%</Text>
          </View>
        )}
      </View>
      <View style={gridCardStyles.info}>
        <Text style={gridCardStyles.category}>Café</Text>
        <Text style={gridCardStyles.name} numberOfLines={2}>{product.name}</Text>
        <View style={gridCardStyles.footer}>
          <Text style={gridCardStyles.price}>${product.price.toFixed(2)}</Text>
          <Text style={gridCardStyles.rating}>★ {product.rating}</Text>
        </View>
      </View>
    </View>
  );
}

function ProductCardList({
  product,
  inWishlist,
  onToggleWishlist,
}: {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: () => void;
}) {
  return (
    <View style={listCardStyles.card}>
      <View style={listCardStyles.imageBox}>
        <Text style={listCardStyles.emoji}>{product.emoji}</Text>
        <TouchableOpacity style={listCardStyles.heartBtn} onPress={onToggleWishlist}>
          <Heart
            size={14}
            color={inWishlist ? COLORS.accent : COLORS.darkBrown + '60'}
            fill={inWishlist ? COLORS.accent : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      <View style={listCardStyles.info}>
        <View>
          <Text style={listCardStyles.name}>{product.name}</Text>
          <Text style={listCardStyles.description} numberOfLines={1}>{product.description}</Text>
          <Text style={listCardStyles.rating}>★ {product.rating} ({product.reviewCount})</Text>
        </View>
        <Text style={listCardStyles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const cardW = (width - 44) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 6 },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: { padding: 5, borderRadius: 5 },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.darkBrown },
  pillsContainer: { maxHeight: 48 },
  pillsRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingVertical: 6 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillText: { fontSize: 13, fontWeight: '500', color: COLORS.darkBrown + '99' },
  pillTextActive: { color: COLORS.darkBrown, fontWeight: '600' },
  resultsRow: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 12, color: COLORS.muted },
  productsContent: { paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  list: { paddingHorizontal: 16, gap: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.darkBrown + 'AA', fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: '#00000050' },
  filterSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  filterTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortOptionText: { fontSize: 15, color: COLORS.darkBrown + '99' },
  sortOptionActive: { color: COLORS.darkBrown, fontWeight: '600' },
});

const gridCardStyles = StyleSheet.create({
  card: {
    width: cardW,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageBox: {
    height: 140,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: { fontSize: 50 },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: COLORS.darkBrown, fontSize: 10, fontWeight: '700' },
  info: { padding: 12 },
  category: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  rating: { fontSize: 12, color: COLORS.yellow },
});

const listCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  imageBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.lightBeige,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  emoji: { fontSize: 32 },
  heartBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  info: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.darkBrown },
  description: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  rating: { fontSize: 12, color: COLORS.yellow, marginTop: 4 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.accent, marginTop: 6 },
});

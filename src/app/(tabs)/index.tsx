import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';
import { products } from '@/src/data/products';

const { width } = Dimensions.get('window');

const banners = [
  {
    id: '1',
    title: 'El café que mereces',
    subtitle: 'Especialidad de origen único',
    bg: COLORS.darkBrown,
    image: require('../../../assets/images/coffee-banner-1.jpg'),
  },
  {
    id: '2',
    title: 'Cold Brew Premium',
    subtitle: 'Refrescante y vibrante',
    bg: '#473B08',
    image: require('../../../assets/images/coffee-banner-2.jpg'),
  },
  {
    id: '3',
    title: 'Nuevos Orígenes',
    subtitle: 'Kenia, Etiopía, Colombia',
    bg: '#5A2D1E',
    image: require('../../../assets/images/coffee-banner-3.jpg'),
  },
];

const categories = [
  { id: 'all', name: 'Todos', image: require('../../../assets/images/coffee-product-5.jpg') },
  { id: 'espresso', name: 'Espresso', image: require('../../../assets/images/espresso.jpg') },
  { id: 'cappuccino', name: 'Cappuccino', image: require('../../../assets/images/cappuccino.jpg') },
  { id: 'latte', name: 'Latte', image: require('../../../assets/images/product-latte.jpg') },
  { id: 'cold-brew', name: 'Cold Brew', image: require('../../../assets/images/cold-brew.jpg') },
];

export default function HomeScreen() {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [search, setSearch] = useState('');
  const featuredProducts = products.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terroir</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notificaciones')}>
          <Bell size={22} color={COLORS.darkBrown} />
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.darkBrown + '80'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar café..."
            placeholderTextColor={COLORS.darkBrown + '80'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setCurrentBanner(index);
            }}
          >
            {banners.map((banner) => (
              <View key={banner.id} style={[styles.bannerSlide, { backgroundColor: banner.bg }]}>
                <Image source={banner.image} style={styles.bannerImage} resizeMode="cover" />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentBanner && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Image
            source={require('../../../assets/images/coffee-banner-promo.jpg')}
            style={styles.promoBannerBg}
            resizeMode="cover"
          />
          <View style={styles.promoBannerOverlay} />
          <View style={styles.promoBannerContent}>
            <View>
              <Text style={styles.promoTitle}>Oferta Especial</Text>
              <Text style={styles.promoSubtitle}>20% descuento en tu primer pedido</Text>
            </View>
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={() => router.push('/(tabs)/productos')}
            >
              <Text style={styles.promoBtnText}>Comprar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => router.push('/(tabs)/productos')}
              >
                <Image source={cat.image} style={styles.categoryImage} resizeMode="cover" />
                <View style={styles.categoryImageOverlay} />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destacados</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/productos')}>
              <Text style={styles.seeAll}>Ver todo →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push('/(tabs)/productos')}
              >
                <View style={styles.productImageBox}>
                  <Image source={product.image} style={styles.productImage} resizeMode="cover" />
                  {product.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>
                    {product.category === 'coffee' ? 'Café' : product.category === 'beverages' ? 'Bebida' : 'Accesorio'}
                  </Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    <Text style={styles.productRating}>★ {product.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.lightBeige,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkBrown,
  },
  bellBtn: {
    position: 'relative',
    padding: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: COLORS.darkBrown,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
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
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bannerSlide: {
    width: width - 32,
    borderRadius: 12,
    minHeight: 130,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  bannerContent: {
    padding: 18,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 13,
    marginTop: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 18,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 72,
  },
  promoBannerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  promoBannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.darkBrown + 'CC',
  },
  promoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  promoTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  promoSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 12,
    marginTop: 2,
  },
  promoBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  promoBtnText: {
    color: COLORS.darkBrown,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkBrown,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  categoryImageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  categoryName: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
    paddingBottom: 7,
    paddingHorizontal: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  productImageBox: {
    height: 120,
    backgroundColor: COLORS.lightBeige,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
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
  discountText: {
    color: COLORS.darkBrown,
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkBrown,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  productRating: {
    fontSize: 12,
    color: COLORS.yellow,
  },
});

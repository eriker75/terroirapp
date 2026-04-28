import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  Animated,
  ScrollView,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { products } from '@/data/products';
import HeaderLayout from '@/components/layouts/HeaderLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 32;
const PARALLAX_OFFSET = SLIDE_WIDTH * 0.13;

// ── Static data – replace with API calls ─────────────────────────────────────

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  bg: string;
  image?: any;
  buttonLabel: string;
  link: string;
};

type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  bg: string;
  image?: any;
  buttonLabel: string;
  link: string;
};

const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'El café que mereces',
    subtitle: 'Especialidad de origen único',
    bg: COLORS.darkBrown,
    image: require('@/assets/images/coffee-banner-1.jpg'),
    buttonLabel: 'Ver producto',
    link: '/productos/1',
  },
  {
    id: '2',
    title: 'Cold Brew Premium',
    subtitle: 'Refrescante y vibrante',
    bg: '#473B08',
    image: require('@/assets/images/coffee-banner-2.jpg'),
    buttonLabel: 'Comprar ahora',
    link: '/productos/2',
  },
  {
    id: '3',
    title: 'Nuevos Orígenes',
    subtitle: 'Kenia, Etiopía, Colombia',
    bg: '#5A2D1E',
    image: require('@/assets/images/coffee-banner-3.jpg'),
    buttonLabel: 'Explorar',
    link: '/(tabs)/productos',
  },
];

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: '1',
    title: 'Oferta Especial',
    subtitle: '20% descuento en tu primer pedido',
    bg: COLORS.darkBrown,
    image: require('@/assets/images/coffee-banner-promo.jpg'),
    buttonLabel: 'Comprar ahora',
    link: '/(tabs)/productos',
  },
  {
    id: '2',
    title: 'Envío Gratis',
    subtitle: 'En pedidos mayores a $500',
    bg: '#473B08',
    buttonLabel: 'Ver productos',
    link: '/(tabs)/productos',
  },
  {
    id: '3',
    title: 'Membresía Terroir',
    subtitle: 'Acumula puntos en cada compra',
    bg: '#5A2D1E',
    buttonLabel: 'Unirme',
    link: '/(tabs)/productos',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const categories = [
  { id: 'all', name: 'Todos', image: require('@/assets/images/coffee-product-5.jpg') },
  { id: 'espresso', name: 'Espresso', image: require('@/assets/images/espresso.jpg') },
  { id: 'cappuccino', name: 'Cappuccino', image: require('@/assets/images/cappuccino.jpg') },
  { id: 'latte', name: 'Latte', image: require('@/assets/images/product-latte.jpg') },
  { id: 'cold-brew', name: 'Cold Brew', image: require('@/assets/images/cold-brew.jpg') },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const featuredProducts = products.slice(0, 4);
  const addToCart = useCartStore((s) => s.addToCart);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const [cartAdded, setCartAdded] = useState<string[]>([]);

  // Main banner carousel
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Banner>>(null);
  const currentBannerRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Promo banner carousel
  const promoScrollX = useRef(new Animated.Value(0)).current;
  const promoFlatListRef = useRef<FlatList<PromoBanner>>(null);
  const currentPromoRef = useRef(0);
  const promoAutoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setCartAdded((prev) => [...prev, product.id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== product.id)), 1500);
  };

  // Main banner auto-play
  const advanceBanner = () => {
    const next = (currentBannerRef.current + 1) % BANNERS.length;
    flatListRef.current?.scrollToOffset({ offset: next * SLIDE_WIDTH, animated: true });
    currentBannerRef.current = next;
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (BANNERS.length > 1) {
      autoPlayRef.current = setInterval(advanceBanner, 4000);
    }
  };

  // Promo banner auto-play (offset by 1.5s so they don't advance together)
  const advancePromoBanner = () => {
    const next = (currentPromoRef.current + 1) % PROMO_BANNERS.length;
    promoFlatListRef.current?.scrollToOffset({ offset: next * SLIDE_WIDTH, animated: true });
    currentPromoRef.current = next;
  };

  const resetPromoAutoPlay = () => {
    if (promoAutoPlayRef.current) clearInterval(promoAutoPlayRef.current);
    if (PROMO_BANNERS.length > 1) {
      promoAutoPlayRef.current = setInterval(advancePromoBanner, 5000);
    }
  };

  useEffect(() => {
    resetAutoPlay();
    const promoDelay = setTimeout(() => resetPromoAutoPlay(), 1500);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (promoAutoPlayRef.current) clearInterval(promoAutoPlayRef.current);
      clearTimeout(promoDelay);
    };
  }, []);

  const onBannerScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const renderBanner = ({ item, index }: { item: Banner; index: number }) => {
    const inputRange = [
      (index - 1) * SLIDE_WIDTH,
      index * SLIDE_WIDTH,
      (index + 1) * SLIDE_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.93, 1, 0.93],
      extrapolate: 'clamp',
    });

    // Image shifts opposite to scroll direction, creating parallax depth
    const imageTranslateX = scrollX.interpolate({
      inputRange,
      outputRange: [PARALLAX_OFFSET, 0, -PARALLAX_OFFSET],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.bannerSlide, { transform: [{ scale }] }]}>
        {item.image ? (
          <Animated.Image
            source={item.image}
            style={[styles.bannerImage, { transform: [{ translateX: imageTranslateX }] }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: item.bg, borderRadius: 12 }]} />
        )}
        {item.image && <View style={styles.bannerOverlay} />}
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => router.push(item.link as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.bannerBtnText}>{item.buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const onPromoScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: promoScrollX } } }],
    { useNativeDriver: false },
  );

  const renderPromoBanner = ({ item, index }: { item: PromoBanner; index: number }) => {
    const inputRange = [
      (index - 1) * SLIDE_WIDTH,
      index * SLIDE_WIDTH,
      (index + 1) * SLIDE_WIDTH,
    ];

    const scale = promoScrollX.interpolate({
      inputRange,
      outputRange: [0.93, 1, 0.93],
      extrapolate: 'clamp',
    });

    const imageTranslateX = promoScrollX.interpolate({
      inputRange,
      outputRange: [PARALLAX_OFFSET, 0, -PARALLAX_OFFSET],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.promoBannerSlide, { transform: [{ scale }] }]}>
        {item.image ? (
          <Animated.Image
            source={item.image}
            style={[styles.promoBannerImage, { transform: [{ translateX: imageTranslateX }] }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: item.bg, borderRadius: 12 }]} />
        )}
        {item.image && (
          <View style={[styles.promoBannerOverlay, { backgroundColor: COLORS.darkBrown + 'CC' }]} />
        )}
        <View style={styles.promoBannerContent}>
          <View>
            <Text style={styles.promoTitle}>{item.title}</Text>
            <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => router.push(item.link as any)}
          >
            <Text style={styles.promoBtnText}>{item.buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <HeaderLayout>
      <View style={styles.safeArea}>
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
            <FlatList
              ref={flatListRef}
              data={BANNERS}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onBannerScroll}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
                currentBannerRef.current = index;
                resetAutoPlay();
              }}
              getItemLayout={(_, index) => ({
                length: SLIDE_WIDTH,
                offset: SLIDE_WIDTH * index,
                index,
              })}
              renderItem={renderBanner}
            />
            {/* Animated dots */}
            <View style={styles.dotsContainer}>
              {BANNERS.map((_, i) => {
                const dotWidth = scrollX.interpolate({
                  inputRange: [(i - 1) * SLIDE_WIDTH, i * SLIDE_WIDTH, (i + 1) * SLIDE_WIDTH],
                  outputRange: [6, 18, 6],
                  extrapolate: 'clamp',
                });
                const dotOpacity = scrollX.interpolate({
                  inputRange: [(i - 1) * SLIDE_WIDTH, i * SLIDE_WIDTH, (i + 1) * SLIDE_WIDTH],
                  outputRange: [0.35, 1, 0.35],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                  />
                );
              })}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Categorías</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => router.push('/(tabs)/productos' as any)}
                >
                  <Image source={cat.image} style={styles.categoryImage} resizeMode="cover" />
                  <View style={styles.categoryImageOverlay} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Promo Banner Carousel */}
          <View style={styles.promoBannerContainer}>
            <FlatList
              ref={promoFlatListRef}
              data={PROMO_BANNERS}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onPromoScroll}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
                currentPromoRef.current = index;
                resetPromoAutoPlay();
              }}
              getItemLayout={(_, index) => ({
                length: SLIDE_WIDTH,
                offset: SLIDE_WIDTH * index,
                index,
              })}
              renderItem={renderPromoBanner}
            />
            <View style={styles.dotsContainer}>
              {PROMO_BANNERS.map((_, i) => {
                const dotWidth = promoScrollX.interpolate({
                  inputRange: [(i - 1) * SLIDE_WIDTH, i * SLIDE_WIDTH, (i + 1) * SLIDE_WIDTH],
                  outputRange: [6, 18, 6],
                  extrapolate: 'clamp',
                });
                const dotOpacity = promoScrollX.interpolate({
                  inputRange: [(i - 1) * SLIDE_WIDTH, i * SLIDE_WIDTH, (i + 1) * SLIDE_WIDTH],
                  outputRange: [0.35, 1, 0.35],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                  />
                );
              })}
            </View>
          </View>

          {/* Featured Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Destacados</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/productos' as any)}>
                <Text style={styles.seeAll}>Ver todo →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                  inWishlist={wishlistIds.includes(product.id)}
                  inCart={cartAdded.includes(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                  onPress={() => router.push(`/productos/${product.id}` as any)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
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
    fontFamily: 'JosefinSans-Light',
    flex: 1,
    fontSize: 14,
    color: COLORS.darkBrown,
  },

  // ── Banner carousel ──────────────────────────────────────────────────────
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bannerSlide: {
    width: SLIDE_WIDTH,
    height: 165,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    // Wider than the slide so translateX has room to shift without gaps
    left: -PARALLAX_OFFSET,
    width: SLIDE_WIDTH + PARALLAX_OFFSET * 2,
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  bannerContent: {
    padding: 18,
  },
  bannerTitle: {
    fontFamily: 'BodoniModa-ExtraBold',
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.44,
  },
  bannerSubtitle: {
    fontFamily: 'JosefinSans-Light',
    color: COLORS.white + 'CC',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 10,
  },
  bannerBtnText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 12,
    letterSpacing: -0.2,
    color: COLORS.white,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },

  // ── Promo banner carousel ─────────────────────────────────────────────────
  promoBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  promoBannerSlide: {
    width: SLIDE_WIDTH,
    height: 82,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  promoBannerImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -PARALLAX_OFFSET,
    width: SLIDE_WIDTH + PARALLAX_OFFSET * 2,
    height: '100%',
  },
  promoBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.darkBrown + 'CC',
  },
  promoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  promoTitle: {
    fontFamily: 'BodoniModa-SemiBold',
    color: COLORS.white,
    fontSize: 17.5,
    lineHeight: 22,
    letterSpacing: -0.35,
  },
  promoSubtitle: {
    fontFamily: 'JosefinSans-Light',
    color: COLORS.white + 'CC',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: -0.18,
    marginTop: 2,
  },
  promoBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  promoBtnText: {
    fontFamily: 'JosefinSans-SemiBold',
    color: COLORS.darkBrown,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
  },

  // ── Sections ─────────────────────────────────────────────────────────────
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
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: COLORS.darkBrown,
    marginBottom: 12,
    textAlign: 'left',
  },
  seeAll: {
    fontFamily: 'JosefinSans-SemiBold',
    color: COLORS.accent,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  categoryImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  categoryName: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: -0.18,
    color: COLORS.white,
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
});

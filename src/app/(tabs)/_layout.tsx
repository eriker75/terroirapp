import { Tabs } from 'expo-router';
// Grid3X3 era el icono anterior de la tab Productos; se cambió por CoffeeBean
// (icono propio: el `Bean` de lucide parece una legumbre, no un grano de café).
import { Home, Heart, /* Grid3X3, Bean, */ ShoppingBag, User } from 'lucide-react-native';
import { CoffeeBean } from '@/components/ui/icons/CoffeeBean';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useStoreSync } from '@/hooks';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.cartCount);
  const wishlistCount = useWishlistStore((s) => s.wishlistCount);

  // Sincroniza carrito y wishlist con el backend mientras hay sesión
  // (merge al entrar + push del carrito con debounce).
  useStoreSync();

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#361E1C99',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarBadgeStyle: {
          backgroundColor: COLORS.accent,
          color: COLORS.darkBrown,
          fontSize: 10,
          fontWeight: '700',
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          lineHeight: 18,
        },
      }}
    >
      <Tabs.Screen
        name="(home)/index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="(home)/deseos"
        options={{
          title: 'Deseos',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 2} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
        }}
      />
      <Tabs.Screen
        name="(home)/productos"
        options={{
          title: 'Productos',
          // Icono anterior:
          // tabBarIcon: ({ color, size }) => <Grid3X3 color={color} size={size - 2} />,
          tabBarIcon: ({ color, size }) => <CoffeeBean color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="(home)/carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size - 2} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="(dashboard)/perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Esto fuerza a React Navigation a volver a la raíz de ese stack específico
            navigation.navigate('(dashboard)/perfil', { screen: 'index' });
          },
        })}
      />

      {/* Sub-screens - hidden from tab bar */}
      <Tabs.Screen name="(home)/productos/[id]" options={{ href: null }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}

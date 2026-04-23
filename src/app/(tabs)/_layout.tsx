import { Tabs } from 'expo-router';
import { Home, Heart, Grid3X3, ShoppingBag, User } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/src/constants/colors';
import { useAppStore } from '@/src/store/useAppStore';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const cartCount = useAppStore((s) => s.cartCount);
  const wishlistCount = useAppStore((s) => s.wishlistCount);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }} edges={['top']}>
    <Tabs
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
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="deseos"
        options={{
          title: 'Deseos',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 2} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => <Grid3X3 color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size - 2} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
        }}
      />

      {/* Hidden screens within (tabs) — tab bar remains visible */}
      <Tabs.Screen name="productos/[id]" options={{ href: null }} />
      <Tabs.Screen name="ordenes" options={{ href: null }} />
      <Tabs.Screen name="ordenes/[id]" options={{ href: null }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
      <Tabs.Screen name="perfil/editar" options={{ href: null }} />
      <Tabs.Screen name="perfil/favoritos" options={{ href: null }} />
      <Tabs.Screen name="perfil/direcciones" options={{ href: null }} />
      <Tabs.Screen name="perfil/tarjetas" options={{ href: null }} />
      <Tabs.Screen name="perfil/settings" options={{ href: null }} />
      <Tabs.Screen name="perfil/privacidad" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
    </SafeAreaView>
  );
}

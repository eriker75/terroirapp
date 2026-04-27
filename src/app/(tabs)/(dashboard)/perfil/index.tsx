import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ChevronRight,
  LogOut,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Star,
  Mail,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useProfileStore } from '@/store/useProfileStore';
import { useLogoutMutation } from '@/services';



function formatMemberSince(date: string): string {
  return `Miembro desde ${new Date(date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
}

const menuSections = [
  {
    title: 'Mi Cuenta',
    items: [
      { icon: ShoppingBag, label: 'Mis Órdenes', badge: null, route: '/perfil/ordenes' },
      { icon: Heart, label: 'Mis Favoritos', badge: null, route: '/perfil/favoritos' },
      { icon: MapPin, label: 'Mis Direcciones', badge: null, route: '/perfil/direcciones' },
      // { icon: CreditCard, label: 'Mis Tarjetas', badge: null, route: '/perfil/tarjetas' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { icon: Bell, label: 'Notificaciones', badge: null, route: '/notificaciones' },
      { icon: Settings, label: 'Preferencias', badge: null, route: '/perfil/settings' },
      { icon: Shield, label: 'Política de Privacidad', badge: null, route: '/perfil/privacidad' },
      { icon: Mail, label: 'Contacto', badge: null, route: '/perfil/contacto' },
      { icon: MapPin, label: 'Ubicación', badge: null, route: '/perfil/ubicacion' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useProfileStore((s) => s.user);
  const { mutate: logout } = useLogoutMutation();

  const points = user?.loyaltyPoints ?? 0;

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>☕</Text>
          </View>
          <Text style={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : '—'}
          </Text>
          <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
          <Text style={styles.userSince}>
            {user ? formatMemberSince(user.memberSince ?? user.createdAt) : ''}
          </Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/perfil/editar' as any)}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Mis Puntos</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    onPress={() => item.route && router.push(item.route as any)}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconBox}>
                        <Icon size={18} color={COLORS.brown} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <ChevronRight size={18} color={COLORS.darkBrown + '60'} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
          <LogOut size={18} color={COLORS.red} />
        </TouchableOpacity>

        <Text style={styles.version}>Terroir v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: 'BodoniModa-ExtraBold',
    fontSize: 35,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.darkBrown,
  },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },
  avatarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: { fontSize: 44 },
  userName: {
    fontFamily: 'BodoniModa-SemiBold',
    fontSize: 17.5,
    lineHeight: 22,
    letterSpacing: -0.35,
    color: COLORS.darkBrown,
  },
  userEmail: {
    fontFamily: 'JosefinSans-Light',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
  },
  userSince: {
    fontFamily: 'JosefinSans-Light',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.18,
    color: COLORS.darkBrown + '60',
    marginTop: 2,
  },
  editBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  editBtnText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.brown,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'BodoniModa-ExtraBold',
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.44,
    color: COLORS.accent,
  },
  statLabel: {
    fontFamily: 'JosefinSans-Light',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.18,
    color: COLORS.muted,
  },

  menuSection: { gap: 8 },
  menuSectionTitle: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.18,
    color: COLORS.darkBrown + '80',
    textTransform: 'uppercase',
    paddingHorizontal: 2,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontFamily: 'JosefinSans-Light',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkBrown,
  },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  menuBadgeText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.18,
    color: COLORS.darkBrown,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoutText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.red,
  },
  version: {
    fontFamily: 'JosefinSans-Light',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
});

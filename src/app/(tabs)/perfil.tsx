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
  Settings,
  Shield,
  Star,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

const menuSections = [
  {
    title: 'Mi Cuenta',
    items: [
      { icon: ShoppingBag, label: 'Mis Órdenes', badge: '5', route: '/ordenes' },
      { icon: Heart, label: 'Mis Favoritos', badge: '12', route: '/perfil/favoritos' },
      { icon: MapPin, label: 'Mis Direcciones', badge: null, route: '/perfil/direcciones' },
      { icon: CreditCard, label: 'Mis Tarjetas', badge: null, route: '/perfil/tarjetas' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { icon: Bell, label: 'Notificaciones', badge: '2', route: '/notificaciones' },
      { icon: Settings, label: 'Preferencias', badge: null, route: '/perfil/settings' },
      { icon: Shield, label: 'Política de Privacidad', badge: null, route: '/perfil/privacidad' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>☕</Text>
          </View>
          <Text style={styles.userName}>Ronald Richards</Text>
          <Text style={styles.userEmail}>ronald@gmail.com</Text>
          <Text style={styles.userSince}>Miembro desde Enero 2024</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/perfil/editar' as any)}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/ordenes' as any)}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>340</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
        </View>

        {/* Loyalty Progress */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Star size={16} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.loyaltyTitle}>Nivel Gold</Text>
            <Text style={styles.loyaltyPoints}>340 / 500 pts</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '68%' }]} />
          </View>
          <Text style={styles.loyaltyHint}>160 puntos más para Platinum</Text>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
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
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  userEmail: { fontSize: 14, color: COLORS.muted },
  userSince: { fontSize: 12, color: COLORS.darkBrown + '60', marginTop: 2 },
  editBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  editBtnText: { fontSize: 13, color: COLORS.brown, fontWeight: '600' },
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
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.accent },
  statLabel: { fontSize: 11, color: COLORS.muted },
  loyaltyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
  },
  loyaltyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loyaltyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.darkBrown, flex: 1 },
  loyaltyPoints: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  progressBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  loyaltyHint: { fontSize: 12, color: COLORS.muted },
  menuSection: { gap: 8 },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkBrown + '80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  menuItemLabel: { fontSize: 15, color: COLORS.darkBrown },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.darkBrown },
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
  logoutText: { fontSize: 15, fontWeight: '600', color: COLORS.red },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.muted, marginTop: 4 },
});

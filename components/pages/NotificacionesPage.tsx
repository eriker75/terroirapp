import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

type NotifType = 'promo' | 'order' | 'loyalty' | 'new';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  read: boolean;
  type: NotifType;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Oferta Especial de Café',
    description: 'Tu café favorito Etiopía disponible con 20% descuento. ¡Solo por hoy!',
    time: '1h',
    icon: '🎉',
    read: false,
    type: 'promo',
  },
  {
    id: 2,
    title: 'Fin de Semana Especial',
    description: '15% descuento en todos los blends premium este fin de semana.',
    time: '3h',
    icon: '☕',
    read: false,
    type: 'promo',
  },
  {
    id: 3,
    title: 'Tu pedido fue entregado',
    description: 'Tu pedido #576404 fue entregado exitosamente. ¡Gracias por tu compra!',
    time: '1d',
    icon: '✅',
    read: true,
    type: 'order',
  },
  {
    id: 4,
    title: 'Café Brasil Especial',
    description: 'Nuevo café Brasil Limited Edition ya disponible en nuestra tienda.',
    time: '2d',
    icon: '✨',
    read: true,
    type: 'new',
  },
  {
    id: 5,
    title: 'Programa de Lealtad',
    description: 'Has acumulado 150 puntos. Canjéalos por tu próxima compra.',
    time: '3d',
    icon: '⭐',
    read: true,
    type: 'loyalty',
  },
  {
    id: 6,
    title: 'Tu pedido está en camino',
    description: 'Tu pedido #741235 está siendo preparado y pronto estará en camino.',
    time: '4d',
    icon: '📦',
    read: true,
    type: 'order',
  },
];

type FilterTab = 'all' | 'unread';

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
  useSafeArea?: boolean;
}

export default function NotificacionesPage({ showBackButton = false, onBack, useSafeArea = true }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const Content = (
    <>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {/* Filter tabs + mark all read */}
      <View style={styles.filterRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, filter === 'all' && styles.tabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === 'unread' && styles.tabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.tabText, filter === 'unread' && styles.tabTextActive]}>
              No leídas
            </Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Marcar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
            </Text>
          </View>
        ) : (
          displayed.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.8}
            >
              <View style={styles.notifIcon}>
                <Text style={styles.notifEmoji}>{notif.icon}</Text>
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTitleRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifDesc} numberOfLines={2}>{notif.description}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
  );

  if (useSafeArea) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {Content}
      </SafeAreaView>
    );
  }

  return <View style={styles.safeArea}>{Content}</View>;
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
  unreadBadge: {
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: { color: COLORS.darkBrown, fontSize: 12, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '500', color: COLORS.darkBrown + '80' },
  tabTextActive: { color: COLORS.darkBrown, fontWeight: '600' },
  markAllText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  listContent: { padding: 16, gap: 10, paddingBottom: 24 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  notifCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  notifCardUnread: {
    backgroundColor: COLORS.accent + '0D',
    borderColor: COLORS.accent + '4D',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifEmoji: { fontSize: 22 },
  notifBody: { flex: 1, gap: 4 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkBrown,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    flexShrink: 0,
  },
  notifDesc: { fontSize: 13, color: COLORS.darkBrown + 'AA', lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});

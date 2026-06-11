import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useStoreSettings } from '@/services/settings/settings.service';
import {
  DEFAULT_TIMEZONE,
  getStoreStatus,
  HOURS_GROUP,
  HOURS_POLICY_KEY,
  HOURS_SCHEDULE_KEY,
  HOURS_TIMEZONE_KEY,
  nextOpeningLabel,
  parseSchedule,
} from '@/lib/store-hours';

/**
 * Aviso de pedido fuera del horario de servicio (espejo del StoreHoursNotice
 * de la web). No renderiza nada si el admin no configuró horario o si la
 * tienda está abierta (en `at`, o ahora).
 *
 * - `placed` (detalle de orden): redacción post-compra evaluada en
 *   `at` = createdAt del pedido — "tu pedido se procesará…".
 * - sin `placed` (carrito/checkout): aviso previo a la compra; el bloqueo
 *   real (política 'block') lo aplica el backend al confirmar.
 */
export function StoreHoursNotice({ at, placed = false }: { at?: string | Date; placed?: boolean }) {
  const { get, isLoading } = useStoreSettings(HOURS_GROUP);

  const schedule = parseSchedule(get(HOURS_SCHEDULE_KEY));
  if (isLoading || !schedule) return null;

  const status = getStoreStatus(
    schedule,
    get(HOURS_TIMEZONE_KEY, DEFAULT_TIMEZONE),
    at ? new Date(at) : undefined,
  );
  if (status.isOpen) return null;

  const policy = get(HOURS_POLICY_KEY) === 'block' ? 'block' : 'notify';
  const when = nextOpeningLabel(status.nextOpening) ?? 'en el próximo horario de servicio';
  const message = placed
    ? `Tu pedido fue realizado fuera del horario de servicio, así que lo procesaremos ${when}.`
    : policy === 'block'
      ? `En este momento no es posible completar pedidos. Podrás confirmar tu compra ${when}.`
      : `Puedes completar tu pedido ahora y lo procesaremos ${when}.`;

  return (
    <View style={styles.container}>
      <Clock size={18} color="#92400E" style={styles.icon} />
      <View style={styles.textBox}>
        <Text style={styles.title}>
          {placed ? 'Pedido fuera de horario' : 'Estás comprando fuera del horario de servicio'}
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
  },
  icon: { marginTop: 2 },
  textBox: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  message: { fontSize: 13, color: '#92400E', marginTop: 2, lineHeight: 18 },
});

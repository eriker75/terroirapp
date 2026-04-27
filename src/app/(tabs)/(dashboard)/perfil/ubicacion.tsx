import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, ExternalLink, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

const LOCATION = 'Las Mercedes, Caracas, Venezuela';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION)}`;

// Calles del mapa ilustrativo
const H_STREETS = [
  { top: '18%', width: 12, label: 'Av. Principal de Las Mercedes', labelLeft: '3%' },
  { top: '42%', width: 7,  label: 'Calle Monterrey',               labelLeft: '3%' },
  { top: '62%', width: 5,  label: 'Calle Madrid',                  labelLeft: '3%' },
  { top: '78%', width: 4,  label: '',                              labelLeft: '3%' },
];
const V_STREETS = [
  { left: '22%', width: 10, label: 'Av. Venezuela',   labelTop: '2%' },
  { left: '52%', width: 7,  label: 'Calle Mucuchíes', labelTop: '2%' },
  { left: '74%', width: 4,  label: '',                labelTop: '2%' },
  { left: '8%',  width: 4,  label: '',                labelTop: '2%' },
];
const BLOCKS = [
  { top: '22%', left: '25%', w: '25%', h: '18%', color: COLORS.border },
  { top: '22%', left: '55%', w: '17%', h: '18%', color: COLORS.border },
  { top: '22%', left: '11%', w: '9%',  h: '18%', color: COLORS.border },
  { top: '46%', left: '25%', w: '25%', h: '14%', color: '#C8C0AA' },   // parque
  { top: '46%', left: '55%', w: '17%', h: '14%', color: COLORS.border },
  { top: '46%', left: '11%', w: '9%',  h: '14%', color: COLORS.border },
  { top: '66%', left: '25%', w: '25%', h: '10%', color: COLORS.border },
  { top: '66%', left: '55%', w: '17%', h: '10%', color: COLORS.border },
  { top: '66%', left: '11%', w: '9%',  h: '10%', color: COLORS.border },
];

export default function UbicacionPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.lightBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubicación</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Tarjeta dirección */}
        <View style={styles.infoCard}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={COLORS.accent} />
          </View>
          <View style={styles.infoTexts}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{LOCATION}</Text>
          </View>
        </View>

        {/* Mapa ilustrativo */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => Linking.openURL(MAPS_URL)}
          activeOpacity={0.92}
        >
          <View style={styles.mapBg}>
            {/* Manzanas / bloques */}
            {BLOCKS.map((b, i) => (
              <View
                key={i}
                style={[styles.block, {
                  top: b.top as any,
                  left: b.left as any,
                  width: b.w as any,
                  height: b.h as any,
                  backgroundColor: b.color,
                }]}
              />
            ))}

            {/* Calles horizontales */}
            {H_STREETS.map((s, i) => (
              <View key={`h${i}`} style={[styles.streetH, { top: s.top as any, height: s.width }]}>
                {s.label ? (
                  <Text style={styles.streetLabel} numberOfLines={1}>{s.label}</Text>
                ) : null}
              </View>
            ))}

            {/* Calles verticales */}
            {V_STREETS.map((s, i) => (
              <View key={`v${i}`} style={[styles.streetV, { left: s.left as any, width: s.width }]}>
                {s.label ? (
                  <Text style={[styles.streetLabel, styles.streetLabelV]} numberOfLines={1}>
                    {s.label}
                  </Text>
                ) : null}
              </View>
            ))}

            {/* Marcador centrado */}
            <View style={styles.markerWrapper}>
              <View style={styles.markerPin}>
                <MapPin size={18} color={COLORS.lightBeige} />
              </View>
              <View style={styles.markerShadow} />
            </View>

            {/* Badge "Toca para abrir" */}
            <View style={styles.tapBadge}>
              <Navigation size={11} color={COLORS.lightBeige} />
              <Text style={styles.tapBadgeText}>Toca para abrir en Maps</Text>
            </View>
          </View>

          {/* Pie */}
          <View style={styles.mapFooter}>
            <MapPin size={14} color={COLORS.accent} />
            <Text style={styles.mapAddress}>{LOCATION}</Text>
            <View style={styles.openMapBtn}>
              <Text style={styles.openMapText}>Ver en mapa</Text>
              <ExternalLink size={12} color={COLORS.lightBeige} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBrown, paddingTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: COLORS.darkBrown,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.lightBeige },
  content: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
    padding: 16,
    gap: 16,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },

  // Mapa
  mapCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapBg: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {
    position: 'absolute',
    borderRadius: 3,
  },
  streetH: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingLeft: 6,
  },
  streetV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: 6,
    overflow: 'hidden',
  },
  streetLabel: {
    fontSize: 7,
    color: COLORS.muted,
    fontWeight: '500',
  },
  streetLabelV: {
    writingDirection: 'ltr',
    transform: [{ rotate: '90deg' }],
    width: 80,
  },
  markerWrapper: {
    alignItems: 'center',
    zIndex: 10,
  },
  markerPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkBrown,
    borderWidth: 3,
    borderColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.darkBrown,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 7,
    elevation: 10,
  },
  markerShadow: {
    width: 14,
    height: 5,
    borderRadius: 7,
    backgroundColor: 'rgba(54,30,28,0.25)',
    marginTop: 3,
  },
  tapBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.darkBrown + 'CC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tapBadgeText: {
    fontSize: 10,
    color: COLORS.lightBeige,
    fontWeight: '600',
  },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  mapAddress: { flex: 1, fontSize: 13, color: COLORS.darkBrown, fontWeight: '500' },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openMapText: { fontSize: 12, fontWeight: '600', color: COLORS.lightBeige },
});

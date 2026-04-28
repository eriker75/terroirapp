import { ArrowLeft, ExternalLink, MapPin, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapPicker } from '@/components/blocs/MapPicker';
import { COLORS } from '@/constants/colors';

const LOCATION = 'Las Mercedes, Caracas, Venezuela';
const STORE_LAT = 10.4894;
const STORE_LNG = -66.8636;
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${STORE_LAT},${STORE_LNG}`;

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
        <View style={styles.infoCard}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={COLORS.accent} />
          </View>
          <View style={styles.infoTexts}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{LOCATION}</Text>
          </View>
        </View>

        <View style={styles.mapWrapper}>
          <MapPicker
            readOnly
            initialLatitude={STORE_LAT}
            initialLongitude={STORE_LNG}
            height={360}
            zoomLevel={16}
          />

          <View style={styles.tapBadge}>
            <Navigation size={11} color={COLORS.lightBeige} />
            <Text style={styles.tapBadgeText}>Toca para abrir en Maps</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.openMapBtn}
          onPress={() => Linking.openURL(MAPS_URL)}
          activeOpacity={0.85}
        >
          <MapPin size={14} color={COLORS.lightBeige} />
          <Text style={styles.openMapText}>Abrir en Google Maps</Text>
          <ExternalLink size={14} color={COLORS.lightBeige} />
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
  mapWrapper: { position: 'relative' },
  tapBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.darkBrown + 'CC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tapBadgeText: {
    fontSize: 11,
    color: COLORS.lightBeige,
    fontWeight: '600',
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.darkBrown,
    paddingVertical: 14,
    borderRadius: 12,
  },
  openMapText: { color: COLORS.lightBeige, fontSize: 14, fontWeight: '700' },
});

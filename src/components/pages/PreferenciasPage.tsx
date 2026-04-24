import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Mail, Globe, DollarSign, Moon, Vibrate } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ size: number; color: string }>;
  value: boolean;
}

type Language = 'es' | 'en';
type Currency = 'USD' | 'EUR' | 'MXN';

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
  useSafeArea?: boolean;
}

export default function PreferenciasPage({ showBackButton = false, onBack, useSafeArea = true }: Props) {
  const router = useRouter();

  const [toggles, setToggles] = useState<ToggleSetting[]>([
    {
      id: 'push',
      label: 'Notificaciones push',
      description: 'Ofertas, pedidos y novedades',
      icon: Bell,
      value: true,
    },
    {
      id: 'email',
      label: 'Notificaciones por email',
      description: 'Recibe el resumen semanal',
      icon: Mail,
      value: true,
    },
    /*
    {
      id: 'darkMode',
      label: 'Modo oscuro',
      description: 'Tema oscuro en la app',
      icon: Moon,
      value: false,
    },
    {
      id: 'haptics',
      label: 'Vibración',
      description: 'Feedback táctil en botones',
      icon: Vibrate,
      value: true,
    },
    */
  ]);

  const [language, setLanguage] = useState<Language>('es');
  const [currency, setCurrency] = useState<Currency>('USD');

  const toggleSetting = (id: string) => {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, value: !t.value } : t))
    );
  };

  const handleClearCache = () => {
    Alert.alert('Limpiar caché', '¿Limpiar los datos temporales de la app?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar', onPress: () => Alert.alert('Listo', 'Caché eliminada correctamente') },
    ]);
  };

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
        <Text style={styles.headerTitle}>Preferencias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Notifications & display toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones y pantalla</Text>
          <View style={styles.card}>
            {toggles.map((setting, index) => {
              const Icon = setting.icon;
              const isLast = index === toggles.length - 1;
              return (
                <View
                  key={setting.id}
                  style={[styles.row, !isLast && styles.rowBorder]}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBox}>
                      <Icon size={18} color={COLORS.brown} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{setting.label}</Text>
                      <Text style={styles.rowDesc}>{setting.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: COLORS.border, true: COLORS.accent + 'AA' }}
                    thumbColor={setting.value ? COLORS.accent : COLORS.white}
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Language & Storage Commented Out
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma y región</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Globe size={18} color={COLORS.brown} />
                </View>
                <Text style={styles.rowLabel}>Idioma</Text>
              </View>
              <View style={styles.segmented}>
                {(['es', 'en'] as Language[]).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.segBtn, language === lang && styles.segBtnActive]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={[styles.segBtnText, language === lang && styles.segBtnTextActive]}>
                      {lang === 'es' ? 'Español' : 'English'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.row, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <DollarSign size={18} color={COLORS.brown} />
                </View>
                <Text style={styles.rowLabel}>Moneda</Text>
              </View>
              <View style={styles.segmented}>
                {(['USD', 'EUR', 'MXN'] as Currency[]).map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    style={[styles.segBtn, currency === cur && styles.segBtnActive]}
                    onPress={() => setCurrency(cur)}
                  >
                    <Text style={[styles.segBtnText, currency === cur && styles.segBtnTextActive]}>
                      {cur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Almacenamiento</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Caché de la app</Text>
                <Text style={styles.rowDesc}>3.2 MB utilizados</Text>
              </View>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleClearCache}>
                <Text style={styles.outlineBtnText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        */}

        {/* Version info */}
        <View style={styles.versionCard}>
          <Text style={styles.versionText}>Terroir App v1.0.0</Text>
          <Text style={styles.versionSub}>Todos los derechos reservados © 2024</Text>
        </View>
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
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkBrown + '80',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, color: COLORS.darkBrown, fontWeight: '500' },
  rowDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBeige,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  segBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  segBtnActive: { backgroundColor: COLORS.accent },
  segBtnText: { fontSize: 12, color: COLORS.darkBrown + '80', fontWeight: '500' },
  segBtnTextActive: { color: COLORS.darkBrown, fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  outlineBtnText: { fontSize: 13, color: COLORS.brown, fontWeight: '600' },
  versionCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  versionText: { fontSize: 13, color: COLORS.muted },
  versionSub: { fontSize: 11, color: COLORS.darkBrown + '50' },
});

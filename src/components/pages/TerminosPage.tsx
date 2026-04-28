import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, FileText } from 'lucide-react-native';
import { useState } from 'react';
import { COLORS } from '@/constants/colors';

const sections = [
  {
    id: 1,
    title: '1. Aceptación de los Términos',
    content:
      'Al crear una cuenta o usar la aplicación Terroir, aceptas estos términos de servicio en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no uses la app.',
  },
  {
    id: 2,
    title: '2. Uso de la Aplicación',
    content:
      'La app está destinada a uso personal para comprar café de especialidad. No está permitido usarla con fines comerciales no autorizados, realizar ingeniería inversa ni intentar acceder a sistemas no públicos.',
  },
  {
    id: 3,
    title: '3. Cuenta de Usuario',
    content:
      'Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Notifícanos de inmediato ante cualquier uso no autorizado.',
  },
  {
    id: 4,
    title: '4. Pedidos y Pagos',
    content:
      'Todos los pedidos están sujetos a disponibilidad. Nos reservamos el derecho de cancelar pedidos en casos de error de precio o fraude. Los pagos se procesan de forma segura a través de nuestros proveedores.',
  },
  {
    id: 5,
    title: '5. Devoluciones y Reembolsos',
    content:
      'Aceptamos devoluciones dentro de los 7 días posteriores a la entrega si el producto está defectuoso o es diferente al pedido. Contáctanos para iniciar el proceso.',
  },
  {
    id: 6,
    title: '6. Propiedad Intelectual',
    content:
      'Todo el contenido de la app (logotipos, textos, imágenes) es propiedad de Terroir o sus licenciantes. No puedes reproducirlo sin autorización previa por escrito.',
  },
  {
    id: 7,
    title: '7. Limitación de Responsabilidad',
    content:
      'Terroir no será responsable de daños indirectos o consecuentes derivados del uso de la app. Nuestra responsabilidad máxima se limita al valor del pedido en cuestión.',
  },
  {
    id: 8,
    title: '8. Modificaciones',
    content:
      'Podemos actualizar estos términos en cualquier momento. Te notificaremos de cambios importantes. El uso continuado de la app después de los cambios implica tu aceptación.',
  },
  {
    id: 9,
    title: '9. Contacto',
    content:
      'Para consultas sobre estos términos, contáctanos en legal@terroir.com o a través del formulario de contacto en la app.',
  },
];

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
  useSafeArea?: boolean;
}

export default function TerminosPage({ showBackButton = false, onBack, useSafeArea = true }: Props) {
  const [expanded, setExpanded] = useState<number | null>(1);

  const toggle = (id: number) => setExpanded((prev) => (prev === id ? null : id));

  const Content = (
    <>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>Términos de Servicio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <View style={styles.introIconBox}>
            <FileText size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.introTitle}>Términos de Servicio</Text>
          <Text style={styles.introText}>
            Estos términos regulan el uso de la aplicación Terroir. Por favor léelos antes de crear tu cuenta.
          </Text>
          <Text style={styles.introDate}>Última actualización: Enero 2024</Text>
        </View>

        <View style={styles.accordion}>
          {sections.map((section, index) => {
            const isOpen = expanded === section.id;
            const isLast = index === sections.length - 1;
            return (
              <View key={section.id}>
                <TouchableOpacity
                  style={[styles.accordionRow, !isLast && !isOpen && styles.accordionBorder]}
                  onPress={() => toggle(section.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accordionTitle}>{section.title}</Text>
                  {isOpen ? (
                    <ChevronUp size={18} color={COLORS.accent} />
                  ) : (
                    <ChevronDown size={18} color={COLORS.darkBrown + '60'} />
                  )}
                </TouchableOpacity>
                {isOpen && (
                  <View style={[styles.accordionContent, !isLast && styles.accordionBorder]}>
                    <Text style={styles.accordionText}>{section.content}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Tienes preguntas?</Text>
          <Text style={styles.contactText}>
            Escríbenos en cualquier momento a{' '}
            <Text style={styles.contactEmail}>legal@terroir.com</Text>
          </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  introCard: {
    backgroundColor: COLORS.darkBrown,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  introIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  introTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  introText: { color: COLORS.white + 'CC', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  introDate: { color: COLORS.white + '80', fontSize: 11, marginTop: 4 },
  accordion: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  accordionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  accordionTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.darkBrown, paddingRight: 8 },
  accordionContent: { paddingHorizontal: 16, paddingBottom: 16 },
  accordionText: { fontSize: 13, lineHeight: 20 },
  contactCard: {
    backgroundColor: COLORS.accent + '15',
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    borderRadius: 12,
    padding: 16,
    gap: 4,
    alignItems: 'center',
  },
  contactTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown },
  contactText: { fontSize: 13, textAlign: 'center' },
  contactEmail: { color: COLORS.accent, fontWeight: '600' },
});

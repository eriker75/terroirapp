import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { COLORS } from '@/src/constants/colors';

const sections = [
  {
    id: 1,
    title: '1. Recopilación de Datos',
    content:
      'Recopilamos información personal cuando creas una cuenta, realizas un pedido, participas en encuestas o nos contactas. Esto incluye nombre, correo electrónico, dirección de entrega y datos de pago (cifrados).',
  },
  {
    id: 2,
    title: '2. Uso de la Información',
    content:
      'Utilizamos tu información para procesar pedidos, enviar confirmaciones, mejorar nuestros servicios, personalizar tu experiencia y enviarte comunicaciones de marketing (solo si lo autorizas).',
  },
  {
    id: 3,
    title: '3. Protección de Datos',
    content:
      'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o divulgación. Utilizamos cifrado SSL para todas las transacciones.',
  },
  {
    id: 4,
    title: '4. Compartir con Terceros',
    content:
      'No vendemos tu información personal. Podemos compartirla con socios de entrega y procesadores de pago para completar tus pedidos, siempre bajo acuerdos de confidencialidad.',
  },
  {
    id: 5,
    title: '5. Derechos del Usuario',
    content:
      'Tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento desde la configuración de tu cuenta o contactándonos directamente.',
  },
  {
    id: 6,
    title: '6. Cookies',
    content:
      'Usamos cookies para mejorar tu experiencia de navegación. Puedes configurar tu navegador para rechazarlas, aunque esto podría afectar algunas funciones de la app.',
  },
  {
    id: 7,
    title: '7. Cambios a esta Política',
    content:
      'Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos por correo electrónico o mediante una notificación en la app.',
  },
  {
    id: 8,
    title: '8. Contacto',
    content:
      'Si tienes preguntas sobre esta política, contáctanos en privacy@terroir.com o a través del formulario de contacto de la app.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(1);

  const toggle = (id: number) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔒</Text>
          <Text style={styles.introTitle}>Tu privacidad nos importa</Text>
          <Text style={styles.introText}>
            En Terroir nos comprometemos a proteger tu información personal. Esta política describe cómo recopilamos, usamos y protegemos tus datos.
          </Text>
          <Text style={styles.introDate}>Última actualización: Enero 2024</Text>
        </View>

        {/* Accordion sections */}
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

        {/* Contact card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Tienes preguntas?</Text>
          <Text style={styles.contactText}>
            Escríbenos en cualquier momento a{' '}
            <Text style={styles.contactEmail}>privacy@terroir.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  introEmoji: { fontSize: 32 },
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
  accordionText: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },
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
  contactText: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  contactEmail: { color: COLORS.accent, fontWeight: '600' },
});

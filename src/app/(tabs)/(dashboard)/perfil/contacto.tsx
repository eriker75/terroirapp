import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function ContactoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }
    Alert.alert(
      'Mensaje Enviado',
      'Gracias por contactarnos. Te responderemos a la brevedad.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Nuestra Información</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.iconBox}>
              <MapPin size={20} color={COLORS.accent} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>Las Mercedes, Caracas, Venezuela</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconBox}>
              <Phone size={20} color={COLORS.accent} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>+58 412 123 4567</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconBox}>
              <Mail size={20} color={COLORS.accent} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>hola@terroir.com</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Envíanos un mensaje</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. juan@correo.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mensaje</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="¿En qué te podemos ayudar?"
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={18} color={COLORS.darkBrown} />
            <Text style={styles.sendBtnText}>Enviar Mensaje</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 4 },
  infoContainer: { gap: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  formContainer: { gap: 16, backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
  input: {
    backgroundColor: COLORS.lightBeige,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  textArea: { height: 100 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  sendBtnText: { color: COLORS.darkBrown, fontSize: 15, fontWeight: '700' },
});

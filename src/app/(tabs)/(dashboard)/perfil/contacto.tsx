import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Send, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useCreateContactMessageMutation } from '@/services/contact/contact.service';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

const PHONE_NUMBER = '584121234567';

// El backend puede devolver `message` como string o como string[] (validaciones).
function apiMessage(err: unknown, fallback: string): string {
  const data = (err as AxiosError<ApiError>)?.response?.data?.message;
  if (Array.isArray(data)) return data[0] ?? fallback;
  return data ?? fallback;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const { mutate: sendMessage, isPending } = useCreateContactMessageMutation();

  const handleSend = () => {
    if (isPending) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }
    if (trimmedName.length < 2) {
      Alert.alert('Error', 'El nombre es demasiado corto.');
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    if (trimmedMessage.length < 5) {
      Alert.alert('Error', 'El mensaje es demasiado corto (mínimo 5 caracteres).');
      return;
    }

    sendMessage(
      { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setMessage('');
          Alert.alert(
            'Mensaje enviado',
            'Gracias por contactarnos. Te responderemos a la brevedad.',
            [{ text: 'OK', onPress: () => router.back() }],
          );
        },
        onError: (err) => {
          Alert.alert('No se pudo enviar', apiMessage(err, 'Inténtalo de nuevo en un momento.'));
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.lightBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* WhatsApp */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL(`https://wa.me/${PHONE_NUMBER}`)}
          activeOpacity={0.7}
        >
          <View style={styles.iconBox}>
            <Phone size={20} color={COLORS.accent} />
          </View>
          <View style={styles.contactTexts}>
            <Text style={styles.columnTitle}>WhatsApp</Text>
            <View style={styles.linkRow}>
              <Text style={styles.linkValue}>+58 412 123 4567</Text>
              <ExternalLink size={11} color={COLORS.accent} />
            </View>
          </View>
        </TouchableOpacity>

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

          <TouchableOpacity
            style={[styles.sendBtn, isPending && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={COLORS.darkBrown} />
            ) : (
              <Send size={18} color={COLORS.darkBrown} />
            )}
            <Text style={styles.sendBtnText}>
              {isPending ? 'Enviando...' : 'Enviar Mensaje'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBrown, paddingTop: 10 },
  scroll: { flex: 1, backgroundColor: COLORS.lightBeige },
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
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 4 },
  contactCard: {
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
  contactTexts: { flex: 1, gap: 2 },
  columnTitle: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  formContainer: {
    gap: 16,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
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

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Mail, Phone, Calendar, Camera, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { useProfileStore } from '@/store/useProfileStore';
import { useUpdateProfileMutation } from '@/services/auth/auth.service';
import { useUploadImageMutation } from '@/services/files/files.service';
import { resolveImageSource } from '@/lib/product-mapper';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

function apiMessage(err: unknown, fallback: string): string {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useProfileStore((s) => s.user);

  const [name, setName] = useState(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfileMutation();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImageMutation();

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Permite el acceso a tus fotos para cambiar el avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    uploadImage(
      {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${user?.id ?? 'me'}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      },
      {
        onSuccess: (data) => setAvatar(data.url),
        onError: (err) => Alert.alert('Error', apiMessage(err, 'No se pudo subir la imagen.')),
      },
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'El correo no puede estar vacío');
      return;
    }
    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ');

    updateProfile(
      {
        email: email.trim(),
        firstName,
        lastName,
        phone: phone.trim(),
        birthDate: birthDate.trim() || undefined,
        avatar: avatar || undefined,
      },
      {
        onSuccess: () =>
          Alert.alert('¡Listo!', 'Tu perfil fue actualizado correctamente', [
            { text: 'OK', onPress: () => router.back() },
          ]),
        onError: (err) => Alert.alert('Error', apiMessage(err, 'No se pudo actualizar el perfil.')),
      },
    );
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatar ? (
                <Image source={resolveImageSource(avatar)} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <User size={44} color={COLORS.white} />
              )}
              {isUploading && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color={COLORS.white} />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={pickAvatar} disabled={isUploading}>
              <Camera size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickAvatar} disabled={isUploading}>
            <Text style={styles.changePhotoText}>
              {isUploading ? 'Subiendo…' : 'Cambiar foto de perfil'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información personal</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={COLORS.darkBrown + '60'}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Mail size={14} color={COLORS.muted} />
              <Text style={styles.label}>Correo electrónico</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.darkBrown + '60'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Phone size={14} color={COLORS.muted} />
              <Text style={styles.label}>Teléfono</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(000) 000-0000"
              placeholderTextColor={COLORS.darkBrown + '60'}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.fieldGroup, { borderBottomWidth: 0 }]}>
            <View style={styles.labelRow}>
              <Calendar size={14} color={COLORS.muted} />
              <Text style={styles.label}>Fecha de nacimiento (opcional)</Text>
            </View>
            <DatePickerField value={birthDate} onChange={setBirthDate} />
          </View>
        </View>

        {/* Password section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <TouchableOpacity
            style={styles.securityRow}
            onPress={() => router.push('/(tabs)/(dashboard)/perfil/cambiar-password' as any)}
          >
            <View>
              <Text style={styles.securityLabel}>Cambiar contraseña</Text>
              <Text style={styles.securityHint}>Actualiza tu contraseña de acceso</Text>
            </View>
            <View style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>Cambiar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.submitBtnText}>
            {isSaving ? 'Guardando cambios...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  saveBtn: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  avatarSection: { alignItems: 'center', paddingVertical: 12, gap: 10 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 96, height: 96 },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.darkBrown,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightBeige,
  },
  changePhotoText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkBrown + '70',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  fieldGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
    marginBottom: 14,
    gap: 6,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  input: {
    fontSize: 15,
    color: COLORS.darkBrown,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  securityLabel: { fontSize: 15, color: COLORS.darkBrown, fontWeight: '500' },
  securityHint: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  securityBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  securityBadgeText: { fontSize: 13, color: COLORS.brown, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.darkBrown,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

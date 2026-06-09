import { api } from '@/config/api';
import type {
  LoginRequestDto,
  RegisterRequestDto,
  UpdateProfileRequestDto,
} from '@/dtos/auth/auth.request.dto';
import type { AuthResponseDto } from '@/dtos/auth/auth.response.dto';
import type { AccountType, UserProfile, UserRole, UserStatus } from '@/types/auth.types';

const nowIso = () => new Date().toISOString();

// ── Shapes del backend NestJS ────────────────────────────────────────────────
// El backend devuelve el usuario "plano" (campos al nivel raíz). login/register/
// refresh añaden accessToken + refreshToken al mismo objeto.
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  accountType?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  avatar?: string | null;
  birthDate?: string | null;
  loyaltyPoints?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendAuthResponse extends BackendUser {
  accessToken: string;
  refreshToken: string;
}

/** Mapea el usuario plano del backend al UserProfile que usa la app. */
export function mapBackendUser(u: BackendUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: (u.role as UserRole) ?? 'customer',
    status: (u.status as UserStatus) ?? 'active',
    accountType: (u.accountType as AccountType) ?? 'B2C',
    // El backend puede devolver null o, en login/refresh, omitir estos campos.
    // Los normalizamos a string vacío para mantener el contrato de UserProfile.
    phone: u.phone ?? '',
    address: u.address ?? '',
    city: u.city ?? '',
    state: u.state ?? '',
    zip: u.zip ?? '',
    country: u.country ?? '',
    avatar: u.avatar ?? undefined,
    birthDate: u.birthDate ?? undefined,
    loyaltyPoints: u.loyaltyPoints ?? 0,
    createdAt: u.createdAt ?? nowIso(),
    updatedAt: u.updatedAt ?? nowIso(),
  };
}

function toAuthResponse(d: BackendAuthResponse): AuthResponseDto {
  return {
    accessToken: d.accessToken,
    refreshToken: d.refreshToken,
    user: mapBackendUser(d),
  };
}

// ── Auth real contra el backend ──────────────────────────────────────────────

export const loginRequest = (dto: LoginRequestDto): Promise<AuthResponseDto> =>
  api
    .post<BackendAuthResponse>('/users/login', { email: dto.email, password: dto.password })
    .then((r) => toAuthResponse(r.data));

export const registerRequest = (dto: RegisterRequestDto): Promise<AuthResponseDto> =>
  api
    .post<BackendAuthResponse>('/users/register', {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      // El backend exige estos campos (acepta string vacío si aún no se capturan).
      phone: dto.phone ?? '',
      address: dto.address ?? '',
      city: dto.city ?? '',
      state: dto.state ?? '',
      zip: dto.zip ?? '',
      // country y avatar son opcionales: solo se envían si vienen (forbidNonWhitelisted).
      ...(dto.country ? { country: dto.country } : {}),
      ...(dto.avatar ? { avatar: dto.avatar } : {}),
    })
    .then((r) => toAuthResponse(r.data));

// Login/registro con Google: enviamos el id_token que emite el SDK nativo
// (@react-native-google-signin) al backend, que lo verifica y devuelve el mismo
// shape plano que login/register (usuario + accessToken + refreshToken).
export const googleLoginRequest = (idToken: string): Promise<AuthResponseDto> =>
  api
    .post<BackendAuthResponse>('/users/google', { idToken })
    .then((r) => toAuthResponse(r.data));

// Login/registro con Apple: identity_token de expo-apple-authentication + (sólo
// el 1er login) nombre/apellido que Apple entrega esa vez.
export const appleLoginRequest = (input: {
  identityToken: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponseDto> =>
  api
    .post<BackendAuthResponse>('/users/apple', input)
    .then((r) => toAuthResponse(r.data));

export const getProfileRequest = (id: string): Promise<UserProfile> =>
  api.get<BackendUser>(`/users/${id}`).then((r) => mapBackendUser(r.data));

export const updateProfileRequest = (
  id: string,
  dto: UpdateProfileRequestDto,
): Promise<UserProfile> =>
  api.patch<BackendUser>(`/users/${id}`, dto).then((r) => mapBackendUser(r.data));

export const changePasswordRequest = (
  userId: string,
  dto: { currentPassword: string; newPassword: string },
): Promise<{ success: true }> =>
  api.post<{ success: true }>(`/users/${userId}/change-password`, dto).then((r) => r.data);

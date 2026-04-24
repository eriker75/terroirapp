import { tokenStorage } from '@/store/useTokenStorage';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';

export async function signOut(): Promise<void> {
  await tokenStorage.removeAccessToken();
  useProfileStore.getState().clearProfile();
  useAuthStore.getState().reset();
}

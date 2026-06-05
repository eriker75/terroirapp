import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from '@/types/notification.types';

// El inbox parte vacío y se llena con las push reales que recibe el dispositivo
// (ver PushNotificationProvider → addNotification). Persistido en AsyncStorage.
const INITIAL_NOTIFICATIONS: Notification[] = [];

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notification: Notification) => void;
  clearAll: () => void;
}

function computeUnread(notifications: Notification[]) {
  return notifications.filter((n) => !n.read).length;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: computeUnread(INITIAL_NOTIFICATIONS),

      markRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true, updatedAt: new Date().toISOString() } : n
          );
          return { notifications: updated, unreadCount: computeUnread(updated) };
        }),

      markAllRead: () =>
        set((state) => {
          const now = new Date().toISOString();
          const updated = state.notifications.map((n) => ({ ...n, read: true, updatedAt: now }));
          return { notifications: updated, unreadCount: 0 };
        }),

      addNotification: (notification) =>
        set((state) => {
          const updated = [notification, ...state.notifications];
          return { notifications: updated, unreadCount: computeUnread(updated) };
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'terroir-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from '@/types/notification.types';

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: '¡Tu pedido está en camino!',
    body: 'Tu pedido #1042 de Cold Brew Premium ha sido enviado y llegará hoy entre 3–5 pm.',
    read: false,
    createdAt: ago(1000 * 60 * 12),
    updatedAt: ago(1000 * 60 * 12),
  },
  {
    id: 'n2',
    title: 'Oferta especial para ti',
    body: '20% de descuento en toda la línea de Espresso este fin de semana. ¡No te lo pierdas!',
    read: false,
    createdAt: ago(1000 * 60 * 60 * 2),
    updatedAt: ago(1000 * 60 * 60 * 2),
  },
  {
    id: 'n3',
    title: 'Puntos acumulados',
    body: 'Ganaste 45 puntos Terroir con tu último pedido. Ya tienes 320 puntos en total.',
    read: false,
    createdAt: ago(1000 * 60 * 60 * 5),
    updatedAt: ago(1000 * 60 * 60 * 5),
  },
  {
    id: 'n4',
    title: 'Nuevos orígenes disponibles',
    body: 'Acaba de llegar café de Kenia AA y Etiopía Yirgacheffe a nuestra tienda. ¡Pruébalos!',
    read: true,
    createdAt: ago(1000 * 60 * 60 * 24),
    updatedAt: ago(1000 * 60 * 60 * 24),
  },
  {
    id: 'n5',
    title: 'Tu reseña fue publicada',
    body: 'Gracias por calificar el Cappuccino Clásico. Tu opinión ayuda a la comunidad Terroir.',
    read: true,
    createdAt: ago(1000 * 60 * 60 * 48),
    updatedAt: ago(1000 * 60 * 60 * 48),
  },
  {
    id: 'n6',
    title: 'Pedido entregado',
    body: 'Tu pedido #1038 fue entregado exitosamente. ¡Disfruta tu café!',
    read: true,
    createdAt: ago(1000 * 60 * 60 * 72),
    updatedAt: ago(1000 * 60 * 60 * 72),
  },
];

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

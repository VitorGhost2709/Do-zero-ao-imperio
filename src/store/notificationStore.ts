import { create } from 'zustand';
import type { GameNotification, NotificationType } from '../types/game';

interface NotificationStore {
  notifications: GameNotification[];
  push: (type: NotificationType, title: string, message: string) => void;
  remove: (id: string) => void;
}

const DISMISS_MS = 4500;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  push: (type, title, message) => {
    const id = crypto.randomUUID();
    const notification: GameNotification = { id, type, title, message };
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 5),
    }));
    setTimeout(() => {
      get().remove(id);
    }, DISMISS_MS);
  },

  remove: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },
}));

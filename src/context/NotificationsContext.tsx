import { createContext, useContext, useState, type ReactNode } from 'react';

export interface NotificationItem {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly time: string;
  readonly icon: string;
  readonly read: boolean;
  readonly to?: string;
}

interface NotificationsContextValue {
  readonly notifications: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly markAsRead: (id: string) => void;
  readonly markAllRead: () => void;
  readonly addNotification: (item: Omit<NotificationItem, 'id' | 'read'>) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const INITIAL_NOTIFICATIONS: readonly NotificationItem[] = [
  {
    id: 'ntf-001',
    title: 'Report submitted successfully',
    body: "Your 'Pothole on Ashram Road' report was received and is being routed to Roads & Infrastructure.",
    time: '2h ago',
    icon: 'task_alt',
    read: false,
    to: '/reports',
  },
  {
    id: 'ntf-002',
    title: 'AI analysis complete',
    body: 'Our AI classified your report as a Pothole issue with High severity.',
    time: '2h ago',
    icon: 'smart_toy',
    read: false,
    to: '/reports',
  },
  {
    id: 'ntf-003',
    title: 'Report status updated',
    body: "Your 'Broken Streetlight' report is now In Progress. A crew has been assigned.",
    time: '1d ago',
    icon: 'construction',
    read: true,
    to: '/reports',
  },
  {
    id: 'ntf-004',
    title: 'Fix confirmed by community',
    body: 'Your neighborhood thanked 24 people for the completed sidewalk repair.',
    time: '2d ago',
    icon: 'check_circle',
    read: true,
  },
];

interface NotificationsProviderProps {
  readonly children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<readonly NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'read'>) => {
    const id = `ntf-${Date.now().toString(36)}`;
    setNotifications((prev) => [{ ...item, id, read: false }, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllRead, addNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

import type { Role } from '../context/AuthContext';

export interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: string;
}

export function getNavItems(role: Role | null): readonly NavItem[] {
  return role === 'authority'
    ? [
        { to: '/admin', label: 'Queue', icon: 'fact_check' },
        { to: '/notifications', label: 'Alerts', icon: 'notifications' },
        { to: '/profile', label: 'Profile', icon: 'person' },
      ]
    : [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/reports', label: 'My Reports', icon: 'analytics' },
        { to: '/profile', label: 'Profile', icon: 'person' },
      ];
}

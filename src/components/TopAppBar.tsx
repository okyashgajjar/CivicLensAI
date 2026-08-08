import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { USER_AVATAR } from '../data/mockData';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import { getNavItems } from '../constants/navigation';

interface TopAppBarProps {
  readonly className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = () => {
  const location = useLocation();
  const { role } = useAuth();
  const { unreadCount } = useNotifications();
  const navItems = getNavItems(role);
  const isActive = (to: string) => location.pathname === to;
  const home = role === 'authority' ? '/admin' : '/home';

  return (
    <header className="fixed top-0 left-0 w-full z-50 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-margin-mobile md:px-margin-desktop py-2 md:py-4 bg-surface shadow-sm h-16 md:h-20">
      <Link to={home} className="flex items-center gap-2 md:gap-3 justify-self-start min-w-0">
        <Icon name="account_balance" className="text-primary text-2xl md:text-3xl" />
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight truncate">
          CivicLens AI
        </h1>
      </Link>

      <nav className="hidden md:flex items-center justify-center gap-1">
        {navItems.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`font-label-sm text-label-sm flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-surface-container-lowest text-primary shadow-[0px_4px_12px_rgba(0,0,0,0.05)]'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon name={link.icon} filled={active} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 justify-self-end">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors relative flex items-center justify-center h-10 w-10"
        >
          <Icon name="notifications" />
          {unreadCount > 0 ? (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          ) : null}
        </Link>
        <Link
          to="/profile"
          className="hidden md:block w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden ml-1"
          aria-label="Profile"
        >
          <img alt="User Profile" className="w-full h-full object-cover" src={USER_AVATAR} />
        </Link>
      </div>
    </header>
  );
};

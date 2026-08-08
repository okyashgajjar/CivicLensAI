import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { getNavItems } from '../constants/navigation';

interface BottomNavProps {
  readonly className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const location = useLocation();
  const { role } = useAuth();
  const navItems = getNavItems(role);
  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe pt-2 bg-surface shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant/10">
      {navItems.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-colors ${
              active
                ? 'bg-surface-container-highest text-primary rounded-full scale-90'
                : 'text-on-surface-variant hover:bg-surface-container rounded-xl'
            }`}
          >
            <Icon name={item.icon} filled={active} />
            <span className="font-label-sm text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

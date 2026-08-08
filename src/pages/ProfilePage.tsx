import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { USER_AVATAR } from '../data/mockData';

interface ProfilePageProps {
  readonly className?: string;
}

const USER_MENU = [
  { to: '/reports', label: 'My Reports', icon: 'analytics', hint: 'Track the status of your submitted issues' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications', hint: 'View alerts about your reports' },
  { to: '/report', label: 'Report an Issue', icon: 'add_a_photo', hint: 'Submit a new civic issue' },
];

const AUTHORITY_MENU = [
  { to: '/admin', label: 'Report Queue', icon: 'fact_check', hint: 'Manage, assign and resolve reports' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications', hint: 'View alerts about the queue' },
];

export const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { role, roleInfo, credential, logout } = useAuth();
  const navigate = useNavigate();
  const menuItems = role === 'authority' ? AUTHORITY_MENU : USER_MENU;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24">
      <TopAppBar />
      <main className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col gap-6">
        <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-6 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden">
            <img alt="User Profile" className="w-full h-full object-cover" src={USER_AVATAR} />
          </div>
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">{roleInfo?.label ?? 'Account'}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {credential ?? 'Signed in with CivicLens'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-surface-container text-primary px-3 py-1 rounded-full font-label-sm text-label-sm">
            <Icon name="verified" className="text-[14px]" />
            Verified Account
          </span>
        </section>

        <section className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Icon name={item.icon} className="text-[20px]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-title-md text-title-md text-on-surface">{item.label}</span>
                <span className="block font-body-md text-sm text-on-surface-variant">{item.hint}</span>
              </div>
              <Icon name="chevron_right" className="text-on-surface-variant" />
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-1">
            Help &amp; Support
          </h3>
          <a
            href="mailto:support@civiclens.app"
            className="flex items-center gap-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="support_agent" className="text-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-title-md text-title-md text-on-surface">Contact Support</span>
              <span className="block font-body-md text-sm text-on-surface-variant">
                Get help with your account or reports
              </span>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </a>
          <a
            href="mailto:bugs@civiclens.app"
            className="flex items-center gap-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="bug_report" className="text-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-title-md text-title-md text-on-surface">Report a Bug</span>
              <span className="block font-body-md text-sm text-on-surface-variant">
                Let us know about anything that isn&apos;t working
              </span>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </a>
        </section>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-error/30 text-error font-body-lg text-body-lg font-bold hover:bg-error-container transition-colors"
        >
          <Icon name="logout" className="text-[20px]" />
          Sign Out
        </button>

        <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
          CivicLens AI v1.0 · Civic Engagement, Powered by AI
        </p>
      </main>
      <BottomNav />
    </div>
  );
};

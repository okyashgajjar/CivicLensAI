import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../context/NotificationsContext';

interface NotificationsPageProps {
  readonly className?: string;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const handleOpen = (id: string, to?: string) => {
    markAsRead(id);
    if (!to) return;
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24">
      <TopAppBar />
      <main className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
              Notifications
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}.`
                : 'You are all caught up.'}
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="font-label-sm text-label-sm text-primary hover:underline whitespace-nowrap"
            >
              Mark all as read
            </button>
          ) : null}
        </div>

        {notifications.length > 0 ? (
          <div className="flex flex-col gap-2">
            {notifications.map((item) => {
              const content = (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    item.read
                      ? 'bg-surface-container-lowest border-outline-variant/20'
                      : 'bg-surface-container-low border-primary/20'
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                      item.read ? 'bg-surface-container text-on-surface-variant' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-title-md text-title-md text-on-surface">{item.title}</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">{item.body}</p>
                  </div>
                  {!item.read ? <span className="w-2 h-2 rounded-full bg-secondary-container mt-2 shrink-0" /> : null}
                </div>
              );

              return item.to ? (
                <Link key={item.id} to={item.to} onClick={() => markAsRead(item.id)} className="block">
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpen(item.id, item.to)}
                  className="block text-left w-full"
                >
                  {content}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20 px-6">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
              <Icon name="notifications_off" className="text-3xl text-on-surface-variant" />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface">No notifications</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              You have no notifications right now. They will appear here when something changes.
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

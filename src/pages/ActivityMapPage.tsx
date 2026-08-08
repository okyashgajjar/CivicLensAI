import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { IncidentMap } from '../components/dashboard/IncidentMap';

interface ActivityMapPageProps {
  readonly className?: string;
}

export const ActivityMapPage: React.FC<ActivityMapPageProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24">
      <TopAppBar />
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col gap-4">
        <button
          className="flex items-center gap-2 text-on-surface-variant self-start"
          onClick={() => navigate(-1)}
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Back</span>
        </button>
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
            Activity Map
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Live overview of civic issues and recent fixes across your community.
          </p>
        </div>
        <IncidentMap showHeader={false} />
      </main>
      <BottomNav />
    </div>
  );
};

import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { HeroSection } from '../components/home/HeroSection';
import { ActiveReportCard, NewReportCard } from '../components/home/ActiveReportCard';
import { CommunityFixList } from '../components/home/CommunityFixList';
import { useReports } from '../context/ReportsContext';

interface HomePageProps {
  readonly className?: string;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const { reports } = useReports();
  const activeReports = reports.filter((report) => report.status !== 'Resolved');
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <TopAppBar />
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col gap-8 pb-24 md:pb-0">
        <HeroSection />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
              <Icon name="history" filled className="text-primary" />
              Your Active Reports
            </h3>
            <Link to="/reports" className="font-label-sm text-label-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {activeReports.map((report) => (
              <ActiveReportCard key={report.id} report={report} />
            ))}
            <NewReportCard />
          </div>
        </section>

        <CommunityFixList />
      </main>

      <Link
        to="/report"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all z-40"
        aria-label="New report"
      >
        <Icon name="add" filled className="text-2xl" />
      </Link>

      <BottomNav />
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { ActiveReportCard } from '../components/home/ActiveReportCard';
import { useReports } from '../context/ReportsContext';
import type { ReportStatus } from '../data/mockData';

const FILTERS: readonly ('All' | ReportStatus)[] = ['All', 'In Progress', 'Received', 'Resolved'];

interface MyReportsPageProps {
  readonly className?: string;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = () => {
  const { reports } = useReports();
  const [filter, setFilter] = useState<'All' | ReportStatus>('All');

  const visibleReports = filter === 'All' ? reports : reports.filter((report) => report.status === filter);

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24">
      <TopAppBar />
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
              My Reports
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Track the status of every issue you&apos;ve reported to the city.
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" filled />
            New Report
          </Link>
        </div>

        <div className="flex border-b border-outline-variant overflow-x-auto hide-scrollbar">
          {FILTERS.map((tab) => {
            const count =
              tab === 'All' ? reports.length : reports.filter((report) => report.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-3 border-b-2 font-title-md text-title-md whitespace-nowrap flex items-center gap-2 ${
                  filter === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === tab ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {visibleReports.length > 0 ? (
          <div className="flex flex-col gap-6">
            {visibleReports.map((report) => (
              <ActiveReportCard key={report.id} report={report} showTimeline />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20 px-6">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
              <Icon name="inbox" className="text-3xl text-on-surface-variant" />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface">No {filter === 'All' ? '' : `${filter.toLowerCase()} `}reports</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {filter === 'All'
                ? 'You have not reported any issues yet. Spot something that needs fixing?'
                : `You have no ${filter.toLowerCase()} reports right now.`}
            </p>
            <Link
              to="/report"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-body-lg text-body-lg shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Icon name="add_a_photo" filled />
              Report an Issue
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

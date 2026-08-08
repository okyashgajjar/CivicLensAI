import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { StatusChip } from '../StatusChip';
import { COMMUNITY_FIXES, MAP_DASHBOARD_IMG } from '../../data/mockData';

interface CommunityFixListProps {
  readonly className?: string;
}

export const CommunityFixList: React.FC<CommunityFixListProps> = () => {
  return (
    <section className="mb-10">
      <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2 mb-4">
        <Icon name="check_circle" filled className="text-success" />
        Recent Community Fixes
      </h3>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
        {COMMUNITY_FIXES.map((fix) => (
          <div
            key={fix.id}
            className="p-4 border-b border-outline-variant/20 flex gap-4 items-start hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
              {fix.imageUrl ? (
                <img alt={fix.title} loading="lazy" decoding="async" className="w-full h-full object-cover" src={fix.imageUrl} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center">
                  <Icon name={fix.icon ?? 'park'} filled className="text-outline" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-title-md text-body-lg font-semibold text-on-surface">{fix.title}</h4>
                <StatusChip label="Resolved" tone="success" />
              </div>
              <p className="font-body-md text-sm text-on-surface-variant mb-2">{fix.description}</p>
              <div className="flex items-center gap-3 text-xs text-outline">
                <span className="flex items-center gap-1">
                  <Icon name="thumb_up" className="text-[14px]" />
                  {fix.thanks} Thanks
                </span>
                <span>• Fixed {fix.fixedOn}</span>
              </div>
            </div>
          </div>
        ))}
        <Link
          to="/activity-map"
          className="block group relative overflow-hidden"
          aria-label="View Activity Map"
        >
          <div className="h-36 overflow-hidden">
            <img
              alt="Activity map preview"
              src={MAP_DASHBOARD_IMG}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 bg-surface/95 px-5 py-2.5 rounded-full shadow-md font-label-sm text-label-sm text-primary group-hover:gap-3 transition-all">
              <Icon name="map" filled />
              View Activity Map
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

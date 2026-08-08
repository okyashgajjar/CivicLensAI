import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { CITY_BACKGROUND, QUICK_STATS } from '../../data/mockData';

interface HeroSectionProps {
  readonly className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden relative group">
      <div className="absolute inset-0 z-0">
        <img alt="City Background" className="w-full h-full object-cover opacity-20" src={CITY_BACKGROUND} />
        <div className="absolute inset-0 bg-gradient-to-r from-surface to-surface/80" />
      </div>
      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          <h2 className="font-display-lg text-display-lg text-primary mb-2">Empower Your City</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            See an issue? Snap a photo. Our AI handles the rest, connecting your report directly to the right
            municipal department for faster resolution.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-3 bg-primary text-on-primary font-title-md text-title-md px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95"
          >
            <Icon name="add_a_photo" filled />
            Report an Issue
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {QUICK_STATS.map((stat) => (
            <div
              key={stat.id}
              className="bg-surface/90 backdrop-blur-sm p-4 rounded-lg border border-outline-variant/30 flex flex-col items-center justify-center text-center"
            >
              <Icon
                name={stat.icon}
                filled
                className={`mb-1 text-3xl ${stat.tone === 'action' ? 'text-secondary-container' : 'text-primary'}`}
              />
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{stat.value}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { Link } from 'react-router-dom';
import { Icon } from '../Icon';

interface LandingHeroProps {
  readonly className?: string;
}

const HERO_THUMBNAIL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDmCG7wADnBFJqXkED9HPAgs9fBaOohfNYVpSzZON23IGmELYQ-87PjmVYZwenQXPWX3MenciFTPbMP_QK4PuMFEEME76vsVl9ZoufCEKtSunTn1eqa5eozK76LfBY3w37sacLLiKmfFz4HP7mnWsTlNs0t9DMBjd4qhmTJw7-x6TdGxsHjQ9o-bsBWUYw08MktuZnVwt5x_dqAbAj0fOA5rZUTViP_L-8AfkNLhRL9J_cSOzpbSnzhdg';

export const LandingHero: React.FC<LandingHeroProps> = () => {
  return (
    <section className="py-20 md:py-32 grid md:grid-cols-12 gap-12 items-center min-h-[85vh]">
      <div className="flex flex-col gap-8 reveal-item visible md:col-span-6 lg:col-span-5 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary-fixed-variant font-label-sm text-[13px] font-semibold w-fit border border-primary-fixed">
          <Icon name="psychology" className="text-[16px]" />
          <span>Next-Generation Municipal AI</span>
        </div>
        <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight tracking-tight">
          Transform City <br />
          Infrastructure with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#0066ff]">
            Intelligent Action
          </span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-lg leading-relaxed">
          Streamline reporting with intelligent classification, automated routing, and instant
          duplicate detection. Build a radically more responsive municipality today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link
            to="/login"
            className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-title-md text-title-md text-center hover:bg-primary-container hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started
          </Link>
          <a
            href="#workflow"
            className="bg-surface text-on-surface border border-outline-variant px-8 py-3.5 rounded-xl font-title-md text-title-md hover:bg-surface-container-low hover:border-outline transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Icon name="play_circle" className="text-primary group-hover:scale-110 transition-transform" />
            See it in Action
          </a>
        </div>
      </div>

      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl hero-glow bg-surface-container reveal-item delay-100 md:col-span-6 lg:col-span-7">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 pointer-events-none" />
        <video
          className="w-full h-full object-cover"
          src="/landing-demo.mp4"
          poster={HERO_THUMBNAIL}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </section>
  );
};

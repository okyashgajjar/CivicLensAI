import { Icon } from '../components/Icon';
import { PageShell } from '../components/landing/PageShell';

interface ContactPageProps {
  readonly className?: string;
}

interface ContactOption {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
}

const OPTIONS: readonly ContactOption[] = [
  {
    icon: 'handshake',
    title: 'Talk to Sales',
    description: 'Book a walkthrough for your municipality and see live classification, routing, and duplicate detection.',
    href: 'mailto:sales@civiclens.app',
    cta: 'Email sales',
  },
  {
    icon: 'support_agent',
    title: 'Support',
    description: 'Questions about an existing deployment or report? Our team responds within one business day.',
    href: 'mailto:support@civiclens.app',
    cta: 'Email support',
  },
  {
    icon: 'partners',
    title: 'Partnerships',
    description: 'Interested in integrating CivicLens AI into your civic platform? Let us find the right fit.',
    href: 'mailto:partners@civiclens.app',
    cta: 'Email partnerships',
  },
];

export const ContactPage: React.FC<ContactPageProps> = () => {
  return (
    <PageShell>
      <section className="py-20 md:py-28 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary-fixed-variant font-label-sm text-[13px] font-semibold w-fit border border-primary-fixed mb-6">
          <Icon name="account_balance" className="text-[16px]" />
          <span>Contact</span>
        </div>
        <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
          Let's talk
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
          Tell us about your city and we will show you what CivicLens AI can do for your residents
          and your teams.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {OPTIONS.map((option) => (
          <a
            key={option.title}
            href={option.href}
            className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-4 hover:border-primary/40 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
              <Icon name={option.icon} filled />
            </div>
            <h2 className="font-title-md text-title-md text-on-surface font-bold">{option.title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant flex-1 leading-relaxed">
              {option.description}
            </p>
            <span className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              {option.cta}
              <Icon name="arrow_forward" className="text-[16px]" />
            </span>
          </a>
        ))}
      </section>
    </PageShell>
  );
};

import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { PageShell } from './PageShell';

export interface InfoSection {
  readonly heading: string;
  readonly body: string;
}

interface InfoPageProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly sections?: readonly InfoSection[];
  readonly children?: ReactNode;
  readonly className?: string;
}

export const InfoPage: React.FC<InfoPageProps> = ({
  eyebrow,
  title,
  description,
  sections = [],
  children,
}) => {
  return (
    <PageShell>
      <section className="py-20 md:py-28 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary-fixed-variant font-label-sm text-[13px] font-semibold w-fit border border-primary-fixed mb-6">
          <Icon name="account_balance" className="text-[16px]" />
          <span>{eyebrow}</span>
        </div>
        <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
          {title}
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">{description}</p>
      </section>

      {sections.length > 0 && (
        <section className="grid md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div
              key={section.heading}
              className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/30"
            >
              <h2 className="font-title-md text-title-md text-on-surface font-bold mb-3">
                {section.heading}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </section>
      )}

      {children}
    </PageShell>
  );
};

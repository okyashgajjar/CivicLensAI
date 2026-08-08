import { Icon } from '../Icon';

interface LandingHeroProps {
  readonly className?: string;
}

interface WorkflowStep {
  readonly step: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly delay: string;
}

const STEPS: readonly WorkflowStep[] = [
  {
    step: '1',
    icon: 'report',
    title: 'Report Filed',
    description: 'Citizen submits photo via app or portal.',
    delay: '',
  },
  {
    step: '2',
    icon: 'auto_awesome',
    title: 'Smart Classification',
    description: 'AI identifies issue type with 95%+ accuracy.',
    delay: 'delay-100',
  },
  {
    step: '3',
    icon: 'merge',
    title: 'Duplicate Detection',
    description: 'Groups redundant reports to save 40% triage time.',
    delay: 'delay-200',
  },
  {
    step: '4',
    icon: 'route',
    title: 'Automated Routing',
    description: 'Dispatched instantly to the correct department.',
    delay: 'delay-300',
  },
  {
    step: '5',
    icon: 'analytics',
    title: 'Predictive Insights',
    description: 'Data drives proactive maintenance planning.',
    delay: 'delay-400',
  },
];

export const WorkflowSection: React.FC<LandingHeroProps> = () => {
  return (
    <section
      id="workflow"
      className="py-24 bg-surface-container-low rounded-3xl px-6 md:px-12 -mx-margin-mobile md:-mx-margin-desktop mt-12 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10 text-center mb-20 reveal-item max-w-2xl mx-auto">
        <h2 className="font-display-lg text-3xl md:text-4xl font-bold text-on-surface mb-4">
          Intelligence at Every Step
        </h2>
        <p className="font-body-lg text-lg text-on-surface-variant">
          A seamless workflow transforming citizen reports into rapid municipal action.
        </p>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="hidden md:block absolute top-[60px] left-12 right-12 h-1 bg-outline-variant/30 z-0" />
        <div className="md:hidden absolute left-[60px] top-12 bottom-12 w-1 bg-outline-variant/30 z-0" />
        <div className="grid md:grid-cols-5 gap-8 md:gap-4 relative z-10">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className={`reveal-item ${item.delay} flex flex-row md:flex-col items-start md:items-center gap-6 md:gap-4 group`}
            >
              <div className="shrink-0 w-16 h-16 rounded-full bg-surface border-4 border-surface-container-low shadow-md flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/20">
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-on-primary rounded-full font-label-sm text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <Icon
                  name={item.icon}
                  className="text-3xl text-on-surface-variant group-hover:text-primary transition-colors"
                />
              </div>
              <div className="md:text-center mt-2 md:mt-0">
                <h3 className="font-title-md text-lg font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

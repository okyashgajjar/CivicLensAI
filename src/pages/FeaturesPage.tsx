import { InfoPage, type InfoSection } from '../components/landing/InfoPage';

interface FeaturesPageProps {
  readonly className?: string;
}

const SECTIONS: readonly InfoSection[] = [
  {
    heading: 'Smart Classification',
    body: 'AI identifies the issue type from a citizen photo with 95%+ accuracy, eliminating manual data entry and mis-categorised tickets.',
  },
  {
    heading: 'Duplicate Detection',
    body: 'Similar reports at the same location are grouped automatically, saving up to 40% of staff triage time and reducing duplicate work orders.',
  },
  {
    heading: 'Automated Routing',
    body: 'Every verified report is dispatched instantly to the correct municipal department with the right priority, with no phone tag or handoffs.',
  },
  {
    heading: 'Predictive Insights',
    body: 'Trends in reported issues power proactive maintenance planning, so your city fixes problems before they grow.',
  },
  {
    heading: 'Live Incident Map',
    body: 'Track every open issue in real time on an interactive map, with status, assignment, and resolution visible to citizens and staff.',
  },
  {
    heading: 'Citizen Transparency',
    body: 'Reporters follow their issue from filed to fixed with a public timeline, building trust in municipal responsiveness.',
  },
];

export const FeaturesPage: React.FC<FeaturesPageProps> = () => {
  return (
    <InfoPage
      eyebrow="Platform"
      title="Intelligence at every step of the workflow"
      description="CivicLens AI turns a simple citizen photo into a routed, tracked, and resolved work order. Here is what the platform does for your city."
      sections={SECTIONS}
    />
  );
};

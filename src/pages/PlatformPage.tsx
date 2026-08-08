import { InfoPage, type InfoSection } from '../components/landing/InfoPage';
import { WorkflowSection } from '../components/landing/WorkflowSection';

interface PlatformPageProps {
  readonly className?: string;
}

const SECTIONS: readonly InfoSection[] = [
  {
    heading: 'One entry point',
    body: 'Citizens submit a photo and location from a mobile app, portal, or web app. No forms to navigate, no categories to guess.',
  },
  {
    heading: 'AI handles the middle',
    body: 'Classification, duplicate matching, and routing agents run in the background so reports reach the right desk in seconds.',
  },
  {
    heading: 'Built for municipalities',
    body: 'The dispatch queue, assignment flow, and live map are designed for authority teams who need to act fast.',
  },
];

export const PlatformPage: React.FC<PlatformPageProps> = () => {
  return (
    <InfoPage
      eyebrow="Solution"
      title="A full reporting workflow, end to end"
      description="From a citizen snapshot to a resolved work order, CivicLens AI automates the pipeline your team already runs by hand."
      sections={SECTIONS}
    >
      <div className="mt-16">
        <WorkflowSection />
      </div>
    </InfoPage>
  );
};

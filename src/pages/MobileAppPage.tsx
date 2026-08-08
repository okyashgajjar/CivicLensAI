import { InfoPage, type InfoSection } from '../components/landing/InfoPage';

interface MobileAppPageProps {
  readonly className?: string;
}

const SECTIONS: readonly InfoSection[] = [
  {
    heading: 'Report in seconds',
    body: 'Snap a photo, pin the location, and submit. The AI handles classification and routing while you get on with your day.',
  },
  {
    heading: 'Track every fix',
    body: 'Follow your reports from filed to fixed with a live status timeline, notifications, and community updates.',
  },
  {
    heading: 'Works offline-first',
    body: 'Reports queue on your device when connectivity drops and sync automatically when you are back online.',
  },
];

export const MobileAppPage: React.FC<MobileAppPageProps> = () => {
  return (
    <InfoPage
      eyebrow="Mobile App"
      title="Civic action, in your pocket"
      description="Our mobile experience puts civic reporting in every resident's hand, with the same AI pipeline behind the scenes."
      sections={SECTIONS}
    />
  );
};

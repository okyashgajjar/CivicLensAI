import { InfoPage } from '../components/landing/InfoPage';

interface PrivacyPageProps {
  readonly className?: string;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = () => {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy"
      description="CivicLens AI handles location data and photographs responsibly. Here is what we do with them."
      sections={[
        {
          heading: 'Location data',
          body: 'Report coordinates are used only to route the report to the correct department and to detect duplicates at the same site. They are never sold or used for advertising.',
        },
        {
          heading: 'Photographs',
          body: 'Photos are processed by our AI classification pipeline to identify the issue type and are stored securely. You may request deletion of any report you submit.',
        },
        {
          heading: 'Account data',
          body: 'Contact details are used to send status updates about your reports. You can update or delete your account at any time from your profile.',
        },
      ]}
    />
  );
};

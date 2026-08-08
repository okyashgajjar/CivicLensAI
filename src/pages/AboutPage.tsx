import { InfoPage, type InfoSection } from '../components/landing/InfoPage';

interface AboutPageProps {
  readonly className?: string;
}

const SECTIONS: readonly InfoSection[] = [
  {
    heading: 'Our mission',
    body: 'Every city has a backlog of unreported issues. We build AI that removes the friction between noticing a problem and getting it fixed.',
  },
  {
    heading: 'How we work',
    body: 'We co-design with municipal teams, deploy in small pilots, and scale what measurably speeds up resolution times.',
  },
  {
    heading: 'Where we started',
    body: 'CivicLens began as a civic hackathon project focused on potholes and streetlight failures in Ahmedabad, India. Today it is a platform for any municipality.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = () => {
  return (
    <InfoPage
      eyebrow="About"
      title="Building the civic nervous system"
      description="CivicLens AI exists to make municipal responsiveness radically faster — for citizens, for staff, and for the cities both call home."
      sections={SECTIONS}
    />
  );
};

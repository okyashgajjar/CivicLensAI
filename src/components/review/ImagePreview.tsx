import { Icon } from '../Icon';
import { POTHOLES_CLOSEUP } from '../../data/mockData';

interface ImagePreviewProps {
  readonly imageUrl?: string | null;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  const src = imageUrl ?? POTHOLES_CLOSEUP;
  return (
    <div className="rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] bg-surface relative border border-outline-variant/30">
      <div
        className="h-56 w-full bg-surface-container-highest bg-cover bg-center"
        style={{ backgroundImage: `url('${src}')` }}
      />
      <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm border border-outline-variant/50">
        <Icon name="auto_awesome" filled className="text-primary text-[18px]" />
        <span className="font-label-sm text-label-sm text-primary">AI Scanned</span>
      </div>
    </div>
  );
};

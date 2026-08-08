import { Icon } from '../Icon';

interface ReviewActionBarProps {
  readonly onConfirm: () => void;
  readonly onMarkDuplicate: () => void;
  readonly submitting?: boolean;
}

export const ReviewActionBar: React.FC<ReviewActionBarProps> = ({
  onConfirm,
  onMarkDuplicate,
  submitting = false,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-margin-mobile py-4 flex flex-col gap-3 z-30 shadow-[0px_-8px_24px_rgba(0,0,0,0.08)]">
      <button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full bg-primary text-on-primary font-body-md text-body-md font-bold py-3.5 rounded-full shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Icon name="send" filled className="text-[20px]" />
        {submitting ? 'Submitting…' : 'Confirm & Submit'}
      </button>
      <button
        onClick={onMarkDuplicate}
        className="w-full bg-transparent border-2 border-outline-variant text-primary font-body-md text-body-md font-bold py-3 rounded-full active:bg-surface-container transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="merge" className="text-[20px]" />
        This is a Duplicate
      </button>
    </div>
  );
};

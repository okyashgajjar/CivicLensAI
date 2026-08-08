import { Icon } from '../Icon';
import { ISSUE_CATEGORIES } from '../../data/mockData';

interface CategorySectionProps {
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly description: string;
  readonly onDescriptionChange: (value: string) => void;
  readonly aiSuggestedId?: string | null;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedId,
  onSelect,
  description,
  onDescriptionChange,
  aiSuggestedId,
}) => {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-gutter border border-outline-variant/30 flex flex-col gap-6">
      <div>
        <h2 className="font-title-md text-title-md text-on-surface mb-3 flex items-center gap-2">
          <Icon name="category" className="text-primary" />
          Issue Category
        </h2>
        <div className="flex flex-wrap gap-2">
          {ISSUE_CATEGORIES.map((category) => {
            const selected = category.id === selectedId;
            const aiSuggested = category.id === aiSuggestedId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect(category.id)}
                className={`px-4 py-2 rounded-full border font-label-sm text-label-sm flex items-center gap-1.5 transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {category.icon ? <Icon name={category.icon} className="text-[16px]" /> : null}
                {category.label}
                {aiSuggested ? (
                  <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold text-[10px] uppercase tracking-wide">
                    AI
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-label-sm text-label-sm text-on-surface flex justify-between" htmlFor="description">
          Describe the issue
          <span className="text-on-surface-variant font-normal">Optional</span>
        </label>
        <textarea
          className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-none placeholder:text-on-surface-variant/50"
          id="description"
          placeholder="Provide any additional details that might help response teams (e.g., 'Deep pothole in the right lane near the crosswalk.')."
          rows={4}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
    </section>
  );
};

import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import {
  CREW_BY_DEPARTMENT,
  DEPARTMENTS,
  suggestDepartment,
  type QueueItem,
} from '../../data/mockData';

interface AssignDialogProps {
  readonly item: QueueItem | null;
  readonly onClose: () => void;
  readonly onConfirm: (department: string, crew: string) => void;
}

export const AssignDialog: React.FC<AssignDialogProps> = ({ item, onClose, onConfirm }) => {
  const [department, setDepartment] = useState<string>('');
  const [crew, setCrew] = useState<string>('');

  useEffect(() => {
    if (!item) return;
    const suggested = suggestDepartment(item.type);
    setDepartment(suggested);
    setCrew(CREW_BY_DEPARTMENT[suggested][0]);
  }, [item]);

  useEffect(() => {
    if (!department) return;
    const crews = CREW_BY_DEPARTMENT[department];
    if (crews && !crews.includes(crew)) {
      setCrew(crews[0]);
    }
  }, [department, crew]);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const suggested = suggestDepartment(item.type);
  const crews = CREW_BY_DEPARTMENT[department] ?? [];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign report"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="engineering" className="text-primary text-[22px]" />
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface">Assign Report</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{item.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm text-on-surface">Department</span>
          <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
            {DEPARTMENTS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setDepartment(name)}
                className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border font-body-md text-body-md transition-colors ${
                  department === name
                    ? 'border-primary bg-primary/5 text-on-surface'
                    : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span>{name}</span>
                {name === suggested ? (
                  <span className="inline-flex items-center gap-1 bg-surface-variant text-primary px-2 py-0.5 rounded-full font-label-sm text-label-sm shrink-0">
                    <Icon name="auto_awesome" className="text-[12px]" />
                    AI
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm text-on-surface">Crew</span>
          <div className="flex flex-wrap gap-2">
            {crews.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCrew(name)}
                className={`px-3 py-2 rounded-full border font-label-sm text-label-sm transition-colors ${
                  crew === name
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-outline-variant text-on-surface font-body-lg text-body-lg font-bold hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(department, crew)}
            disabled={!department || !crew}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-on-primary font-body-lg text-body-lg font-bold shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

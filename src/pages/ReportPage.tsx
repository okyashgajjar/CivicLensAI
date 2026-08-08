import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { PhotoUpload } from '../components/report/PhotoUpload';
import { DuplicateDetectionPanel } from '../components/report/DuplicateDetectionPanel';
import { LocationSection } from '../components/report/LocationSection';
import { CategorySection } from '../components/report/CategorySection';
import { useDuplicateScan } from '../hooks/useDuplicateScan';
import { useReportForm } from '../hooks/useReportForm';
import { detectionCategoryId } from '../utils/detection';
import type { ReportDraft } from '../types/report';
import type { ApiDetection } from '../api/client';

interface ReportPageProps {
  readonly className?: string;
}

export const ReportPage: React.FC<ReportPageProps> = () => {
  const navigate = useNavigate();
  const { form, categoryLabel, setAddress, selectCategory, setDescription, setPhoto, setCoordinates } =
    useReportForm('road');
  const [detection, setDetection] = useState<ApiDetection | null>(null);
  const coordinates = {
    lat: form.lat ?? 23.0225,
    lng: form.lng ?? 72.5714,
  };
  const { progress, complete, matches, error } = useDuplicateScan({
    ready: Boolean(form.photoUrl),
    lat: coordinates.lat,
    lng: coordinates.lng,
  });

  const handleDetection = (next: ApiDetection | null) => {
    setDetection(next);
    const categoryId = detectionCategoryId(next);
    if (categoryId) selectCategory(categoryId);
  };

  const handleSubmit = () => {
    const draft: ReportDraft = {
      title: `${categoryLabel()} reported near ${form.address.split(',')[0]}`,
      categoryId: form.categoryId,
      category: categoryLabel(),
      description: form.description.trim(),
      address: form.address.trim(),
      lat: form.lat,
      lng: form.lng,
      imageUrl: form.photoUrl,
      detection,
      duplicates: [...matches],
    };
    navigate('/report/agents', { state: { draft } });
  };

  return (
    <div className="antialiased min-h-screen flex flex-col">
      <TopAppBar />
      <main className="flex-1 w-full max-w-[800px] mx-auto pt-[80px] pb-[140px] px-margin-mobile md:px-margin-desktop flex flex-col gap-gutter">
        <div className="mb-2">
          <button
            className="flex items-center gap-2 text-on-surface-variant mb-2"
            onClick={() => navigate('/')}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider cursor-pointer">Cancel Report</span>
          </button>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">New Civic Issue</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Provide details to help our AI route this to the correct department.
          </p>
        </div>

        <PhotoUpload imageUrl={form.photoUrl} onPhotoChange={setPhoto} onDetection={handleDetection} />
        <DuplicateDetectionPanel
          ready={Boolean(form.photoUrl)}
          progress={progress}
          complete={complete}
          matches={matches}
          error={error}
        />
        <LocationSection
          address={form.address}
          onAddressChange={setAddress}
          coordinates={coordinates}
          onCoordinatesChange={setCoordinates}
        />
        <CategorySection
          selectedId={form.categoryId}
          onSelect={selectCategory}
          description={form.description}
          onDescriptionChange={setDescription}
          aiSuggestedId={detectionCategoryId(detection)}
        />
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 p-margin-mobile md:px-margin-desktop md:py-4 shadow-[0px_-4px_16px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button className="order-2 sm:order-1 px-6 py-3 rounded-lg border border-primary text-primary font-body-lg text-body-lg text-center hover:bg-primary/5 transition-colors">
            Save Draft
          </button>
          <button
            className="order-1 sm:order-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-body-lg text-body-lg text-center shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2"
            onClick={handleSubmit}
          >
            Submit Report
            <Icon name="send" className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

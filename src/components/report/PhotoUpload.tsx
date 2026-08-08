import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { api, ApiError, type ApiDetection } from '../../api/client';
import { severityClasses, formatConfidence } from '../../utils/severity';

const MAX_BYTES = 5 * 1024 * 1024;

interface PhotoUploadProps {
  readonly imageUrl: string | null;
  readonly onPhotoChange: (imageUrl: string | null, fileName: string | null) => void;
  readonly onDetection?: (detection: ApiDetection | null) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ imageUrl, onPhotoChange, onDetection }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detection, setDetection] = useState<ApiDetection | null>(null);

  useEffect(() => {
    onDetection?.(detection);
  }, [detection, onDetection]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file');
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError('Image exceeds the 5 MB limit');
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      onPhotoChange(result.url, file.name);
      setDetection(result.detection);
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-gutter border border-outline-variant/30">
      <h2 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
        <Icon name="add_a_photo" className="text-primary" />
        Visual Evidence
      </h2>

      {imageUrl ? (
        <div className="rounded-lg overflow-hidden border border-outline-variant relative">
          <img alt="Uploaded evidence" className="w-full h-48 object-cover" src={imageUrl} />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="refresh" className="text-[14px]" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                setDetection(null);
                onPhotoChange(null, null);
              }}
              className="bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm font-label-sm text-label-sm text-error hover:bg-error-container transition-colors flex items-center gap-1"
            >
              <Icon name="close" className="text-[14px]" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-outline-variant rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer group relative overflow-hidden ${
            uploading ? 'pointer-events-none opacity-70' : ''
          }`}
          htmlFor="photo-upload"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Icon name="hourglass_top" className="text-[48px] text-primary mb-3 animate-spin" />
            ) : (
              <Icon
                name="cloud_upload"
                className="text-[48px] text-primary/60 group-hover:text-primary transition-colors mb-3"
              />
            )}
            <p className="mb-2 font-body-md text-body-md text-on-surface">
              {uploading ? (
                'Uploading to CivicLens…'
              ) : (
                <>
                  <span className="font-bold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">JPG, PNG, WEBP or GIF (MAX. 5 MB)</p>
          </div>
          <input
            ref={inputRef}
            className="hidden"
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      )}

      {detection ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 bg-surface-container-low rounded-lg px-4 py-3 border border-outline-variant/40">
          <Icon name="scan" className="text-primary text-[18px] shrink-0" />
          <p className="font-label-sm text-label-sm text-on-surface flex-1">
            <span className="text-on-surface-variant">AI detected: </span>
            <span className="font-bold">{detection.label}</span>
          </p>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {formatConfidence(detection.confidence)} confidence
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm ${severityClasses(detection.severity)}`}>
            {detection.severity}
          </span>
        </div>
      ) : null}

      {uploadError ? (
        <div className="mt-3 flex items-center gap-2 bg-error-container rounded-lg px-4 py-3">
          <Icon name="error" className="text-error text-[18px] shrink-0" />
          <p className="font-label-sm text-label-sm text-error">{uploadError}</p>
        </div>
      ) : null}
    </section>
  );
};

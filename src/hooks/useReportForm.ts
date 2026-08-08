import { useState } from 'react';
import { INITIAL_ADDRESS, ISSUE_CATEGORIES } from '../data/mockData';

export interface ReportCoordinates {
  readonly lat: number;
  readonly lng: number;
}

interface ReportFormState {
  readonly address: string;
  readonly categoryId: string;
  readonly description: string;
  readonly photoUrl: string | null;
  readonly photoName: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
}

const DEFAULT_COORDS: ReportCoordinates = { lat: 23.0225, lng: 72.5714 };

export function useReportForm(initialCategory: string): {
  readonly form: ReportFormState;
  readonly categoryLabel: () => string;
  readonly setAddress: (value: string) => void;
  readonly selectCategory: (id: string) => void;
  readonly setDescription: (value: string) => void;
  readonly setPhoto: (url: string | null, name: string | null) => void;
  readonly setCoordinates: (coords: ReportCoordinates) => void;
  readonly reset: () => void;
} {
  const [form, setForm] = useState<ReportFormState>({
    address: INITIAL_ADDRESS,
    categoryId: initialCategory,
    description: '',
    photoUrl: null,
    photoName: null,
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
  });

  const setAddress = (value: string) => setForm((prev) => ({ ...prev, address: value }));
  const setDescription = (value: string) => setForm((prev) => ({ ...prev, description: value }));
  const setPhoto = (url: string | null, name: string | null) =>
    setForm((prev) => ({ ...prev, photoUrl: url, photoName: name }));
  const setCoordinates = (coords: ReportCoordinates) =>
    setForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  const selectCategory = (id: string) => setForm((prev) => ({ ...prev, categoryId: id }));
  const categoryLabel = (): string =>
    ISSUE_CATEGORIES.find((category) => category.id === form.categoryId)?.label ?? form.categoryId;
  const reset = () =>
    setForm({
      address: INITIAL_ADDRESS,
      categoryId: initialCategory,
      description: '',
      photoUrl: null,
      photoName: null,
      lat: DEFAULT_COORDS.lat,
      lng: DEFAULT_COORDS.lng,
    });

  return {
    form,
    categoryLabel,
    setAddress,
    selectCategory,
    setDescription,
    setPhoto,
    setCoordinates,
    reset,
  };
}

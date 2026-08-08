interface NominatimResponse {
  readonly display_name?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Could not look up the address');
  }
  const data = (await response.json()) as NominatimResponse;
  const name = data.display_name?.trim();
  if (!name) {
    throw new Error('Could not look up the address');
  }
  return name;
}

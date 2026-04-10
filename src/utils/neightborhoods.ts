
export const HAMBURG_NEIGHBORHOODS: Record<string, { lat: number; lng: number }> = {
  'altstadt': { lat: 53.5495, lng: 10.0093 },
  'neustadt': { lat: 53.5516, lng: 10.0152 },
  'eimsbüttel': { lat: 53.5723, lng: 9.9765 },
  'wandsbek': { lat: 53.5859, lng: 10.1217 },
  'bergedorf': { lat: 53.4854, lng: 10.2654 },
  'harburg': { lat: 53.4608, lng: 9.9758 },
  'mitte': { lat: 53.5511, lng: 10.0119 },
  'barmbek-nord': { lat: 53.5916, lng: 10.0689 },
  'barmbek-süd': { lat: 53.5797, lng: 10.0732 },
  'eppendorf': { lat: 53.6048, lng: 9.9863 },
  'rotherbaum': { lat: 53.5711, lng: 9.9915 },
  'winterhude': { lat: 53.5917, lng: 10.0153 },
  'altona': { lat: 53.5526, lng: 9.9413 },
  'ottensen': { lat: 53.5459, lng: 9.9364 },
  'lurup': { lat: 53.5676, lng: 9.8943 },
  'eidelstedt': { lat: 53.5789, lng: 9.8701 },
  'norderstedt': { lat: 53.6786, lng: 10.0224 },
  'niendorf': { lat: 53.6255, lng: 9.9893 },
  'st-pauli': { lat: 53.5508, lng: 10.0014 },
  'sankt-georg': { lat: 53.5578, lng: 10.0164 },
  'hafen-city': { lat: 53.5413, lng: 10.0066 },
  'horn': { lat: 53.5572, lng: 10.1228 },
  'wilhelmsburg': { lat: 53.4975, lng: 9.9896 },
  'bahrenfeld': { lat: 53.5561, lng: 9.9668 },
  'osdorf': { lat: 53.5578, lng: 9.8905 },
  'fuhlsbüttel': { lat: 53.6667, lng: 10.0333 },
};

export function getCoordinatesFromNeighborhood(neighborhood: string) {
  const normalized = neighborhood.toLowerCase().trim();
  return HAMBURG_NEIGHBORHOODS[normalized] || null;
}
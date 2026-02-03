
export interface GisSceneProps {
  sf6Density: number; // % normalized (0-100)
  pdLocation: number[]; // [x, y, z] or null
  breakerState: 'open' | 'closed';
  selectedPartId: string | null;
  onPartSelect: (id: string) => void;
  viewMode: 'casing' | 'internal' | 'gas';
}

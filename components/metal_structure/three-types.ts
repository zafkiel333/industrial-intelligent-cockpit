
export interface StructureHotspot {
  id: string;
  position: [number, number, number];
  type: 'weld' | 'anode' | 'support';
  status: 'normal' | 'corroded' | 'stressed';
  value: number; // 强度或磨损值 0-1
  // Fix: Added missing label property to resolve type errors in MetalStructurePartsView.tsx
  label: string;
}

export interface MetalStructureThreeProps {
  hotspots: StructureHotspot[];
  activeHotspotId: string | null;
  onNodeClick: (id: string) => void;
  showStressMap: boolean;
  waterPressure: number; // 0-1
}

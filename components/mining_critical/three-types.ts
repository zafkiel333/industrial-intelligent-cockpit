
export interface WearHotspot {
  id: string;
  position: [number, number, number];
  intensity: number; // 0-1 磨损强度
  partName: string;
}

export interface MiningTwinProps {
  hotspots: WearHotspot[];
  rotationSpeed: number;
  activeId: string | null;
  onNodeClick: (id: string) => void;
  showBlueprint: boolean;
}

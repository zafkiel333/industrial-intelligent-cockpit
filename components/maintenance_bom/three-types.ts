export interface BomPart {
  id: string;
  name: string;
  type: 'shaft' | 'gear' | 'bearing' | 'housing' | 'fastener';
  status: 'matched' | 'missing' | 'mismatch' | 'surplus';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface BomThreeProps {
  parts: BomPart[];
  selectedPartId: string | null;
  explodeLevel: number; // 0-1
  onPartSelect: (id: string) => void;
}
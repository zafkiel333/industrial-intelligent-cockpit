export interface ShelfStatus {
  deformationValue: number; // mm
  loadWeight: number; // kg
  structuralHealth: number; // 0 to 100
  isDeformed: boolean;
  hasCracks: boolean;
  lastInspectionTime: string;
  shelfId: string;
  alerts: string[];
}

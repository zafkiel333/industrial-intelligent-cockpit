export interface LockerSlot {
  id: string;
  row: number;
  col: number;
  status: 'available' | 'borrowed' | 'maintenance' | 'selected';
  toolName?: string;
  toolType?: string;
}

export interface ToolsThreeProps {
  slots: LockerSlot[];
  selectedSlotId?: string | null;
  onSlotSelect?: (id: string) => void;
}
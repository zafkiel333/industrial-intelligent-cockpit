export interface ShiftBlock {
  id: string;
  teamId: string; // 'alpha', 'beta', 'gamma', etc.
  dayIndex: number; // 0-6 (Mon-Sun)
  startHour: number; // 0-23
  duration: number; // Hours
  type: 'day' | 'swing' | 'night' | 'standby';
  personnelCount: number;
}

export interface ShiftThreeProps {
  shifts: ShiftBlock[];
  currentDay: number;
  currentHour: number;
  onShiftSelect?: (id: string) => void;
}

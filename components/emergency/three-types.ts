export interface EmergencyThreeProps {
  alerts?: Array<{
    id: string;
    position: [number, number, number];
    level: 'P1' | 'P2' | 'P3';
  }>;
  onAlertSelect?: (id: string) => void;
}
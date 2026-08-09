export interface MaintenanceThreeProps {
  highlightZone?: 'bearing' | 'stator' | 'cooling' | 'gear' | 'none';
  statusColor?: string;
  isScanning?: boolean;
}
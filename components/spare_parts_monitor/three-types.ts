export interface SensorNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: 'optimal' | 'warning' | 'critical';
  value: number;
  unit: string;
  type: 'vibration' | 'temperature' | 'stress';
}

export interface MonitorThreeProps {
  sensors: SensorNode[];
  activeSensorId: string | null;
  onSensorSelect: (id: string) => void;
  systemLoad: number; // 0-1 影响整体动效剧烈程度
}
export interface VehicleSceneConfig {
  tippingAngle: number; // 0 to 1 for the truck body
  steeringAngle: number;
  isScanning: boolean;
  activePartId?: string;
}

export type VehicleSensor = {
  id: string;
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
  position: [number, number, number];
};

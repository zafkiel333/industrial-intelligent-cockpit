export interface TireData {
  id: string;
  pressure: number; // in PSI
  temperature: number; // in C
  wearLevel: number; // 0 to 1
  isCritical: boolean;
}

export interface TruckTireState {
  truckId: string;
  speed: number;
  load: number; // in tons
  tires: TireData[];
}

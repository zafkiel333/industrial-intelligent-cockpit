export interface ElectricalCabinetProps {
  temperature: number; // Celsius
  current: number; // Amps
  voltage: number; // Volts
  isAlert: boolean;
  doorOpen: boolean;
}

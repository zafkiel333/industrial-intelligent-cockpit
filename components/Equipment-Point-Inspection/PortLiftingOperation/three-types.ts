export interface PortLiftingOperationProps {
  craneStatus: number; // 0: Normal, 1: Warning, 2: Error
  loadWeight: number; // Current load in tons
  windSpeed: number; // Current wind speed in m/s
  isAlert: boolean;
}

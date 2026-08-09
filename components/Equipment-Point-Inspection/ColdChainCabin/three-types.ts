export interface ColdChainCabinProps {
  temperature: number; // Current temperature in Celsius
  humidity: number; // Current humidity percentage
  compressorStatus: number; // 0: Normal, 1: Warning, 2: Error
  isAlert: boolean;
}


export interface DisconnectSceneProps {
  switchState: 'open' | 'closed' | 'opening' | 'closing';
  bladeAngle: number; // 0 (Closed) to 90 (Open)
  contactTemp: number; // Celsius, affects contact color glow
  wearLevel: number; // 0-100%, affects surface texture/roughness
  sparkIntensity: number; // 0-1, during operation
  showThermal: boolean; // Toggle thermal view overlay
}

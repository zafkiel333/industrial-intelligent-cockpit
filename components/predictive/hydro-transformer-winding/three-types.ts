
export interface WindingSceneProps {
  hvTemp: number; // High Voltage Winding Temp (Celsius)
  lvTemp: number; // Low Voltage Winding Temp (Celsius)
  oilTemp: number; // Top Oil Temp
  loadFactor: number; // 0-1.2
  hotspotHeight: number; // 0-1 (Position of hotspot along winding height)
}

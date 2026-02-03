
export interface BusbarSceneProps {
  phaseTemps: [number, number, number]; // Temps for Phase A, B, C
  loadCurrent: number; // Amps, affects glow intensity overall
  hotspotLocation: number; // 0: None, 1: Phase A Joint, 2: Phase B Joint, 3: Phase C Joint
  viewMode: 'visual' | 'thermal'; // Visual = Metal look, Thermal = Heatmap look
}

export interface ICCPState {
  hullPotential: number; // mV (Target is usually around -800mV to -850mV)
  anodeCurrent: number; // Amps
  referenceElectrodeFault: boolean; // True if electrode is dirty/damaged
  powerSupply: boolean;
  waterConductivity: number; // Simulates sea water vs fresh water
}

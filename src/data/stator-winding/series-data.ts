import { StatorWindingData } from './types';

export const statorWindingSeries: StatorWindingData[] = Array.from({ length: 60 }, (_, i) => {
  const t = i * 0.1;
  const loadMode = i > 30 ? 'high' : 'normal';
  
  const activePower = loadMode === 'high' ? 800 + Math.random() * 20 : 400 + Math.random() * 10;
  // Temps slowly rise with load
  const baseTemp = loadMode === 'high' ? 85 + (i - 30) * 0.5 : 65 + Math.random() * 2;
  
  // Generating PRPD (Phase Resolved Partial Discharge) fake scatter dots
  const pdAmps = [];
  const pdPhases = [];
  const pdCount = loadMode === 'high' ? 12 : 3;
  for(let j=0; j<pdCount; j++) {
    // Corona discharges usually cluster around 45 and 225 degrees
    const phaseCenter = Math.random() > 0.5 ? 45 : 225;
    pdPhases.push(phaseCenter + (Math.random() - 0.5) * 30);
    pdAmps.push((loadMode === 'high' ? 200 : 50) + Math.random() * 150);
  }

  const status = loadMode === 'high' && i > 45 ? (i > 55 ? 'danger' : 'warning') : 'normal';

  return {
    timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    activePower,
    statorVoltage: 20 + (Math.random() - 0.5) * 0.2,
    coreTempAvg: baseTemp - 5,
    slotTemps: [
      baseTemp + Math.random() * 4, baseTemp + 2 + Math.random() * 3, baseTemp - 1 + Math.random() * 2,
      baseTemp + 5 + Math.random() * 5, baseTemp, baseTemp + 1
    ],
    pdAmplitude: pdAmps,
    pdPhase: pdPhases,
    coolantInletTemp: 25.0 + Math.random() * 0.5,
    coolantOutletTemp: 25.0 + (baseTemp - 60) * 0.8 + Math.random(),
    coolantFlowRate: 1200 + Math.random() * 50,
    insulationResistance: loadMode === 'high' ? 450 - (i-30)*2 : 800 + Math.random() * 20,
    overallStatus: status
  };
});

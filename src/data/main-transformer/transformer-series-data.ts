import { MainTransformerData } from './types';

export const transformerSeriesData: MainTransformerData[] = Array.from({ length: 120 }, (_, i) => {
  const noise = (scale: number) => (Math.random() - 0.5) * scale;
  
  // Power load cycle
  let powerBase = 280;
  if (i > 30 && i < 80) powerBase = 350; // High load period
  
  const activePower = powerBase + noise(5);
  const currentHigh = (activePower / (500 * Math.sqrt(3))) * 1000 + noise(10);
  
  // Thermal model (delayed response to load)
  // Simplified thermal inertia
  const thermalLoadIdx = i > 30 ? Math.min(1, (i - 30) / 20) : 0;
  const windingTemp = 65 + thermalLoadIdx * 35 + noise(1);
  const topOilTemp = 55 + thermalLoadIdx * 25 + noise(0.5);
  
  // Cooling fans auto-start based on winding temperature
  let fanGroupOn = 0;
  if (windingTemp > 85) fanGroupOn = 4;
  else if (windingTemp > 75) fanGroupOn = 2;
  else if (windingTemp > 65) fanGroupOn = 1;
  
  // Simulated fault: Sudden partial discharge and DGA spike
  const isAnomaly = i > 60 && i < 100;
  
  const dga = {
    hydrogen: isAnomaly ? 80 + noise(10) : 25 + noise(2),
    methane: isAnomaly ? 35 + noise(5) : 12 + noise(1),
    ethylene: isAnomaly ? 15 + noise(3) : 2 + noise(0.5),
    acetylene: isAnomaly ? 2 + noise(1) : 0, // Should normally be 0
    carbonMonoxide: 150 + thermalLoadIdx * 50 + noise(10)
  };
  
  const partialDischarge = isAnomaly ? 600 + noise(150) : 120 + noise(30);

  let healthStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (dga.acetylene > 1 || partialDischarge > 500 || windingTemp > 105) healthStatus = 'critical';
  else if (dga.hydrogen > 50 || partialDischarge > 300 || windingTemp > 90) healthStatus = 'warning';

  return {
    timestamp: new Date(new Date('2026-04-18T10:00:00Z').getTime() + i * 1000).toISOString(),
    voltageHigh: Number((505 + noise(2)).toFixed(1)),
    voltageLow: Number((18.5 + noise(0.1)).toFixed(2)),
    currentHigh: Number(currentHigh.toFixed(1)),
    activePower: Number(activePower.toFixed(1)),
    topOilTemp: Number(topOilTemp.toFixed(1)),
    windingTemp: Number(windingTemp.toFixed(1)),
    dga: {
      hydrogen: Number(dga.hydrogen.toFixed(1)),
      methane: Number(dga.methane.toFixed(1)),
      ethylene: Number(dga.ethylene.toFixed(1)),
      acetylene: Number(dga.acetylene.toFixed(2)),
      carbonMonoxide: Number(dga.carbonMonoxide.toFixed(1))
    },
    coolingPumpStatus: true,
    fanGroupOn,
    partialDischarge: Number(partialDischarge.toFixed(0)),
    healthStatus
  };
});

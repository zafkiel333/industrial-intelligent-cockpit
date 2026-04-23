import { ThrustBearingData } from './types';

export const thrustBearingSeries: ThrustBearingData[] = Array.from({ length: 60 }, (_, i) => {
  const t = i * 0.1;
  const isFluctuating = i > 30 && i < 45; // Simulated load fluctuation
  const loadMod = isFluctuating ? Math.sin(t * 5) * 1500 : Math.sin(t) * 200;
  
  return {
    timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    axialLoad: 12500 + loadMod + Math.random() * 50,
    oilPressure: isFluctuating ? 11.5 + Math.random() * 0.5 : 12.4 + Math.random() * 0.2,
    // Provide 8 pad temperatures. Pad 4 and 5 gets hotter if fluctuating.
    padTemperatures: [
      55 + Math.random() * 2,
      56 + Math.random() * 2,
      54 + Math.random() * 1.5,
      55 + (isFluctuating ? 8 + Math.random() * 4 : Math.random() * 2), // Hot spot
      57 + (isFluctuating ? 6 + Math.random() * 3 : Math.random() * 2), // Hot spot
      54 + Math.random() * 2,
      55 + Math.random() * 2,
      56 + Math.random() * 2,
    ],
    oilFilmThickness: isFluctuating ? 30 - Math.random() * 5 : 45 + Math.sin(t) * 2,
    coolingWaterFlow: 150 + Math.random() * 5,
    overallStatus: isFluctuating ? 'warning' : 'normal',
  };
});

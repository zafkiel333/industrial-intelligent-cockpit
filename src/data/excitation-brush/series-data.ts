import { ExcitationBrushData } from './types';

export const excitationBrushSeries: ExcitationBrushData[] = Array.from({ length: 60 }, (_, i) => {
  // Simulate brush 3 spring losing tension causing sparks
  const isFailing = i > 35;
  const current = 1200 + Math.sin(i * 0.1) * 50 + Math.random() * 20;
  
  let slipTemp = 65 + (i * 0.2); // slowly heating up
  let spark = Math.random() * 0.1;
  let p3 = 18; // pressure

  if (isFailing) {
     p3 = 18 - (i - 35) * 0.5; // Pressure dropping
     spark = (i - 35) * 0.03 + Math.random() * 0.2; // Sparking intensely
     slipTemp += (i - 35) * 1.5; // Friction/arc heat rising
  }

  // Generate some dummy FFT data (peak at 0, 50Hz and 150Hz harmonic)
  const harmonics = Array.from({length: 10}, (_, h) => {
     if (h === 0) return current / 20; // DC component approx
     if (h === 1 && isFailing) return current / 80; // Introduce low freq ripple
     if (h === 2) return current / 100; // 6-pulse ripple
     return Math.random() * 5 + (isFailing ? Math.random() * 15 : 0);
  });

  return {
    timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    rotorSpeed: 300 + (Math.random() - 0.5),
    excitationVoltage: 240 + Math.random() * 2,
    excitationCurrent: current,
    slipRingTemp: slipTemp,
    brushWearLevels: [
       45 - i * 0.01, 
       42 - i * 0.01, 
       isFailing ? 40 - (i-35)*0.1 : 40 - i * 0.01, // Brush 3 wearing very fast due to arcing
       46 - i * 0.01
    ],
    brushPressures: [
       19 + Math.random()*0.5, 
       18.5 + Math.random()*0.5, 
       p3 + Math.random()*0.5, 
       19.2 + Math.random()*0.5
    ],
    sparkIntensity: Math.min(1, spark),
    currentHarmonics: harmonics,
    overallStatus: spark > 0.6 ? 'danger' : (spark > 0.3 ? 'warning' : 'normal')
  };
});

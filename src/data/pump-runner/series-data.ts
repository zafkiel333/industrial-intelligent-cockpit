import { PumpRunnerData } from './types';

// Simulate a transition from Idle -> Pump -> Turbine
export const pumpRunnerSeries: PumpRunnerData[] = Array.from({ length: 60 }, (_, i) => {
  let mode: 'idle' | 'pump' | 'turbine' = 'idle';
  let rpm = 0;
  let angle = 0;
  let flow = 0;
  let head = 100;
  let cav = 0.2;
  
  if (i < 15) {
     mode = 'idle';
     rpm = Math.random() * 5;
     angle = 0;
     flow = 0;
  } else if (i < 40) {
     mode = 'pump';
     const progress = Math.min(1, (i - 15) / 10);
     rpm = -(300 * progress) + Math.random() * 10;
     angle = 15 * progress + Math.random() * 2;
     flow = 200 * progress + Math.random() * 10;
     head = 100 + 30 * progress + Math.random() * 5;
     cav = 0.2 - (0.1 * progress) + Math.random() * 0.02; // Dips near boundary
  } else {
     mode = 'turbine';
     const progress = Math.min(1, (i - 40) / 10);
     rpm = (300 * progress) + Math.random() * 10;
     angle = 35 * progress + Math.random() * 2;
     flow = 350 * progress + Math.random() * 15;
     head = 130 - 20 * progress + Math.random() * 5;
     cav = 0.15 + Math.random() * 0.05;
  }
  
  return {
    timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    operatingMode: mode,
    rpm,
    guideVaneAngle: angle,
    flowRate: flow,
    waterHead: head,
    cavitationIndex: cav,
    draftTubePressurePulse: mode !== 'idle' ? 0.05 + Math.random() * 0.08 : 0,
  };
});

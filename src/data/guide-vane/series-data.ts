import { GuideVaneData } from './types';

export const guideVaneSeries: GuideVaneData[] = Array.from({ length: 60 }, (_, i) => {
  // Simulate opening sequence then suddenly stuck
  let stroke = 0;
  let status: 'normal'|'warning'|'danger' = 'normal';
  
  if (i < 20) {
    stroke = i * 20; // rapidly opening
  } else if (i < 40) {
    stroke = 400 + Math.sin(i * 0.5) * 10; // stable regulation
  } else {
    stroke = 400 - (i - 40) * 15; // closing
  }

  // At thick 45, simulate a stuck vane (sand ingress)
  let friction = 12.5 + Math.random();
  let shearForce = 45;
  let extraPressure = 0;
  
  if (i >= 45) {
     status = i > 52 ? 'danger' : 'warning';
     friction = 50 + (i-45) * 15; // rapidly binding
     extraPressure = (i-45) * 0.8; // oil pump pushing harder
     shearForce = 150 + (i-45) * 30; // pin is about to snap
     // Vane 2 specifically gets stuck, not following stroke
  }

  const baseAngle = stroke * 0.05; // simplified map

  return {
    timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    servoStroke: stroke,
    servoOilPressure: 4.5 + extraPressure + Math.random() * 0.1,
    ringAngle: stroke * 0.02,
    vaneAngles: [
      baseAngle, 
      i >= 45 ? 20 : baseAngle, // Vane 2 is stuck at 20 deg
      baseAngle, 
      baseAngle
    ],
    frictionTorque: friction,
    shearPinStress: shearForce + Math.random() * 5,
    flowVelocity: baseAngle * 0.3 + Math.random() * 0.5,
    turbineRpm: baseAngle * 6 + 100 + Math.random() * 2,
    overallStatus: status
  };
});

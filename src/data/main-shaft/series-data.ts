import { MainShaftData } from './types';

export const mainShaftSeries: MainShaftData[] = Array.from({ length: 120 }, (_, i) => {
  const t = i * 0.1;
  const powerIncrease = i > 40; // Simulate loading
  const activePower = powerIncrease ? 300 + Math.min((i - 40) * 5, 50) + Math.random() * 5 : 50 + Math.random() * 5;
  
  // Orbit logic (Lissajous)
  const baseRadius = powerIncrease ? 80 + Math.random() * 10 : 20 + Math.random() * 5;
  const dx = Math.sin(t * 3) * baseRadius;
  const dy = Math.cos(t * 2.8) * baseRadius * 0.8; // Slight elliptical orbit
  
  return {
    timestamp: new Date(Date.now() - (120 - i) * 500).toISOString(),
    displacementX: dx,
    displacementY: dy,
    phaseAngle: (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360,
    vibrationVelocity: powerIncrease ? 2.5 + Math.random() * 0.8 : 0.8 + Math.random() * 0.2,
    guideBearingTemp: powerIncrease ? 45 + Math.min((i-40)*0.1, 8) + Math.random() : 42 + Math.random() * 0.5,
    activePower: activePower
  };
});

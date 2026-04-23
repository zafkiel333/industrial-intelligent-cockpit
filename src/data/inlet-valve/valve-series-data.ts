import { InletValveData } from './types';

export const valveSeriesData: InletValveData[] = Array.from({ length: 120 }, (_, i) => {
  // Sequence: Closed (0-20) -> Bypass Open/Equalizing (20-40) -> Main Valve Opening (40-60) -> Fully Open (60-90) -> Closing (90-120)
  
  const noise = (scale: number) => (Math.random() - 0.5) * scale;
  
  let angle = 0;
  let bypassStatus = false;
  let upstreamPressure = 4.5 + noise(0.05); // ~ 450m water head 
  let casingPressure = 0 + noise(0.01);
  let status: 'fully_closed' | 'opening' | 'fully_open' | 'closing' = 'fully_closed';
  
  if (i < 20) {
    angle = 0;
    bypassStatus = false;
    casingPressure = 0.5 + noise(0.02); // slight static water
    status = 'fully_closed';
  } else if (i >= 20 && i < 40) {
    // Equalizing pressure via bypass
    angle = 0;
    bypassStatus = true;
    casingPressure = 0.5 + ((i - 20) / 20) * 4.0 + noise(0.05);
    status = 'fully_closed';
  } else if (i >= 40 && i < 60) {
    angle = ((i - 40) / 20) * 90;
    bypassStatus = true;
    casingPressure = upstreamPressure - 0.05 + noise(0.02); // Almost equalized
    status = 'opening';
  } else if (i >= 60 && i < 90) {
    angle = 90;
    bypassStatus = false; // Bypass closed after main is open
    casingPressure = upstreamPressure - 0.1 + noise(0.05); // dynamic pressure drop
    status = 'fully_open';
  } else if (i >= 90) {
    angle = 90 - ((i - 90) / 30) * 90;
    bypassStatus = false;
    casingPressure = upstreamPressure - ((i - 90) / 30) * 4.0 + noise(0.05);
    status = 'closing';
  }

  const isMoving = status === 'opening' || status === 'closing';
  const vibration = (isMoving ? 4.5 + noise(1) : (angle === 90 ? 2.5 + noise(0.5) : 0.5 + noise(0.1)));
  const sealPressure = 5.0 + noise(0.1); // Always slightly higher than penstock pressure
  
  // Simulated wear: action time deviation increases slightly on close
  const actionTimeDeviation = isMoving ? (status === 'closing' ? 120 + noise(20) : -30 + noise(10)) : 0;
  
  const leakageFlow = angle === 0 ? 12 + noise(2) : 25 + noise(5); // L/min

  let healthStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (vibration > 6 || leakageFlow > 40 || actionTimeDeviation > 200) healthStatus = 'critical';
  else if (vibration > 4 || leakageFlow > 25 || actionTimeDeviation > 100) healthStatus = 'warning';

  return {
    timestamp: new Date(new Date('2026-04-18T11:00:00Z').getTime() + i * 1000).toISOString(),
    valveAngle: Number(angle.toFixed(1)),
    servoStroke: Number((angle / 90 * 600 + noise(2)).toFixed(1)), // Max stroke 600mm
    isBypassOpen: bypassStatus,
    upstreamPressure: Number(upstreamPressure.toFixed(2)),
    spiralCasingPressure: Number(casingPressure.toFixed(2)),
    sealWaterPressure: Number(sealPressure.toFixed(2)),
    actionTimeDeviation: Number(actionTimeDeviation.toFixed(0)),
    leakageFlow: Number(leakageFlow.toFixed(1)),
    vibration: Number(vibration.toFixed(2)),
    valveStatus: status,
    healthStatus
  };
});

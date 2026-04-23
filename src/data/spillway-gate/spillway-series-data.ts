import { SpillwayGateData } from './types';

export const spillwaySeriesData: SpillwayGateData[] = Array.from({ length: 120 }, (_, i) => {
  const isOpening = i >= 20 && i < 50;
  const isHolding = i >= 50 && i < 90;
  const isClosing = i >= 90 && i < 120;
  
  const noise = (scale: number) => (Math.random() - 0.5) * scale;
  
  let opening = 0;
  let status: 'closed' | 'opening' | 'closing' | 'hold' = 'closed';
  
  if (i < 20) {
    opening = 0;
    status = 'closed';
  } else if (isOpening) {
    opening = ((i - 20) / 30) * 100;
    status = 'opening';
  } else if (isHolding) {
    opening = 100;
    status = 'hold';
  } else if (isClosing) {
    opening = 100 - ((i - 90) / 30) * 100;
    status = 'closing';
  }
  
  const baseUpstream = 230.5;
  const upstream = baseUpstream + noise(0.1) - (opening > 0 ? opening * 0.005 : 0);
  const discharge = (opening / 100) * 1500 + noise(10) * (opening > 0 ? 1 : 0);
  const downstream = 180.0 + (discharge / 1500) * 2.5 + noise(0.05);

  const isMoving = status === 'opening' || status === 'closing';
  const cylinderPressure = isMoving ? 16.5 + noise(1.5) : (opening > 0 ? 12.0 + noise(0.5) : 0);
  const motorCurrent = isMoving ? 120 + noise(15) : 0;
  
  const stress = (opening > 0 ? 45 + (discharge / 1500) * 35 : 10) + noise(5);
  // Add an anomaly during max discharge
  const anomaly = isHolding && i > 65 && i < 75;
  const actualStressLeft = stress + (anomaly ? 25 + noise(10) : noise(2));
  const actualStressRight = stress + noise(2);
  
  const vibration = (opening > 0 ? 15 + (discharge / 1500) * 10 : 0) + (anomaly ? 18 : 0) + Math.abs(noise(2));

  let healthStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (actualStressLeft > 80 || actualStressRight > 80 || vibration > 30) healthStatus = 'critical';
  else if (actualStressLeft > 60 || actualStressRight > 60 || vibration > 20) healthStatus = 'warning';

  return {
    timestamp: new Date(new Date('2026-04-18T09:00:00Z').getTime() + i * 1000).toISOString(),
    openingPercentage: Number(Math.max(0, Math.min(100, opening)).toFixed(1)),
    cylinderPressureLeft: Number(cylinderPressure.toFixed(2)),
    cylinderPressureRight: Number((cylinderPressure * 0.98 + noise(0.5)).toFixed(2)),
    motorCurrent: Number(motorCurrent.toFixed(1)),
    upstreamLevel: Number(upstream.toFixed(2)),
    downstreamLevel: Number(downstream.toFixed(2)),
    dischargeFlow: Number(discharge.toFixed(1)),
    armStressLeft: Number(actualStressLeft.toFixed(1)),
    armStressRight: Number(actualStressRight.toFixed(1)),
    vibration: Number(vibration.toFixed(2)),
    gateStatus: status,
    healthStatus
  };
});

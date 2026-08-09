import { HydroTurbineData } from './types';

// 生成 120 个时间序列点，模拟一次闭环的 "平稳运行 -> 负荷水头跳变扰动 -> 触发空化预警 -> 系统自动平抑归位 -> 平稳" 的真实业务序列
export const hydroSeriesData: HydroTurbineData[] = Array.from({ length: 120 }, (_, i) => {
  const baseRpm = 125.0;
  const isDisturbance = i >= 30 && i < 60;
  const recovery = i >= 60 && i < 90;
  
  const noise = (scale: number) => (Math.random() - 0.5) * scale;
  
  let opening = 75.0;
  let head = 105.2;
  let vacuum = 0.04;
  let vibUpper = 45;
  let vibLower = 42;
  let cavitation = 15;
  
  if (isDisturbance) {
    // 受到水流脉冲扰动
    opening = 78.0 + noise(1);
    head = 106.5 + noise(0.5);
    vacuum = 0.07 + noise(0.01);
    vibUpper = 68 + noise(5);     
    cavitation = 75 + noise(15);  
  } else if (recovery) {
    // 调速器介入，平稳回落 (插值过渡)
    const ease = (i - 60) / 30; // 0 to 1
    opening = 78.0 - ease * 3.0 + noise(0.5);
    head = 106.5 - ease * 1.3 + noise(0.2);
    vacuum = 0.07 - ease * 0.03 + noise(0.005);
    vibUpper = 68 - ease * 23 + noise(2);
    cavitation = 75 - ease * 60 + noise(5);
  } else {
    // 基准平稳状态
    opening = 75.0 + noise(0.5);
    head = 105.2 + noise(0.2);
    vacuum = 0.04 + noise(0.005);
    vibUpper = 45 + noise(2);
    cavitation = 15 + noise(3);
  }
  
  const rpm = baseRpm + noise(0.5) + (isDisturbance ? Math.random()*2 : 0);
  const power = (opening / 75) * 295 + noise(2);
  const runoutX = noise(vibUpper / 20);
  const runoutY = noise(vibUpper / 20);

  let status: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (vibUpper > 65 || cavitation > 80) status = 'critical';
  else if (vibUpper > 55 || cavitation > 60) status = 'warning';

  return {
    timestamp: new Date(new Date('2026-04-18T08:00:00Z').getTime() + i * 1000).toISOString(),
    rpm: Number(rpm.toFixed(2)),
    activePower: Number(power.toFixed(2)),
    reactivePower: Number((power * 0.15).toFixed(2)),
    frequency: Number((50 + noise(0.05)).toFixed(2)),
    waterHead: Number(head.toFixed(2)),
    flowRate: Number((power * 1.05 + noise(2)).toFixed(2)),
    guideVaneOpening: Number(opening.toFixed(2)),
    spiralCasePressure: Number((1.25 + noise(0.02)).toFixed(2)),
    draftTubeVacuum: Number(vacuum.toFixed(3)),
    vibration: { 
      upperGuide: Number(vibUpper.toFixed(2)), 
      lowerGuide: Number((vibLower + noise(1)).toFixed(2)), 
      thrust: 50 + Number(noise(1).toFixed(2)) 
    },
    shaftRunout: { 
      x: Number(runoutX.toFixed(3)), 
      y: Number(runoutY.toFixed(3)) 
    },
    temperature: { 
      statorWind: Number((65 + (power - 290) * 0.1 + noise(0.2)).toFixed(2)), 
      thrustOil: Number((58 + noise(0.2)).toFixed(2)), 
      guideOil: Number((55 + noise(0.2)).toFixed(2)) 
    },
    efficiency: Number((93.5 - (cavitation > 50 ? 5 : 0) + noise(0.2)).toFixed(2)),
    cavitationRisk: Math.max(0, Math.min(100, Number(cavitation.toFixed(1)))),
    status
  };
});

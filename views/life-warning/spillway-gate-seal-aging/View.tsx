import React from 'react';
import { ThreeScene } from '../../../components/life-warning/spillway-gate-seal-aging/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入泄洪洞闸门止水橡胶专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/spillway-gate-seal-aging';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['spillway-gate-seal-aging']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ pressure: 0.65, temperature: 28, compression: 8.5, hardness: 78, agingFactor: 0.35, leakageRate: 3.8 }} />}
  />
);

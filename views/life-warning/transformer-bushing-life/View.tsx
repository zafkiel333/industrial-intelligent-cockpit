import React from 'react';
import { ThreeScene } from '../../../components/life-warning/transformer-bushing-life/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入变压器套管专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/transformer-bushing-life';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['transformer-bushing-life']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ oilTemperature: 64, oilPressure: 0.18, capacitance: 512, tanDelta: 0.62, moistureContent: 18, agingFactor: 0.17 }} />}
  />
);

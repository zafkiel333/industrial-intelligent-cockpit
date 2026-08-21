import React from 'react';
import { ThreeScene } from '../../../components/life-warning/cooling-pump-bearing-life/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入冷却水泵轴承专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cooling-pump-bearing-life';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['cooling-pump-bearing-life']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ temperature: 72, vibration: 5.2, oilLevel: 76, wearDepth: 24, acousticEmission: 68, load: 82 }} />}
  />
);

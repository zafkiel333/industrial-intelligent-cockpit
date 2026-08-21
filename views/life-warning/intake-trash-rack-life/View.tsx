import React from 'react';
import { ThreeScene } from '../../../components/life-warning/intake-trash-rack-life/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入进水口拦污栅专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/intake-trash-rack-life';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['intake-trash-rack-life']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ waterLevelDiff: 0.42, vibrationAmplitude: 2.8, corrosionLevel: 0.11, flowVelocity: 2.4, blockageRatio: 0.16, structuralStress: 118 }} />}
  />
);

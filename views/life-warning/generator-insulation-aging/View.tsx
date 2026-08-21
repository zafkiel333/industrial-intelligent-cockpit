import React from 'react';
import { ThreeScene } from '../../../components/life-warning/generator-insulation-aging/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入定子绝缘老化专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/generator-insulation-aging';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['generator-insulation-aging']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ temperature: 65, humidity: 40, voltageStress: 18, partialDischarge: 182, insulationResistance: 500, agingFactor: 0.28 }} />}
  />
);

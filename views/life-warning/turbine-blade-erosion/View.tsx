import React from 'react';
import { ThreeScene } from '../../../components/life-warning/turbine-blade-erosion/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入转轮叶片冲蚀专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/turbine-blade-erosion';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['turbine-blade-erosion']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ erosionLevel: 0.22, waterFlowSpeed: 50, sedimentConcentration: 3.4, cavitationIntensity: 46 }} />}
  />
);

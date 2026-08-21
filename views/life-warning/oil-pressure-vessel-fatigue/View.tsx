import React from 'react';
import { ThreeScene } from '../../../components/life-warning/oil-pressure-vessel-fatigue/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：补齐油压装置压力容器疲劳监测页面与专属三维场景入口。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/oil-pressure-vessel-fatigue';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['oil-pressure-vessel-fatigue']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ pressure: 6.3, pressureCycles: 182000, wallLoss: 7.8, fatigueUsage: 0.61, acousticEvents: 3 }} />}
  />
);

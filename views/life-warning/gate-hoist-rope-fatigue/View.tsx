import React from 'react';
import { ThreeScene } from '../../../components/life-warning/gate-hoist-rope-fatigue/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入启闭机钢丝绳专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/gate-hoist-rope-fatigue';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['gate-hoist-rope-fatigue']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ tension: 420, bendingCycles: 184000, corrosionLevel: 0.18, brokenWires: 4, fatigueFactor: 0.32 }} />}
  />
);

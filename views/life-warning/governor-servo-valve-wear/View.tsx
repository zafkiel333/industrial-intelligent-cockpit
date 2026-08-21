import React from 'react';
import { ThreeScene } from '../../../components/life-warning/governor-servo-valve-wear/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：接入调速器伺服阀专属寿命管理配置并保留原三维场景。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/governor-servo-valve-wear';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['governor-servo-valve-wear']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ oilCleanliness: 8, spoolDisplacement: 0.18, pressureDrop: 1.9, frictionForce: 32, wearDepth: 18, healthIndex: 76 }} />}
  />
);

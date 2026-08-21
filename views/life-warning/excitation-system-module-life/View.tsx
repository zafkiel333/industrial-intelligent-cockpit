import React from 'react';
import { ThreeScene } from '../../../components/life-warning/excitation-system-module-life/ThreeScene';
import { LIFE_WARNING_SCENARIOS } from '../shared/lifeWarningScenarioConfigs';
import { LifeWarningWorkbench } from '../shared/LifeWarningWorkbench';

// 2026-08-21：补齐励磁功率模块寿命预警页面与专属三维场景入口。

const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/excitation-system-module-life';

export const View: React.FC = () => (
  <LifeWarningWorkbench
    config={LIFE_WARNING_SCENARIOS['excitation-system-module-life']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene state={{ junctionTemperature: 106, thermalSwing: 58, thermalResistanceRise: 9.4, voltageDrift: 6.8, agingFactor: 0.26 }} />}
  />
);

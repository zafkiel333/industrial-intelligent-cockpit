import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/DamStructureReinforcement/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-2]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-2';

export const DamStructureReinforcementView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-2']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene stressLevel={31} status="加固中" reinforcementProgress={43} />}
  />
);

import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ReservoirDesilting/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-6]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-6';

export const ReservoirDesiltingView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-6']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene siltLevel={42} status="作业中" progress={58} />}
  />
);

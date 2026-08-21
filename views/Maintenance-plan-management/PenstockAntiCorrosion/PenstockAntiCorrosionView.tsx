import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PenstockAntiCorrosion/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-3]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-3';

export const PenstockAntiCorrosionView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-3']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene corrosionLevel={32} status="处理中" treatmentProgress={47} />}
  />
);

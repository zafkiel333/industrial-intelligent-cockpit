import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HydroTurbineOverhaul/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-0]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-0';

export const HydroTurbineOverhaulView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-0']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene speed={0} status="检修中" rotationY={0.35} />}
  />
);

import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/NavigationLockOverhaul/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-7]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-7';

export const NavigationLockOverhaulView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-7']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene waterLevel={3.2} gateStatus="检修中" maintenanceProgress={21} />}
  />
);

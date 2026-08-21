import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HydraulicHoistMaintenance/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-8]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-8';

export const HydraulicHoistMaintenanceView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-8']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene pressure={15.8} status="维保中" maintenanceProgress={53} />}
  />
);

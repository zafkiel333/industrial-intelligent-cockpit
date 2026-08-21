import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/TailraceTunnelInspection/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-9]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-9';

export const TailraceTunnelInspectionView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-9']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene waterLevel={0.8} status="排空中" maintenanceProgress={29} />}
  />
);

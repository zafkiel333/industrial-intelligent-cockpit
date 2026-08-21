import React from 'react';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PumpStationAnnual/ThreeScene';
import { MaintenancePlanningWorkbench } from '../shared/MaintenancePlanningWorkbench';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../shared/planningScenarioConfigs';

// MODEL_LIB_LINK[mpm-5]：模型库正式地址接入后只需替换此常量。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-5';

export const PumpStationAnnualView: React.FC = () => (
  <MaintenancePlanningWorkbench
    config={MAINTENANCE_PLANNING_SCENARIOS['mpm-5']}
    modelUrl={MODEL_LIB_URL}
    scene={<ThreeScene flowRate={104} status="停机检修" maintenanceProgress={36} />}
  />
);

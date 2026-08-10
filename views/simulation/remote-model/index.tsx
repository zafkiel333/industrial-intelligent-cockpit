// 2026-08-09 新增：为四个批准的外部模型场景导出独立页面入口；
import React from 'react';
import { RemoteModelSimulationView } from './RemoteModelSimulationView';

export const HydroTurbineDigitalTwinView: React.FC = () => (
  <RemoteModelSimulationView sceneId="sim-visual-hydro-turbine" />
);

export const WastewaterPumpDigitalTwinView: React.FC = () => (
  <RemoteModelSimulationView sceneId="sim-visual-wastewater-pump" />
);

export const BridgeCraneDigitalTwinView: React.FC = () => (
  <RemoteModelSimulationView sceneId="sim-visual-bridge-crane" />
);

export const HaulTruckDigitalTwinView: React.FC = () => (
  <RemoteModelSimulationView sceneId="sim-visual-haul-truck" />
);

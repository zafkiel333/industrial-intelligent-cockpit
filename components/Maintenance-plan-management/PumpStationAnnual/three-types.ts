export interface PumpStationAnnualProps {
  flowRate?: number;
  status?: '运行中' | '停机检修' | '测试中';
  maintenanceProgress?: number;
}

export interface TransformerPreventiveProps {
  oilTemperature?: number;
  status?: '正常' | '预警' | '检修中';
  maintenanceProgress?: number;
}

export interface DustCollectorStatus {
  emissionConcentration: number; // mg/m³
  differentialPressure: number; // Pa
  brokenBagsCount: number;
  activeChamber: number;
  cleaningCycleActive: boolean;
  fanSpeed: number; // RPM
  airflow: number; // m³/h
  isAlarming: boolean;
  lastInspectionTime: string;
}

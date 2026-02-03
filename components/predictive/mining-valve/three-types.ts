export interface ValvePartStatus {
  id: string;
  name: string;
  health: number; // 0-100
  stictionRisk: number; // 0-1
  temperature: number;
}

export interface ValveSceneProps {
  spoolPosition: number;   // 阀芯位移 (-100 to 100)
  commandSignal: number;   // 指令信号 (-100 to 100)
  oilQuality: number;      // 油质状况 (0-1)
  stictionRisk: number;    // 整体卡阻风险 (0-1)
  viewMode: 'standard' | 'xray' | 'thermal';
  isDithering: boolean;    // 是否开启颤振补偿
}
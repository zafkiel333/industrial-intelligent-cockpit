
export interface RopeDefect {
  id: string;
  position: number;   // 距离绳头的长度 (m)
  count: number;      // 断丝数量
  severity: 'low' | 'medium' | 'high';
}

export interface HoistRopeSceneProps {
  ropeExtension: number; // 0-1 伸缩比例
  loadKn: number;        // 当前张力 (kN)
  defects: RopeDefect[]; // 缺陷列表
  scanPos: number;       // 当前探测头扫描到的绳长位置
  isScanning: boolean;
  viewMode: 'standard' | 'xray' | 'thermal';
}

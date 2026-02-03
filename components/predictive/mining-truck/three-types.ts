
export interface TireStatus {
  id: string; // FL, FR, RL, RR
  temp: number;
  pressure: number;
  wear: number;
}

export interface MiningTruckSceneProps {
  dumpAngle: number;    // 车斗举升角度 (0-50度)
  steeringAngle: number; // 转向角度 (-30 to 30)
  wheelSpeed: number;   // 车轮转速
  suspensionCompression: { fl: number; fr: number; rl: number; rr: number }; // 悬挂压缩量 0-1
  payload: number;      // 载重 (吨)，影响车身下沉
  activeComponent: string | null; // 当前选中的部件ID
  isRunning: boolean;   // 发动机是否运行 (排气效果)
}

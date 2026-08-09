
export interface EconomySceneProps {
  roiLevel: number;        // 投资回报率系数 (0-1)
  savingsSpeed: number;    // 价值流动速度
  investmentFactor: number;// 投入占比
  showValueStream: boolean;// 是否显示价值粒子流
  activeMetric: 'roi' | 'npv' | 'payback';
}

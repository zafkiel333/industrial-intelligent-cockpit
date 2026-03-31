export interface StockpileData {
  id: string;
  materialType: string;
  volume: number; // in m3
  density: number; // in t/m3
  mass: number; // in t
}

export interface StockpileState {
  totalVolume: number;
  totalMass: number;
  accuracy: number;
  stockpiles: StockpileData[];
}

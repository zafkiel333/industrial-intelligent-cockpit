export interface Obstacle {
  id: string;
  type: 'ship' | 'buoy' | 'debris';
  distance: number; // meters
  bearing: number; // degrees
  speed: number; // knots
  risk: 'low' | 'medium' | 'high';
}

export interface NavigationState {
  obstacles: Obstacle[];
  shipSpeed: number;
  heading: number;
}

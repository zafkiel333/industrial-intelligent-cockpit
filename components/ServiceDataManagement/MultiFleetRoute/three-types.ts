
import * as THREE from 'three';

export interface RouteData {
  id: string;
  name: string;
  start: [number, number]; // Lat, Lon
  end: [number, number];   // Lat, Lon
  color: string;
  traffic: number; // 0-1, intensity
}

export interface FleetNode {
  id: string;
  fleetName: string;
  routeId: string;
  progress: number; // 0-1
  status: 'optimal' | 'delay' | 'risk';
}

export interface GlobalRouteProps {
  activeRouteId?: string;
  onRouteSelect?: (id: string) => void;
  globalSpeed?: number;
}

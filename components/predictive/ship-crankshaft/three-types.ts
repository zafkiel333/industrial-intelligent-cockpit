
import * as THREE from 'three';

export interface CrankshaftAnimatables {
  crankshaftGroup?: THREE.Group;
  bearings?: THREE.Mesh[];
  deflectionGlows?: THREE.Mesh[];
  oilFilmPoints?: THREE.Points;
  indicatorRing?: THREE.Mesh;
}

export type CrankViewMode = 'alignment' | 'lubrication' | 'vibration';

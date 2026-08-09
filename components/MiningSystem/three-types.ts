
import * as THREE from 'three';

export interface MiningSystemProps {
  activeSystem?: 'crushing' | 'conveying' | 'hoisting';
  onSystemSelect?: (system: 'crushing' | 'conveying' | 'hoisting') => void;
}

export interface SystemNode {
  id: 'crushing' | 'conveying' | 'hoisting';
  position: [number, number, number];
  color: string;
  label: string;
  dataCount: string;
}

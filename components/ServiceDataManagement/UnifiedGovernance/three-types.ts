
import * as THREE from 'three';

export type DomainType = 'mining' | 'shipping' | 'hydro';

export interface DataDomainNode {
  id: DomainType;
  name: string;
  color: string;
  position: [number, number, number];
  packetRate: number; // visual particle speed/density
  protocol: string;
}

export interface GovernanceSceneProps {
  activeDomain?: DomainType | null;
  onDomainSelect?: (id: DomainType) => void;
  globalProcessingLoad: number; // 0-1, controls core rotation speed
}

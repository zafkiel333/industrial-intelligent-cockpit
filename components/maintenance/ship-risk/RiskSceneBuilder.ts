
import * as THREE from 'three';
import { RiskAnimatables, RiskNode } from './three-types';

export const RISK_NODES: RiskNode[] = [
  { id: 'ME', name: 'Main Engine', level: 'HIGH', pos: new THREE.Vector3(0, 1.5, 4), color: 0xef4444 },
  { id: 'RD', name: 'Rudder System', level: 'MEDIUM', pos: new THREE.Vector3(0, 0.5, 10), color: 0xf59e0b },
  { id: 'BP', name: 'Ballast Pump', level: 'LOW', pos: new THREE.Vector3(1.5, 0.5, -2), color: 0x10b981 },
  { id: 'FC', name: 'Fuel Control', level: 'CRITICAL', pos: new THREE.Vector3(-1.2, 2.5, 5), color: 0xff0000 },
];

export const initRiskScene = (
  group: THREE.Group, 
  animatables: RiskAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const hullMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, transparent: true, opacity: 0.3, wireframe: true 
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
  
  disposables.push(hullMat, coreMat, pulseMat);

  // 1. Ship Hull Phantom
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(4, 3, 22);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.5;
  shipGroup.add(hull);
  group.add(shipGroup);
  animatables.shipHull = shipGroup;

  // 2. Risk Nodes (Holographic Spheres)
  const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
  disposables.push(nodeGeo, ringGeo);

  RISK_NODES.forEach(node => {
      const nGroup = new THREE.Group();
      nGroup.position.copy(node.pos);
      
      const dot = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: node.color }));
      nGroup.add(dot);
      
      // Expanding alert rings
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI/2;
      nGroup.add(ring);
      
      const light = new THREE.PointLight(node.color, 2, 5);
      nGroup.add(light);
      
      group.add(nGroup);
      
      if(node.id === 'ME') animatables.engineHotspot = nGroup;
      if(node.id === 'RD') animatables.rudderHotspot = nGroup;
  });

  // 3. Scanning Pulse Plane
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), pulseMat);
  scanPlane.rotation.x = -Math.PI / 2;
  group.add(scanPlane);
  animatables.scanningPulse = scanPlane;

  // 4. Sea Surface Grid
  const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);
};

export const animateRiskScene = (
  animatables: RiskAnimatables, 
  time: number,
  globalRiskFactor: number // 0-1
) => {
  if (animatables.shipHull) {
      // Swaying in waves
      animatables.shipHull.rotation.z = Math.sin(time * 0.5) * 0.05 * globalRiskFactor;
      animatables.shipHull.rotation.x = Math.cos(time * 0.3) * 0.02 * globalRiskFactor;
  }

  // Animate Risk Rings
  [animatables.engineHotspot, animatables.rudderHotspot].forEach(node => {
      if (node) {
          const ring = node.children[1] as THREE.Mesh;
          const scale = 1 + (time * 2 % 3);
          ring.scale.set(scale, scale, 1);
          (ring.material as THREE.MeshBasicMaterial).opacity = 1 - (scale/3);
      }
  });

  if (animatables.scanningPulse) {
      animatables.scanningPulse.position.z = Math.sin(time) * 12;
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isTransportConnectScene = (type: SceneType): boolean => {
  return type === 'transport-connect-analysis';
};

export const setupTransportConnectCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(30, 25, 30);
  camera.lookAt(0, 0, 0);
};

export const initTransportConnectScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'transport-connect-analysis') return;

  // 1. Hub Platforms (Sea, Rail, Road)
  // Sea Node (Top Left)
  const seaGroup = new THREE.Group();
  seaGroup.position.set(-15, 0, -10);
  const seaBase = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, opacity: 0.5, transparent: true }));
  disposables.push(seaBase.geometry, seaBase.material);
  seaGroup.add(seaBase);
  // Crane Icon
  const craneGeo = new THREE.BoxGeometry(1, 6, 1);
  const craneMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true });
  disposables.push(craneGeo, craneMat);
  const crane = new THREE.Mesh(craneGeo, craneMat);
  crane.position.y = 3;
  seaGroup.add(crane);
  group.add(seaGroup);

  // Rail Node (Bottom Center)
  const railGroup = new THREE.Group();
  railGroup.position.set(0, 0, 15);
  const railBase = new THREE.Mesh(new THREE.BoxGeometry(15, 1, 6), new THREE.MeshStandardMaterial({ color: 0xf59e0b, opacity: 0.5, transparent: true }));
  disposables.push(railBase.geometry, railBase.material);
  railGroup.add(railBase);
  // Track visual
  const trackGeo = new THREE.BoxGeometry(14, 0.2, 0.5);
  const trackMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(trackGeo, trackMat);
  const track1 = new THREE.Mesh(trackGeo, trackMat); track1.position.set(0, 0.6, -1);
  const track2 = new THREE.Mesh(trackGeo, trackMat); track2.position.set(0, 0.6, 1);
  railGroup.add(track1, track2);
  group.add(railGroup);

  // Road Node (Top Right)
  const roadGroup = new THREE.Group();
  roadGroup.position.set(15, 0, -10);
  const roadBase = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshStandardMaterial({ color: 0x10b981, opacity: 0.5, transparent: true }));
  disposables.push(roadBase.geometry, roadBase.material);
  roadGroup.add(roadBase);
  // Gate visual
  const gateGeo = new THREE.BoxGeometry(8, 3, 0.5);
  const gateMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
  disposables.push(gateGeo, gateMat);
  const gate = new THREE.Mesh(gateGeo, gateMat);
  gate.position.y = 2;
  roadGroup.add(gate);
  group.add(roadGroup);

  // Store Nodes for animation pulsing
  animatables.tcNodes = [seaGroup, railGroup, roadGroup];

  // 2. Transport Paths (Splines)
  animatables.tcVehicles = [];
  animatables.tcLinks = [];

  const createLink = (start: THREE.Vector3, end: THREE.Vector3, color: number) => {
    // Create curve
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y = 8; // Arch height
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    
    // Create visual line
    const points = curve.getPoints(50);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
    disposables.push(geo, mat);
    const line = new THREE.Line(geo, mat);
    group.add(line);
    animatables.tcLinks?.push(line);

    return curve;
  };

  const seaToRail = createLink(seaGroup.position, railGroup.position, 0x0ea5e9);
  const seaToRoad = createLink(seaGroup.position, roadGroup.position, 0x10b981);
  const roadToRail = createLink(roadGroup.position, railGroup.position, 0xf59e0b); // Internal transfer

  // 3. Vehicles (Moving Boxes)
  const boxGeo = new THREE.BoxGeometry(1, 1, 2);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(boxGeo, boxMat);

  const addVehicles = (curve: THREE.CatmullRomCurve3, count: number, color: number, type: 'truck'|'train') => {
      const mat = new THREE.MeshStandardMaterial({ color: color });
      disposables.push(mat);
      for(let i=0; i<count; i++) {
          const mesh = new THREE.Mesh(boxGeo, mat);
          group.add(mesh);
          animatables.tcVehicles?.push({
              mesh,
              path: curve,
              t: i / count,
              speed: 0.002 + Math.random() * 0.001,
              type
          });
      }
  };

  addVehicles(seaToRail, 8, 0x0ea5e9, 'train'); // Sea -> Rail
  addVehicles(seaToRoad, 12, 0x10b981, 'truck'); // Sea -> Road
  addVehicles(roadToRail, 5, 0xf59e0b, 'truck'); // Road -> Rail
};

export const animateTransportConnectScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'transport-connect-analysis') return;

  // External control from userData (simulated jam)
  const isJammed = (animatables.tcNodes && animatables.tcNodes[0].parent?.userData?.jammed) || false;

  // Animate Vehicles
  if (animatables.tcVehicles) {
      animatables.tcVehicles.forEach(v => {
          // If jammed, slow down specific routes
          let speedMod = 1;
          if (isJammed && v.type === 'truck') speedMod = 0.2; // Slow trucks
          
          v.t += v.speed * speedMod;
          if (v.t > 1) v.t = 0;
          
          const pos = v.path.getPoint(v.t);
          const tangent = v.path.getTangent(v.t);
          
          v.mesh.position.copy(pos);
          v.mesh.lookAt(pos.clone().add(tangent));
          
          // Color indication of jam
          if (isJammed && v.type === 'truck') {
             (v.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
          } else {
             // Reset color logic would need store original color, simplify for now
             // In full impl, store original color in object
          }
      });
  }

  // Pulse Nodes
  if (animatables.tcNodes) {
      animatables.tcNodes.forEach((node, i) => {
          node.position.y = Math.sin(time * 2 + i) * 0.2;
      });
  }
};

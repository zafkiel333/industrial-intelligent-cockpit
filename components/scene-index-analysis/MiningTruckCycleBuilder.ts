
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMiningTruckCycleScene = (type: SceneType): boolean => {
  return type === 'mining-truck-cycle-analysis';
};

export const setupMiningTruckCycleCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initMiningTruckCycleScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'mining-truck-cycle-analysis') return;

  // 1. Terrain Loop (Pit to Dump)
  // Create a sloped terrain
  const terrainGeo = new THREE.PlaneGeometry(40, 40, 32, 32);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is world Z after rotation
    
    // Create a ramp shape: High at one corner (Dump), Low at opposite (Pit)
    // Z axis (local Y) from -20 to 20
    let zHeight = (y + 20) / 40 * 8; // 0 to 8 height diff
    
    // Add some noise
    zHeight += Math.random() * 0.5;
    
    // Flatten areas for Pit and Dump
    if (x < -10 && y < -10) zHeight = 0; // Pit
    if (x > 10 && y > 10) zHeight = 8; // Dump

    pos.setZ(i, zHeight);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x292524, 
    roughness: 0.9,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -2;
  group.add(terrain);

  // 2. Road Path
  const pathPoints = [
    new THREE.Vector3(-15, -2, -15), // Pit (Load)
    new THREE.Vector3(0, -2, -15),
    new THREE.Vector3(15, 2, 0), // Ramp up
    new THREE.Vector3(15, 6, 15), // Dump
    new THREE.Vector3(0, 6, 15),
    new THREE.Vector3(-15, 2, 0), // Ramp down
    new THREE.Vector3(-15, -2, -15) // Loop close
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, true);
  
  // Road Visual
  const tubeGeo = new THREE.TubeGeometry(curve, 64, 1.5, 8, true);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x44403c, transparent: true, opacity: 0.5, wireframe: true });
  disposables.push(tubeGeo, tubeMat);
  const road = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(road);

  // 3. Shovel (At Pit)
  const shovelGroup = new THREE.Group();
  shovelGroup.position.set(-15, -2, -18);
  const baseGeo = new THREE.BoxGeometry(4, 2, 4);
  const shovelMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
  disposables.push(baseGeo, shovelMat);
  const sBase = new THREE.Mesh(baseGeo, shovelMat);
  shovelGroup.add(sBase);
  
  const armGroup = new THREE.Group();
  armGroup.position.y = 1;
  shovelGroup.add(armGroup);
  animatables.shovelArm = armGroup;
  
  const armGeo = new THREE.BoxGeometry(1, 1, 6);
  disposables.push(armGeo);
  const arm = new THREE.Mesh(armGeo, shovelMat);
  arm.position.z = 3;
  armGroup.add(arm);
  
  group.add(shovelGroup);

  // 4. Trucks
  animatables.miningTrucks = [];
  const truckGeo = new THREE.BoxGeometry(2, 1.5, 3.5);
  disposables.push(truckGeo);
  
  for (let i = 0; i < 6; i++) {
    const tGroup = new THREE.Group();
    const truckMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Default blue
    disposables.push(truckMat);
    const mesh = new THREE.Mesh(truckGeo, truckMat);
    mesh.position.y = 0.75;
    tGroup.add(mesh);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5);
    wheelGeo.rotateZ(Math.PI/2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    disposables.push(wheelGeo, wheelMat);
    [[-1.2, 1], [1.2, 1], [-1.2, -1], [1.2, -1]].forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos[0], 0.6, pos[1]);
      tGroup.add(w);
    });

    group.add(tGroup);
    
    animatables.miningTrucks.push({
      mesh: tGroup,
      t: i / 6, // Spread out
      speed: 0.001,
      status: 'HAULING'
    });
    
    // Store curve on object for easier access in animation
    (tGroup as any).userData = { curve: curve };
  }
};

export const animateMiningTruckCycleScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'mining-truck-cycle-analysis') return;

  // Animate Shovel
  if (animatables.shovelArm) {
    animatables.shovelArm.rotation.y = Math.sin(time * 0.5) * 0.5;
    animatables.shovelArm.rotation.x = Math.sin(time * 1) * 0.2;
  }

  // Animate Trucks
  if (animatables.miningTrucks) {
    animatables.miningTrucks.forEach(truck => {
      // Update position along curve
      truck.t += truck.speed;
      if (truck.t > 1) truck.t -= 1;
      
      const curve = (truck.mesh as any).userData.curve as THREE.CatmullRomCurve3;
      const pos = curve.getPointAt(truck.t);
      const tangent = curve.getTangentAt(truck.t);
      
      truck.mesh.position.copy(pos);
      truck.mesh.lookAt(pos.clone().add(tangent));

      // Determine State based on 't' (0-1)
      // 0.0 - 0.1: Loading (Pit)
      // 0.1 - 0.45: Hauling (Loaded)
      // 0.45 - 0.55: Dumping (Dump)
      // 0.55 - 1.0: Return (Empty)
      
      const bodyMesh = truck.mesh.children[0] as THREE.Mesh;
      const material = bodyMesh.material as THREE.MeshStandardMaterial;

      if (truck.t < 0.1 || truck.t > 0.95) {
        truck.status = 'LOADING';
        truck.speed = 0.0002; // Slow down
        material.color.setHex(0x3b82f6); // Blue
      } else if (truck.t >= 0.1 && truck.t < 0.45) {
        truck.status = 'HAULING';
        truck.speed = 0.0015; // Slow uphill loaded
        material.color.setHex(0x22c55e); // Green
      } else if (truck.t >= 0.45 && truck.t < 0.55) {
        truck.status = 'DUMPING';
        truck.speed = 0.0002; // Slow down
        material.color.setHex(0xf97316); // Orange
      } else {
        truck.status = 'RETURN';
        truck.speed = 0.0025; // Fast downhill empty
        material.color.setHex(0x64748b); // Grey
      }
    });
  }
};

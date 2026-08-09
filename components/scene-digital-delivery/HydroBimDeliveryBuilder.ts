
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroBimDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-bim-delivery';
};

export const setupHydroBimDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 15);
  camera.lookAt(0, 2, 0);
};

export const initHydroBimDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-bim-delivery') return;

  const modelGroup = new THREE.Group();
  group.add(modelGroup);
  animatables.hbBimModel = modelGroup;
  animatables.hbExplodedParts = [];

  // Material Palette (Construction Tech)
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, metalness: 0.1 }); // Concrete Grey
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.6 }); // Structural Red
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x22d3ee, 
    transparent: true, 
    opacity: 0.3, 
    roughness: 0.1, 
    metalness: 0.9,
    side: THREE.DoubleSide
  });
  
  disposables.push(concreteMat, steelMat, glassMat);

  // 1. Dam Block (Central)
  // Cross section shape
  const damShape = new THREE.Shape();
  damShape.moveTo(0, 0);
  damShape.lineTo(6, 0); // Base width
  damShape.lineTo(4, 10); // Top Downstream
  damShape.lineTo(2, 10); // Top Upstream
  damShape.lineTo(0, 0);  // Heel
  
  const damGeo = new THREE.ExtrudeGeometry(damShape, { depth: 4, bevelEnabled: false });
  damGeo.translate(-3, 0, -2); // Center
  disposables.push(damGeo);

  const damBlock = new THREE.Mesh(damGeo, concreteMat);
  modelGroup.add(damBlock);
  animatables.hbExplodedParts.push({ 
    mesh: damBlock, 
    origin: damBlock.position.clone(), 
    explodeDir: new THREE.Vector3(0, 0, 0) // Static base
  });

  // Wireframe for the dam
  const wireGeo = new THREE.WireframeGeometry(damGeo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x334155, opacity: 0.3, transparent: true });
  const damWire = new THREE.LineSegments(wireGeo, wireMat);
  damBlock.add(damWire);
  disposables.push(wireGeo, wireMat);

  // 2. Penstock (Internal Pipe) - To be exploded out
  const penGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 32);
  penGeo.rotateX(Math.PI / 2);
  penGeo.rotateZ(-Math.PI / 6); // Slanted
  disposables.push(penGeo);
  
  const penstock = new THREE.Mesh(penGeo, steelMat);
  penstock.position.set(1, 4, 0);
  modelGroup.add(penstock);
  animatables.hbExplodedParts.push({ 
    mesh: penstock, 
    origin: penstock.position.clone(), 
    explodeDir: new THREE.Vector3(2, 0, 0) // Slide out X
  });

  // 3. Gate House (Top Structure)
  const houseGeo = new THREE.BoxGeometry(3, 2, 4);
  disposables.push(houseGeo);
  
  const gateHouse = new THREE.Mesh(houseGeo, glassMat);
  gateHouse.position.set(0, 11, 0);
  modelGroup.add(gateHouse);
  animatables.hbExplodedParts.push({ 
    mesh: gateHouse, 
    origin: gateHouse.position.clone(), 
    explodeDir: new THREE.Vector3(0, 2, 0) // Lift up
  });

  // 4. Trash Rack (Upstream)
  const rackGeo = new THREE.BoxGeometry(0.2, 8, 3);
  disposables.push(rackGeo);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
  disposables.push(rackMat);
  
  const rack = new THREE.Mesh(rackGeo, rackMat);
  rack.position.set(-2.5, 4, 0);
  // Rotate to match face slope roughly
  rack.rotation.z = 0.1;
  modelGroup.add(rack);
  animatables.hbExplodedParts.push({ 
    mesh: rack, 
    origin: rack.position.clone(), 
    explodeDir: new THREE.Vector3(-2, 0, 0) // Move upstream
  });

  // 5. Grid Floor
  const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x0f172a);
  group.add(gridHelper);
};

export const animateHydroBimDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-bim-delivery') return;

  // Slow rotation of the whole assembly
  if (animatables.hbBimModel) {
    animatables.hbBimModel.rotation.y = Math.sin(time * 0.05) * 0.3;
  }

  // Explode Animation (Breathing effect)
  // Retrieve 'explode' state from userData if we wire it up, or just continuous loop
  // Let's do a continuous loop: Closed -> Exploded -> Closed
  const explodeFactor = (Math.sin(time * 0.5) + 1) * 0.5; // 0 to 1

  if (animatables.hbExplodedParts) {
    animatables.hbExplodedParts.forEach(part => {
      // Lerp position
      part.mesh.position.copy(part.origin).add(part.explodeDir.clone().multiplyScalar(explodeFactor * 1.5));
    });
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroAssetDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-asset-delivery';
};

export const setupHydroAssetDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 10, 18);
  camera.lookAt(0, 2, 0);
};

export const initHydroAssetDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-asset-delivery') return;

  // 1. The Asset (Stylized Generator Unit)
  const assetGroup = new THREE.Group();
  group.add(assetGroup);
  animatables.hadModel = assetGroup;

  const metalMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.2, 
    metalness: 0.8 
  });
  const goldMat = new THREE.MeshStandardMaterial({ 
    color: 0xfacc15, 
    roughness: 0.3, 
    metalness: 1.0 
  });
  disposables.push(metalMat, goldMat);

  // Stator Housing
  const statorGeo = new THREE.CylinderGeometry(4, 4, 3, 32);
  disposables.push(statorGeo);
  const stator = new THREE.Mesh(statorGeo, metalMat);
  stator.position.y = 1.5;
  assetGroup.add(stator);

  // Rotor Top (Gold)
  const rotorGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
  disposables.push(rotorGeo);
  const rotor = new THREE.Mesh(rotorGeo, goldMat);
  rotor.position.y = 3.25;
  assetGroup.add(rotor);

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, metalMat);
  shaft.position.y = 0;
  assetGroup.add(shaft);

  // Turbine Runner (Bottom)
  const runnerGeo = new THREE.TorusGeometry(2.5, 0.5, 16, 32);
  runnerGeo.rotateX(Math.PI / 2);
  disposables.push(runnerGeo);
  const runner = new THREE.Mesh(runnerGeo, metalMat);
  runner.position.y = -3;
  assetGroup.add(runner);

  // 2. Scan Ring (Validation)
  const ringGeo = new THREE.TorusGeometry(5, 0.1, 8, 64);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.6 });
  disposables.push(ringGeo, ringMat);
  const scanRing = new THREE.Mesh(ringGeo, ringMat);
  group.add(scanRing);
  animatables.hadScanRing = scanRing;

  // 3. Data Cubes (Information Packets)
  // Instanced Mesh for floating data blocks being absorbed
  const cubeCount = 50;
  const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const cubeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
  disposables.push(cubeGeo, cubeMat);
  
  const cubes = new THREE.InstancedMesh(cubeGeo, cubeMat, cubeCount);
  group.add(cubes);
  animatables.hadDataCubes = cubes;

  // Initialize cubes in a cloud around the model
  const dummy = new THREE.Object3D();
  const userData = []; // Store initial positions and speeds
  for(let i=0; i<cubeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    const y = (Math.random() - 0.5) * 10;
    
    dummy.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    dummy.rotation.set(Math.random(), Math.random(), Math.random());
    dummy.updateMatrix();
    cubes.setMatrixAt(i, dummy.matrix);
    
    userData.push({
      startRadius: radius,
      angle: angle,
      y: y,
      speed: 0.02 + Math.random() * 0.03,
      offset: Math.random() * 10
    });
  }
  (cubes as any).userData.particles = userData;
};

export const animateHydroAssetDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-asset-delivery') return;

  // Rotate Model
  if (animatables.hadModel) {
    animatables.hadModel.rotation.y = time * 0.1;
  }

  // Animate Scan Ring
  if (animatables.hadScanRing) {
    animatables.hadScanRing.position.y = Math.sin(time * 0.5) * 4;
    const s = 1 + Math.sin(time * 2) * 0.05;
    animatables.hadScanRing.scale.set(s, s, s);
  }

  // Animate Data Cubes (Absorbing effect)
  if (animatables.hadDataCubes) {
    const mesh = animatables.hadDataCubes;
    const data = (mesh as any).userData.particles;
    const dummy = new THREE.Object3D();

    for(let i=0; i<mesh.count; i++) {
      const p = data[i];
      // Calculate radius based on time to simulate falling in
      // Use modulus to loop: moves from startRadius down to 1, then resets
      const t = (time * p.speed + p.offset) % 1;
      const currentRadius = p.startRadius * (1 - t);
      
      // Spiral in
      const currentAngle = p.angle + t * Math.PI * 4;
      
      // If close to center, scale down to zero
      let scale = 1;
      if (t > 0.8) scale = 1 - (t - 0.8) * 5;
      if (scale < 0) scale = 0;

      dummy.position.set(
        Math.cos(currentAngle) * currentRadius,
        p.y * (1 - t), // Converge Y to 0
        Math.sin(currentAngle) * currentRadius
      );
      dummy.rotation.set(time + i, time + i, time + i);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMiningRecoveryScene = (type: SceneType): boolean => {
  return type === 'mining-recovery-analysis';
};

export const setupMiningRecoveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initMiningRecoveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'mining-recovery-analysis') return;

  // 1. Voxel Ore Body (Instanced Mesh for performance)
  const gridSize = 10;
  const count = gridSize * gridSize * gridSize;
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.8, 
    metalness: 0.2 
  });
  
  disposables.push(geometry, material);

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  
  // Custom property to store "grade" for each instance
  mesh.userData.grades = new Float32Array(count); 
  
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  
  let i = 0;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        // Position centered
        dummy.position.set(
          (x - gridSize/2) * 1.2, 
          (y - gridSize/2) * 1.2, 
          (z - gridSize/2) * 1.2
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Simulate Grade Distribution (Perlin-ish noise simulation)
        // Higher probability of high grade in center
        const dist = Math.sqrt(Math.pow(x-gridSize/2, 2) + Math.pow(y-gridSize/2, 2) + Math.pow(z-gridSize/2, 2));
        const noise = Math.random();
        // Grade 0-10 g/t
        let grade = (1 - dist/gridSize) * 8 + noise * 4; 
        if (grade < 0) grade = 0;
        
        mesh.userData.grades[i] = grade;

        // Initial coloring (will be overridden by main loop logic if needed, but setting base here)
        if (grade > 5) color.setHex(0xf59e0b); // Gold (High Grade)
        else if (grade > 2) color.setHex(0xa855f7); // Purple (Low Grade)
        else color.setHex(0x334155); // Grey (Waste)
        
        mesh.setColorAt(i, color);
        i++;
      }
    }
  }
  
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  group.add(mesh);
  animatables.miningVoxels = mesh;

  // 2. Scanner Plane
  const scanGeo = new THREE.PlaneGeometry(15, 15);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x06b6d4, 
    transparent: true, 
    opacity: 0.15,
    side: THREE.DoubleSide
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  scanner.rotation.x = -Math.PI / 2;
  group.add(scanner);
  animatables.scannerPlane = scanner;

  // 3. Grid Floor
  const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x0f172a);
  gridHelper.position.y = -6;
  group.add(gridHelper);
};

export const animateMiningRecoveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'mining-recovery-analysis') return;

  // Animate Scanner
  if (animatables.scannerPlane) {
    animatables.scannerPlane.position.y = Math.sin(time * 0.5) * 6;
  }

  // Optional: Pulse high grade blocks
  // Note: Modifying InstancedMesh colors every frame is expensive, so we do subtle rotation or light movement instead
  if (animatables.miningVoxels) {
    animatables.miningVoxels.rotation.y = time * 0.05;
  }
};

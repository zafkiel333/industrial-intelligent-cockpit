
import * as THREE from 'three';
import { GeoAnimatables } from './three-types';

export const initGeoScene = (
  scene: THREE.Scene, 
  animatables: GeoAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffd700, 1.5);
  dirLight.position.set(20, 50, 20);
  scene.add(dirLight);
  const blueLight = new THREE.PointLight(0x8b5cf6, 1, 50);
  blueLight.position.set(0, -10, 0);
  scene.add(blueLight);

  // 2. Voxel Block Model (InstancedMesh)
  const gridSize = 16;
  const voxelCount = gridSize * gridSize * gridSize;
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.8, 
    metalness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  disposables.push(geometry, material);

  const mesh = new THREE.InstancedMesh(geometry, material, voxelCount);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  
  let idx = 0;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        // Center position
        const px = (x - gridSize/2) * 1.0;
        const py = (y - gridSize/2) * 1.0;
        const pz = (z - gridSize/2) * 1.0;

        // Ore vein generation logic (Ellipsoid-ish)
        const dist = Math.sqrt(px*px*2 + py*py + pz*pz*2);
        const noise = Math.sin(px * 0.5) * Math.cos(pz * 0.5) * 2;
        const value = Math.max(0, 10 - dist + noise); // Grade proxy

        if (value > 2) {
            dummy.position.set(px, py, pz);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            mesh.setMatrixAt(idx, dummy.matrix);

            // Color based on Grade
            if (value > 7) color.setHex(0xf59e0b); // High Grade (Gold)
            else if (value > 4) color.setHex(0xa855f7); // Med Grade (Purple)
            else color.setHex(0x475569); // Waste (Grey)
            
            mesh.setColorAt(idx, color);
            idx++;
        } else {
            // Hide unused instances
            dummy.position.set(0,0,0);
            dummy.scale.set(0,0,0);
            dummy.updateMatrix();
            mesh.setMatrixAt(idx, dummy.matrix);
            idx++;
        }
      }
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
  animatables.oreVoxels = mesh;

  // 3. Boreholes (Drill Strings)
  const holesGroup = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, opacity: 0.5, transparent: true });
  disposables.push(lineMat);

  for(let i=0; i<8; i++) {
      const x = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 12;
      const points = [
          new THREE.Vector3(x, 10, z),
          new THREE.Vector3(x + (Math.random()-0.5)*2, -10, z + (Math.random()-0.5)*2) // Deviation
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(geo);
      const line = new THREE.Line(geo, lineMat);
      holesGroup.add(line);

      // Collars
      const collarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5);
      const collarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      disposables.push(collarGeo, collarMat);
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.set(x, 10, z);
      holesGroup.add(collar);
  }
  scene.add(holesGroup);
  animatables.boreholes = holesGroup;

  // 4. Scanning Plane
  const scanGeo = new THREE.PlaneGeometry(20, 20);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x06b6d4, 
    side: THREE.DoubleSide, 
    transparent: true, 
    opacity: 0.1,
    blending: THREE.AdditiveBlending 
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  scene.add(scanner);
  animatables.scannerPlane = scanner;
  
  // Scan Edge
  const edgeGeo = new THREE.RingGeometry(9.8, 10, 4, 1, Math.PI/4); // Square-ish
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide });
  disposables.push(edgeGeo, edgeMat);
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.rotation.x = -Math.PI / 2;
  scanner.add(edge);

  // 5. Grid Floor
  const grid = new THREE.GridHelper(30, 30, 0x475569, 0x1c1917);
  grid.position.y = -8;
  scene.add(grid);
  animatables.gridFloor = grid;
};

export const animateGeoScene = (animatables: GeoAnimatables, time: number) => {
    // 1. Rotate Ore Body slowly
    if (animatables.oreVoxels) {
        animatables.oreVoxels.rotation.y = time * 0.05;
    }
    
    // 2. Rotate Boreholes with model (assuming they are fixed space, but for effect let's rotate together)
    if (animatables.boreholes) {
        animatables.boreholes.rotation.y = time * 0.05;
    }

    // 3. Scanner Sweep
    if (animatables.scannerPlane) {
        animatables.scannerPlane.position.y = Math.sin(time * 0.5) * 8;
        
        // Dynamic opacity based on height
        (animatables.scannerPlane.material as THREE.MeshBasicMaterial).opacity = 
            0.1 + Math.abs(Math.sin(time * 0.5)) * 0.1;
    }
};

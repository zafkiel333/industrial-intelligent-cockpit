
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineConstructionDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-construction';
};

export const setupMineConstructionDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(25, 20, 25);
  camera.lookAt(0, 0, 0);
};

export const initMineConstructionDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-construction') return;

  const pitGroup = new THREE.Group();
  group.add(pitGroup);
  animatables.mcdPitModel = pitGroup;
  animatables.mcdLayers = [];

  // 1. Pit Terrain (Wireframe/Solid Mix)
  const size = 40;
  const segments = 40;
  const pitGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  const pos = pitGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is Z after rotation
    const dist = Math.sqrt(x*x + y*y);
    // Create a pit shape
    let z = 0;
    if (dist < 15) {
        z = -10 + dist * 0.6; // Slope down
        // Add benches (terraces)
        z = Math.floor(z / 2) * 2;
    }
    // Add noise
    z += Math.random() * 0.2;
    pos.setZ(i, z);
  }
  pitGeo.computeVertexNormals();
  pitGeo.rotateX(-Math.PI / 2);

  const pitMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    wireframe: false, 
    flatShading: true,
    roughness: 0.9 
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x64748b, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
  });
  
  disposables.push(pitGeo, pitMat, wireMat);
  const pitMesh = new THREE.Mesh(pitGeo, pitMat);
  const pitWire = new THREE.Mesh(pitGeo, wireMat);
  pitGroup.add(pitMesh);
  pitGroup.add(pitWire);

  // 2. Ore Body Layer (Instanced Cubes inside pit)
  const oreGroup = new THREE.Group();
  pitGroup.add(oreGroup);
  animatables.mcdLayers.push(oreGroup);

  const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const cubeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 });
  disposables.push(cubeGeo, cubeMat);
  
  const iMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, 100);
  const dummy = new THREE.Object3D();
  
  for(let i=0; i<100; i++) {
     const theta = Math.random() * Math.PI * 2;
     const r = Math.random() * 8;
     const y = -8 + Math.random() * 4;
     dummy.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
     dummy.rotation.set(Math.random(), Math.random(), Math.random());
     dummy.updateMatrix();
     iMesh.setMatrixAt(i, dummy.matrix);
  }
  oreGroup.add(iMesh);

  // 3. Infrastructure Layer (Haul Roads - Spiral Tube)
  const infraGroup = new THREE.Group();
  pitGroup.add(infraGroup);
  animatables.mcdLayers.push(infraGroup);

  const points = [];
  for(let i=0; i<=50; i++) {
     const t = i/50;
     const angle = t * Math.PI * 4; // 2 loops
     const radius = 5 + t * 10;
     const h = -10 + t * 10;
     points.push(new THREE.Vector3(radius * Math.cos(angle), h, radius * Math.sin(angle)));
  }
  const roadCurve = new THREE.CatmullRomCurve3(points);
  const roadGeo = new THREE.TubeGeometry(roadCurve, 64, 0.5, 8, false);
  const roadMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5, wireframe: true });
  disposables.push(roadGeo, roadMat);
  const road = new THREE.Mesh(roadGeo, roadMat);
  infraGroup.add(road);

  // 4. Scanning Plane
  const scanGeo = new THREE.PlaneGeometry(50, 50);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x22c55e, 
    transparent: true, 
    opacity: 0.1, 
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanPlane);
  animatables.mcdScanPlane = scanPlane;

  // Scan Edge
  const edgeGeo = new THREE.RingGeometry(0, 25, 4, 1, 0, Math.PI * 2); // Actually just a square frame
  // Revert, use Box helper style lines
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-25, 0, -25), new THREE.Vector3(25, 0, -25),
      new THREE.Vector3(25, 0, 25), new THREE.Vector3(-25, 0, 25),
      new THREE.Vector3(-25, 0, -25)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4ade80 });
  disposables.push(lineGeo, lineMat);
  const scanLine = new THREE.Line(lineGeo, lineMat);
  scanPlane.add(scanLine);

  // 5. Data Points (Digital Twin Sync)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = (Math.random()-0.5)*30;
     pPos[i*3+1] = 5 + Math.random()*10; // Floating above
     pPos[i*3+2] = (Math.random()-0.5)*30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.mcdDataPoints = particles;
};

export const animateMineConstructionDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-construction') return;

  // Rotate Model
  if (animatables.mcdPitModel) {
    animatables.mcdPitModel.rotation.y = time * 0.05;
  }

  // Scan Plane
  if (animatables.mcdScanPlane) {
    animatables.mcdScanPlane.position.y = Math.sin(time * 0.5) * 8 - 2;
  }

  // Pulse Layers
  if (animatables.mcdLayers) {
      animatables.mcdLayers.forEach((layer, i) => {
          layer.visible = Math.sin(time * 0.2 + i) > -0.5; // Slow toggle
      });
  }

  // Data Rain
  if (animatables.mcdDataPoints) {
      const positions = animatables.mcdDataPoints.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] -= 0.1;
          if(positions[i+1] < -5) positions[i+1] = 15;
      }
      animatables.mcdDataPoints.geometry.attributes.position.needsUpdate = true;
  }
};

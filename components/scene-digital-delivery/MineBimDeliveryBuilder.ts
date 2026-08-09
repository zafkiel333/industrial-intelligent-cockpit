
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineBimDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-bim-delivery';
};

export const setupMineBimDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(25, 20, 25);
  camera.lookAt(0, 0, 0);
};

export const initMineBimDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-bim-delivery') return;

  // 1. Digital Grid Container (Reference)
  const gridHelper = new THREE.GridHelper(50, 50, 0x0ea5e9, 0x1e293b);
  gridHelper.position.y = -10;
  group.add(gridHelper);
  animatables.mbdGrid = gridHelper;

  // 2. GIM - Ore Body (Volumetric Voxel Cloud)
  const voxelCount = 300;
  const oreGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const oreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, wireframe: true });
  disposables.push(oreGeo, oreMat);
  
  const oreBody = new THREE.InstancedMesh(oreGeo, oreMat, voxelCount);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  
  // Create an irregular cloud shape
  for(let i=0; i<voxelCount; i++) {
    const r = Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 15;
    
    // Concentrate in a "vein"
    const x = r * Math.cos(theta) * 0.5 + y * 0.5;
    const z = r * Math.sin(theta) * 0.5;

    dummy.position.set(x, y, z);
    dummy.rotation.set(Math.random(), Math.random(), Math.random());
    // Scale based on "grade"
    const scale = Math.random() * 0.5 + 0.5;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    oreBody.setMatrixAt(i, dummy.matrix);

    // Color gradient (Gold to Rock)
    if (Math.random() > 0.7) color.setHex(0xfacc15); // High grade
    else color.setHex(0x57534e); // Waste
    oreBody.setColorAt(i, color);
  }
  
  oreBody.instanceMatrix.needsUpdate = true;
  if (oreBody.instanceColor) oreBody.instanceColor.needsUpdate = true;
  group.add(oreBody);
  animatables.mbdOreBody = oreBody;

  // 3. BIM - Tunnel Infrastructure (Cutting through GIM)
  const bimGroup = new THREE.Group();
  group.add(bimGroup);
  animatables.mbdTunnels = bimGroup;

  const tunnelMat = new THREE.MeshStandardMaterial({ 
    color: 0x06b6d4, // Cyan
    roughness: 0.3,
    metalness: 0.8,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  disposables.push(tunnelMat);

  // Main Spiral Ramp
  const pathPoints = [];
  for(let i=0; i<=50; i++) {
      const t = i/50;
      const angle = t * Math.PI * 4; 
      const r = 8;
      const h = 10 - t * 20;
      pathPoints.push(new THREE.Vector3(r*Math.cos(angle), h, r*Math.sin(angle)));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(pathPoints);
  const tunnelGeo = new THREE.TubeGeometry(spiralCurve, 64, 1.2, 8, false);
  disposables.push(tunnelGeo);
  const spiralTunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
  bimGroup.add(spiralTunnel);

  // Vertical Shaft
  const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 25, 16, 1, true);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, tunnelMat);
  shaft.position.set(0, 0, 0); // Center
  bimGroup.add(shaft);

  // Cross Drifts
  const driftGeo = new THREE.CylinderGeometry(0.8, 0.8, 18, 16, 1, true);
  driftGeo.rotateZ(Math.PI / 2);
  disposables.push(driftGeo);
  const drift1 = new THREE.Mesh(driftGeo, tunnelMat);
  drift1.position.set(0, -5, 0);
  bimGroup.add(drift1);
  const drift2 = new THREE.Mesh(driftGeo, tunnelMat);
  drift2.rotation.y = Math.PI / 2;
  drift2.position.set(0, 5, 0);
  bimGroup.add(drift2);

  // 4. Fusion Scanner (Scanning Plane)
  const scanGeo = new THREE.PlaneGeometry(40, 40);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x22c55e, // Green verify
    transparent: true, 
    opacity: 0.1, 
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanPlane);
  animatables.mbdScanner = scanPlane;

  // Scan Edge Line
  const edgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-20, 0, 0), new THREE.Vector3(20, 0, 0)
  ]);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 });
  disposables.push(edgeGeo, edgeMat);
  const edge = new THREE.Line(edgeGeo, edgeMat);
  scanPlane.add(edge);

  // 5. Data Particles (Floating info)
  const pCount = 100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = (Math.random()-0.5) * 20;
     pPos[i*3+1] = (Math.random()-0.5) * 20;
     pPos[i*3+2] = (Math.random()-0.5) * 20;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.15, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.mbdParticles = particles;
};

export const animateMineBimDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-bim-delivery') return;

  // Rotate entire scene slowly
  // if (animatables.mbdTunnels) {
  //   animatables.mbdTunnels.rotation.y = time * 0.1;
  // }
  // if (animatables.mbdOreBody) {
  //   animatables.mbdOreBody.rotation.y = time * 0.1;
  // }

  // Scanner Sweep (Up and Down)
  if (animatables.mbdScanner) {
      animatables.mbdScanner.position.y = Math.sin(time * 0.5) * 12;
      
      // Dynamic Opacity based on scan
      if (animatables.mbdTunnels) {
          // Highlight tunnels when scanner is close vertically
          // Simplified: Just constant ghost effect
      }
  }

  // Particle Float
  if (animatables.mbdParticles) {
      const positions = animatables.mbdParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] += 0.05;
          if (positions[i+1] > 10) positions[i+1] = -10;
      }
      animatables.mbdParticles.geometry.attributes.position.needsUpdate = true;
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isVentilationEfficiencyScene = (type: SceneType): boolean => {
  return type === 'ventilation-efficiency-analysis';
};

export const setupVentilationEfficiencyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initVentilationEfficiencyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'ventilation-efficiency-analysis') return;

  // 1. Tunnel Network (Tubes)
  const tunnelMat = new THREE.MeshBasicMaterial({ 
    color: 0x334155, 
    transparent: true, 
    opacity: 0.3, 
    wireframe: true 
  });
  disposables.push(tunnelMat);

  // Define paths
  const intakePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 10, -10), // Surface Intake
    new THREE.Vector3(-10, 0, -10),  // Shaft Bottom
    new THREE.Vector3(-5, 0, -5),
    new THREE.Vector3(0, 0, 0),      // Junction
  ]);

  const facePath1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(8, 0, -2),     // Face 1
    new THREE.Vector3(12, 0, 0),
  ]);

  const facePath2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-2, 0, 8),     // Face 2
    new THREE.Vector3(0, 0, 12),
  ]);

  const returnPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(12, 0, 0),     // From Face 1
    new THREE.Vector3(10, 0, 5),
    new THREE.Vector3(0, 0, 12),     // Join Face 2
    new THREE.Vector3(5, 0, 15),
    new THREE.Vector3(10, 0, 10),    // Return Main
    new THREE.Vector3(10, 10, 10),   // Return Shaft (Fan)
  ]);

  const paths = [intakePath, facePath1, facePath2, returnPath];

  paths.forEach(path => {
    const geo = new THREE.TubeGeometry(path, 20, 1.5, 8, false);
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, tunnelMat);
    group.add(mesh);
  });

  // 2. Main Fan (At Return Shaft)
  const fanGroup = new THREE.Group();
  fanGroup.position.set(10, 10, 10);
  // Tilt to align with shaft top approximately
  fanGroup.rotation.x = -Math.PI / 2;
  
  const housingGeo = new THREE.CylinderGeometry(2, 2, 2, 32, 1, true);
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide });
  disposables.push(housingGeo, housingMat);
  const housing = new THREE.Mesh(housingGeo, housingMat);
  fanGroup.add(housing);

  const bladesGroup = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.2, 3.5, 0.5);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bladeGeo, bladeMat);
  
  for(let i=0; i<8; i++) {
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.rotation.z = i * (Math.PI / 4);
    bladesGroup.add(blade);
  }
  fanGroup.add(bladesGroup);
  group.add(fanGroup);
  
  animatables.ventFans = [bladesGroup];

  // 3. Airflow Particles
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pColor = new Float32Array(pCount * 3);
  const pData = new Float32Array(pCount * 2); // [pathIndex, progress]
  
  // Colors
  const cFresh = new THREE.Color(0x22d3ee); // Cyan
  const cUsed = new THREE.Color(0xfacc15);  // Yellow
  const cReturn = new THREE.Color(0xef4444); // Red

  for(let i=0; i<pCount; i++) {
    const pathIdx = Math.floor(Math.random() * paths.length);
    const t = Math.random();
    
    pData[i*2] = pathIdx;
    pData[i*2+1] = t;
    
    const point = paths[pathIdx].getPoint(t);
    // Add spread
    pPos[i*3] = point.x + (Math.random()-0.5);
    pPos[i*3+1] = point.y + (Math.random()-0.5);
    pPos[i*3+2] = point.z + (Math.random()-0.5);

    // Color logic
    let col = cFresh;
    if (pathIdx === 3) col = cReturn; // Return path
    else if (pathIdx > 0) col = cUsed; // Faces
    
    pColor[i*3] = col.r;
    pColor[i*3+1] = col.g;
    pColor[i*3+2] = col.b;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));
  pGeo.setAttribute('data', new THREE.BufferAttribute(pData, 2));

  const pMat = new THREE.PointsMaterial({ vertexColors: true, size: 0.2, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.airParticles = particles;
  
  // Store paths on object for animation
  (particles as any).userData = { paths };
};

export const animateVentilationEfficiencyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'ventilation-efficiency-analysis') return;

  // Animate Fan
  if (animatables.ventFans) {
    animatables.ventFans.forEach(fan => {
      fan.rotation.y -= 0.2; // Spin fast
    });
  }

  // Animate Airflow
  if (animatables.airParticles) {
    const particles = animatables.airParticles;
    const paths = (particles as any).userData.paths as THREE.Curve<THREE.Vector3>[];
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const data = particles.geometry.attributes.data.array as Float32Array;
    
    for(let i=0; i<data.length/2; i++) {
      let pathIdx = data[i*2];
      let t = data[i*2+1];
      
      // Advance
      t += 0.005;
      
      // If end of path, move to next logical path or reset
      if (t > 1) {
        t = 0;
        if (pathIdx === 0) { // Intake -> Face 1 or 2
           pathIdx = Math.random() > 0.5 ? 1 : 2;
        } else if (pathIdx === 1 || pathIdx === 2) { // Faces -> Return
           pathIdx = 3;
        } else { // Return -> Intake (Loop)
           pathIdx = 0;
        }
        data[i*2] = pathIdx;
      }
      data[i*2+1] = t;

      const point = paths[pathIdx].getPoint(t);
      // Jitter
      positions[i*3] = point.x + (Math.random()-0.5);
      positions[i*3+1] = point.y + (Math.random()-0.5);
      positions[i*3+2] = point.z + (Math.random()-0.5);
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.data.needsUpdate = true;
  }
};

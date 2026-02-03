
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroUtilScene = (type: SceneType): boolean => {
  return type === 'hydro-util-analysis';
};

export const setupHydroUtilCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(10, 8, 12);
  camera.lookAt(0, 0, 0);
};

export const initHydroUtilScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'hydro-util-analysis') return;

  // 1. Spiral Case (Volute) - Abstracted
  const spiralPoints = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const angle = t * Math.PI * 2;
    const radius = 2 + t * 3; // Spiral out
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    spiralPoints.push(new THREE.Vector3(x, 0, z));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
  const spiralGeo = new THREE.TubeGeometry(spiralCurve, 50, 1, 16, false);
  const spiralMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.2, 
    wireframe: true 
  });
  disposables.push(spiralGeo, spiralMat);
  const spiral = new THREE.Mesh(spiralGeo, spiralMat);
  group.add(spiral);

  // 2. Runner (Turbine)
  const runnerGroup = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.2, 2, 1.5);
  // Twist modifier simulation via multiple segments not easily doable without custom geo, 
  // so we use simple blades rotated
  const runnerMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });
  disposables.push(bladeGeo, runnerMat);

  for (let i = 0; i < 12; i++) {
    const blade = new THREE.Mesh(bladeGeo, runnerMat);
    const angle = (i / 12) * Math.PI * 2;
    blade.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5);
    blade.rotation.y = -angle + 0.5; // Slight twist angle
    runnerGroup.add(blade);
  }
  group.add(runnerGroup);
  animatables.hydroRunner = runnerGroup;

  // 3. Main Shaft (Energy Core)
  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 32);
  const shaftMat = new THREE.MeshStandardMaterial({ 
    color: 0x22d3ee, 
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.5
  });
  disposables.push(shaftGeo, shaftMat);
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 2;
  group.add(shaft);
  animatables.hydroShaft = shaft;

  // 4. Draft Tube (Outlet)
  const draftGeo = new THREE.CylinderGeometry(2, 4, 4, 32, 1, true);
  draftGeo.translate(0, -3, 0);
  const draftMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  disposables.push(draftGeo, draftMat);
  const draft = new THREE.Mesh(draftGeo, draftMat);
  group.add(draft);

  // 5. Water Flow Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pData = new Float32Array(pCount); // progress 0-1
  
  for(let i=0; i<pCount; i++) {
    pData[i] = Math.random();
    // Initial calc handled in animate to allow dynamic updates based on curve
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pData, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.15, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.hydroFlow = particles;
  
  // Store curve on object
  (particles as any).userData = { curve: spiralCurve };
};

export const animateHydroUtilScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'hydro-util-analysis') return;

  // Get external params from userData if available, else default
  // Ideally, we'd pass props, but the animation loop is decoupled. 
  // We can infer intensity from a global or simulate variations.
  const flowSpeed = 0.01 + Math.sin(time * 0.2) * 0.005; 

  // Animate Runner
  if (animatables.hydroRunner) {
    animatables.hydroRunner.rotation.y -= 0.1 + flowSpeed * 5;
  }

  // Animate Shaft (Pulse)
  if (animatables.hydroShaft) {
    const intensity = 0.5 + Math.sin(time * 5) * 0.2;
    (animatables.hydroShaft.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
  }

  // Animate Flow Particles
  if (animatables.hydroFlow) {
    const particles = animatables.hydroFlow;
    const curve = (particles as any).userData.curve as THREE.CatmullRomCurve3;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const progress = particles.geometry.attributes.progress.array as Float32Array;
    
    for(let i=0; i<progress.length; i++) {
      progress[i] += flowSpeed; // Dynamic speed based on 'head' simulation
      
      // Phase 1: Spiral (0.0 - 0.7)
      // Phase 2: Drop through runner (0.7 - 0.8)
      // Phase 3: Draft tube expand (0.8 - 1.0)
      
      if (progress[i] > 1) progress[i] = 0;
      
      const t = progress[i];
      let x, y, z;

      if (t < 0.7) {
        // Follow spiral curve
        const curveT = t / 0.7; // map to 0-1
        const point = curve.getPoint(curveT);
        x = point.x + (Math.random()-0.5)*0.5;
        y = point.y + (Math.random()-0.5)*0.5;
        z = point.z + (Math.random()-0.5)*0.5;
      } else if (t < 0.8) {
        // Drop Vertical
        const dropT = (t - 0.7) / 0.1;
        // Spiral end is approx radius 5
        const r = 2; // Runner radius
        const angle = dropT * Math.PI * 4; // Spin down
        x = Math.cos(angle) * r;
        y = -dropT * 2; // 0 to -2
        z = Math.sin(angle) * r;
      } else {
        // Draft tube expansion
        const draftT = (t - 0.8) / 0.2;
        const r = 2 + draftT * 2; // 2 to 4
        const angle = draftT * Math.PI * 2;
        x = Math.cos(angle) * r + (Math.random()-0.5);
        y = -2 - draftT * 3; // -2 to -5
        z = Math.sin(angle) * r + (Math.random()-0.5);
      }

      positions[i*3] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = z;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.progress.needsUpdate = true;
  }
};

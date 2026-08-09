
import * as THREE from 'three';
import { ExProofAnimatables, ElectricState } from './three-types';

export const initExProofScene = (
  group: THREE.Group, 
  animatables: ExProofAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const shellMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.4, metalness: 0.8 
  }); // 银灰色防爆壳
  const redPaintMat = new THREE.MeshStandardMaterial({ 
    color: 0xb91c1c, roughness: 0.6, metalness: 0.2 
  }); // 红色高压标识
  const copperMat = new THREE.MeshStandardMaterial({ 
    color: 0xd97706, metalness: 0.9, roughness: 0.3 
  }); // 铜排
  const flameProofMat = new THREE.MeshBasicMaterial({ 
    color: 0xfacc15, transparent: true, opacity: 0, wireframe: true 
  }); // 隔爆面高亮
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const flowMat = new THREE.PointsMaterial({
    color: 0x22d3ee, size: 0.15, transparent: true, opacity: 0.6
  });

  disposables.push(shellMat, redPaintMat, copperMat, flameProofMat, screenMat, cableMat, flowMat);

  // 1. 防爆外壳 (Main Enclosure - BGP style rectangular with ribs)
  const cabinetGroup = new THREE.Group();
  group.add(cabinetGroup);
  animatables.cabinetGroup = cabinetGroup;

  // Body
  const bodyGeo = new THREE.BoxGeometry(6, 6, 4);
  const body = new THREE.Mesh(bodyGeo, shellMat);
  cabinetGroup.add(body);

  // Reinforcement Ribs (To look like Ex-d enclosure)
  const ribGeo = new THREE.BoxGeometry(6.2, 0.2, 4.2);
  disposables.push(ribGeo);
  for(let y=-2.5; y<=2.5; y+=1.5) {
      const rib = new THREE.Mesh(ribGeo, shellMat);
      rib.position.y = y;
      cabinetGroup.add(rib);
  }

  // Base Skids
  const skidGeo = new THREE.BoxGeometry(0.5, 0.5, 5);
  const skidL = new THREE.Mesh(skidGeo, shellMat); skidL.position.set(-2.5, -3.25, 0);
  const skidR = new THREE.Mesh(skidGeo, shellMat); skidR.position.set(2.5, -3.25, 0);
  cabinetGroup.add(skidL, skidR);

  // 2. Front Door (Circular Opening typical for Ex-d)
  const doorGroup = new THREE.Group();
  doorGroup.position.z = 2.05;
  cabinetGroup.add(doorGroup);
  animatables.doorGroup = doorGroup;

  const doorPlateGeo = new THREE.BoxGeometry(5, 5, 0.2);
  const doorPlate = new THREE.Mesh(doorPlateGeo, shellMat);
  doorGroup.add(doorPlate);

  // Handle wheel
  const wheelGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 16);
  const wheel = new THREE.Mesh(wheelGeo, redPaintMat);
  wheel.position.z = 0.2;
  doorGroup.add(wheel);

  // Observation Window / Screen
  const screenGeo = new THREE.PlaneGeometry(1.5, 1);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 1.5, 0.11);
  doorGroup.add(screen);
  animatables.statusScreen = screen;

  // Flame Path Highlight (Gap between door and body)
  const fpGeo = new THREE.BoxGeometry(5.1, 5.1, 0.4);
  disposables.push(fpGeo);
  const flamePath = new THREE.Mesh(fpGeo, flameProofMat);
  flamePath.position.z = 2;
  cabinetGroup.add(flamePath);
  animatables.flamePath = flamePath;

  // 3. Internal Components (Breaker)
  const internalGroup = new THREE.Group();
  cabinetGroup.add(internalGroup);
  animatables.breakerInternal = internalGroup;

  // Vacuum Bottles
  const bottleGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
  bottleGeo.rotateX(Math.PI/2);
  disposables.push(bottleGeo);
  for(let i=0; i<3; i++) {
      const bottle = new THREE.Mesh(bottleGeo, new THREE.MeshStandardMaterial({color: 0xffffff, transparent:true, opacity: 0.5}));
      bottle.position.set(-1.5 + i*1.5, 0, 0);
      internalGroup.add(bottle);
      
      // Copper bars
      const barGeo = new THREE.BoxGeometry(0.1, 2, 0.1);
      const bar = new THREE.Mesh(barGeo, copperMat);
      bar.position.set(-1.5 + i*1.5, 1, 0);
      internalGroup.add(bar);
  }
  // Busbars
  const busGeo = new THREE.BoxGeometry(5, 0.2, 0.5);
  const bus = new THREE.Mesh(busGeo, copperMat);
  bus.position.y = 2;
  internalGroup.add(bus);

  internalGroup.visible = false; // Hidden unless door opens

  // 4. Cables
  const cableGeo = new THREE.CylinderGeometry(0.4, 0.4, 6);
  cableGeo.rotateX(Math.PI/2);
  disposables.push(cableGeo);
  
  // Input Cable
  const cIn = new THREE.Mesh(cableGeo, cableMat);
  cIn.position.set(-4, -1, -1);
  cIn.rotation.z = -Math.PI/4;
  group.add(cIn);

  // Output Cable
  const cOut = new THREE.Mesh(cableGeo, cableMat);
  cOut.position.set(4, -1, -1);
  cOut.rotation.z = Math.PI/4;
  group.add(cOut);

  // 5. Current Flow Particles
  const pGeo = new THREE.BufferGeometry();
  const pCount = 200;
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = (Math.random()-0.5) * 5;
     pPos[i*3+1] = (Math.random()-0.5) * 4;
     pPos[i*3+2] = (Math.random()-0.5) * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, flowMat);
  group.add(particles);
  animatables.currentFlow = particles;

  // 6. Arc Effect Light
  const arcLight = new THREE.PointLight(0x00ffff, 0, 10);
  arcLight.position.set(0, 0, 0);
  group.add(arcLight);
  animatables.arcEffect = arcLight;

  // Ground Grid
  const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1c1917);
  grid.position.y = -3.5;
  group.add(grid);
};

export const animateExProofScene = (
  animatables: ExProofAnimatables, 
  state: ElectricState,
  time: number
) => {
  // 1. Current Flow Animation
  if (animatables.currentFlow) {
      const mat = animatables.currentFlow.material as THREE.PointsMaterial;
      if (state === 'NORMAL') {
          mat.color.setHex(0x22d3ee); // Blue
          mat.size = 0.15;
          mat.opacity = 0.6;
      } else if (state === 'OVERLOAD') {
          mat.color.setHex(0xfacc15); // Yellow
          mat.size = 0.2;
          mat.opacity = 0.8;
      } else if (state === 'SHORT_CIRCUIT') {
          mat.color.setHex(0xff0000); // Red
          mat.size = 0.3;
          mat.opacity = Math.random(); // Flicker
      } else {
          mat.opacity = 0.1; // Low power in other modes
      }
      
      const pos = animatables.currentFlow.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += 0.1; // Flow X
          if (pos[i] > 3) pos[i] = -3;
          // Jitter in Short Circuit
          if (state === 'SHORT_CIRCUIT') {
              pos[i+1] += (Math.random()-0.5)*0.1;
          }
      }
      animatables.currentFlow.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Flame Path Scanning (Calculating)
  if (animatables.flamePath) {
      const mat = animatables.flamePath.material as THREE.MeshBasicMaterial;
      if (state === 'CALCULATING') {
          mat.opacity = 0.5 + Math.sin(time * 10) * 0.3;
      } else {
          mat.opacity = 0;
      }
  }

  // 3. Open Door Animation
  if (animatables.doorGroup && animatables.breakerInternal) {
      if (state === 'OPEN_INSPECT') {
          // Swing open
          animatables.doorGroup.rotation.y = THREE.MathUtils.lerp(animatables.doorGroup.rotation.y, Math.PI/2, 0.05);
          animatables.doorGroup.position.x = THREE.MathUtils.lerp(animatables.doorGroup.position.x, 3, 0.05);
          animatables.breakerInternal.visible = true;
      } else {
          animatables.doorGroup.rotation.y = THREE.MathUtils.lerp(animatables.doorGroup.rotation.y, 0, 0.1);
          animatables.doorGroup.position.x = THREE.MathUtils.lerp(animatables.doorGroup.position.x, 0, 0.1);
          if (animatables.doorGroup.rotation.y < 0.1) animatables.breakerInternal.visible = false;
      }
  }

  // 4. Arc/Fault Light
  if (animatables.arcEffect) {
      if (state === 'SHORT_CIRCUIT') {
          animatables.arcEffect.intensity = 5 + Math.random() * 5;
          animatables.arcEffect.color.setHex(0xffaa00); // Spark color
      } else if (state === 'OVERLOAD') {
          animatables.arcEffect.intensity = 2;
          animatables.arcEffect.color.setHex(0xff0000); // Heat glow
      } else {
          animatables.arcEffect.intensity = 0;
      }
  }
};

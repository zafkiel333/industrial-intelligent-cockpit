
import * as THREE from 'three';
import { ShearerAnimatables, CutState } from './three-types';

export const initShearerScene = (
  group: THREE.Group, 
  animatables: ShearerAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const drumMat = new THREE.MeshStandardMaterial({ 
    color: 0x1c1917, roughness: 0.7, metalness: 0.6 
  }); // 滚筒基体
  const flightMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.5, metalness: 0.5 
  }); // 螺旋叶片
  const pickMat = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, roughness: 0.3, metalness: 0.9 
  }); // 截齿体
  const tipMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, roughness: 0.2, metalness: 1.0, emissive: 0x451a03 
  }); // 硬质合金头
  const coalMat = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0a, roughness: 1.0, flatShading: true 
  }); // 煤壁
  const particleMat = new THREE.PointsMaterial({
    color: 0x1a1a1a, size: 0.15, transparent: true, opacity: 0.8
  });

  disposables.push(drumMat, flightMat, pickMat, tipMat, coalMat, particleMat);

  // 1. 螺旋滚筒组 (Shearer Drum)
  const drumGroup = new THREE.Group();
  group.add(drumGroup);
  animatables.drumGroup = drumGroup;

  // 筒毂
  const hubGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
  hubGeo.rotateZ(Math.PI / 2);
  disposables.push(hubGeo);
  const hub = new THREE.Mesh(hubGeo, drumMat);
  drumGroup.add(hub);

  // 螺旋叶片 (Simplified using torus parts or custom geo, here simplified as rings for visual)
  // 为了模拟螺旋，我们用多个倾斜的圆环片段
  const flightCount = 3;
  for(let i=0; i<flightCount; i++) {
      const flightGeo = new THREE.TorusGeometry(2.2, 0.1, 8, 32);
      disposables.push(flightGeo);
      const flight = new THREE.Mesh(flightGeo, flightMat);
      flight.rotation.y = Math.PI / 2;
      flight.position.x = -2 + i * 2;
      // Tilt to look like a screw
      flight.rotation.x = 0.5;
      drumGroup.add(flight);
  }

  // 2. 截齿 (Picks) - 沿螺旋线分布
  animatables.picks = [];
  animatables.forceVectors = [];
  
  const pickGeo = new THREE.ConeGeometry(0.15, 0.8, 8);
  pickGeo.translate(0, 0.4, 0); // Pivot at base
  pickGeo.rotateX(Math.PI/2); // Point out
  disposables.push(pickGeo);

  const numPicks = 24;
  for(let i=0; i<numPicks; i++) {
      const angle = (i / numPicks) * Math.PI * 4; // 2 turns
      const xPos = -2.5 + (i / numPicks) * 5;
      
      const pickBase = new THREE.Group();
      pickBase.position.set(xPos, Math.cos(angle)*2.2, Math.sin(angle)*2.2);
      pickBase.lookAt(xPos, 0, 0); // Face outward
      
      const pickMesh = new THREE.Mesh(pickGeo, pickMat);
      // Add Carbide Tip
      const tipGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
      tipGeo.translate(0, 0.8, 0);
      tipGeo.rotateX(Math.PI/2);
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      
      pickBase.add(pickMesh);
      pickBase.add(tipMesh);
      drumGroup.add(pickBase);
      
      animatables.picks.push(tipMesh);

      // Force Vector Arrow (Visualizing resistance)
      const dir = new THREE.Vector3(0, 1, 0); // Will be updated
      const origin = new THREE.Vector3(0, 0, 0);
      const arrow = new THREE.ArrowHelper(dir, origin, 0, 0xff0000);
      pickBase.add(arrow); // Attach to pick so it moves with it
      animatables.forceVectors.push(arrow);
  }

  // 3. 煤壁 (Coal Face)
  const coalGeo = new THREE.BoxGeometry(10, 8, 4);
  
  // Add noise to coal face
  const pos = coalGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
     if (pos.getZ(i) > 0) { // Front face
         pos.setZ(i, pos.getZ(i) + (Math.random()-0.5)*0.5);
     }
  }
  coalGeo.computeVertexNormals();
  disposables.push(coalGeo);

  const coalWall = new THREE.Mesh(coalGeo, coalMat);
  coalWall.position.set(0, 0, 4.5); // In front of drum
  group.add(coalWall);
  animatables.coalWall = coalWall;

  // 4. 煤尘粒子 (Particles)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; // Hide initially
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, particleMat);
  group.add(particles);
  animatables.particles = particles;

  // 5. 冲击光效
  const light = new THREE.PointLight(0xffaa00, 0, 10);
  group.add(light);
  animatables.impactGlow = light;

  // 6. 扫描激光
  const laserGeo = new THREE.PlaneGeometry(8, 8);
  const laserMesh = new THREE.Mesh(laserGeo, new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, transparent: true, opacity: 0.1, side: THREE.DoubleSide
  }));
  laserMesh.rotation.y = Math.PI / 2;
  laserMesh.position.set(0, 0, 2.5);
  laserMesh.visible = false;
  group.add(laserMesh);
  animatables.scanLaser = laserMesh;

  // Grid floor
  const grid = new THREE.GridHelper(20, 20, 0x334155, 0x000000);
  grid.position.y = -4;
  group.add(grid);
};

export const animateShearerScene = (
  animatables: ShearerAnimatables, 
  state: CutState,
  params: { rpm: number, hardness: number },
  time: number
) => {
  const isCutting = state === 'CUTTING' || state === 'HARD_INCLUSION';
  const rotationSpeed = (params.rpm / 60) * 0.1; // Scale for visual

  // 1. Drum Rotation
  if (animatables.drumGroup) {
      animatables.drumGroup.rotation.x -= rotationSpeed;
  }

  // 2. Interaction Logic (Picks hitting coal)
  if (animatables.picks && animatables.forceVectors) {
      animatables.picks.forEach((pick, i) => {
          // Get world position of tip
          const worldPos = new THREE.Vector3();
          pick.getWorldPosition(worldPos);

          // Check if hitting coal zone (Z > 2.5 roughly)
          const isHit = worldPos.z > 2.5 && worldPos.y < 2 && worldPos.y > -2;
          
          const arrow = animatables.forceVectors![i];
          
          if (isHit && isCutting) {
              // Calculate resistance force visual
              // Harder coal = longer arrow, redder color
              const f = params.hardness * (1 + Math.random()*0.2); 
              let len = f / 2;
              let color = 0xffa500; // Orange

              if (state === 'HARD_INCLUSION') {
                  len *= 2;
                  color = 0xff0000; // Red
                  // Spark effect position
                  if (animatables.impactGlow) {
                      animatables.impactGlow.position.copy(worldPos);
                      animatables.impactGlow.intensity = 2 + Math.random() * 3;
                  }
              }

              arrow.setLength(len, len*0.3, len*0.1);
              arrow.setColor(color);
              
              // Heat up pick tip
              (pick.material as THREE.MeshStandardMaterial).emissive.setHex(color);
              (pick.material as THREE.MeshStandardMaterial).emissiveIntensity = len / 5;

          } else {
              arrow.setLength(0);
              (pick.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
      });
  }

  // 3. Particles (Dust/Chips)
  if (animatables.particles && isCutting) {
      const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
      // Emit from a random pick interaction zone
      for(let i=0; i<pos.length; i+=3) {
          pos[i+1] -= 0.1; // Gravity
          pos[i+2] -= 0.1; // Fly away from face
          
          if (pos[i+1] < -4) {
              // Respawn near cutting zone
              pos[i] = (Math.random()-0.5) * 6;
              pos[i+1] = (Math.random()-0.5) * 2;
              pos[i+2] = 2.5 + Math.random();
          }
      }
      animatables.particles.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Reset light if not hard inclusion
  if (state !== 'HARD_INCLUSION' && animatables.impactGlow) {
      animatables.impactGlow.intensity = 0;
  }

  // 5. Scan Laser
  if (animatables.scanLaser) {
     // Always visible as a faint grid, or pulse?
     // Let's pulse it
     animatables.scanLaser.visible = true;
     animatables.scanLaser.position.z = 2.5 + Math.sin(time * 2) * 0.5;
  }
};

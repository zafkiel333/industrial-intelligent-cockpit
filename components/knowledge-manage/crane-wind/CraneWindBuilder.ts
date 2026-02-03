
import * as THREE from 'three';
import { CraneWindAnimatables, WindLevelState } from './three-types';

export const initCraneWindScene = (
  group: THREE.Group, 
  animatables: CraneWindAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const structureMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, roughness: 0.7, metalness: 0.5 
  }); // 结构青
  
  const warningMat = new THREE.MeshStandardMaterial({ 
    color: 0xf97316, roughness: 0.4, emissive: 0x7c2d12, emissiveIntensity: 0.2 
  }); // 警示橙 (锚定装置)
  
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, roughness: 0.9 
  });

  const windMat = new THREE.PointsMaterial({ 
    color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 
  });

  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  disposables.push(structureMat, warningMat, groundMat, windMat, arrowMat);

  // 1. 地面与轨道
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, groundMat);
  floor.position.y = -0.1;
  group.add(floor);

  const railGeo = new THREE.BoxGeometry(60, 0.2, 0.5);
  const rail1 = new THREE.Mesh(railGeo, new THREE.MeshStandardMaterial({color: 0x475569}));
  rail1.position.set(0, 0, 8);
  const rail2 = new THREE.Mesh(railGeo, new THREE.MeshStandardMaterial({color: 0x475569}));
  rail2.position.set(0, 0, -8);
  group.add(rail1, rail2);
  disposables.push(railGeo);

  // 2. 岸桥结构 (简化版 STS)
  const craneGroup = new THREE.Group();
  group.add(craneGroup);
  animatables.craneGroup = craneGroup;

  // 门腿
  const legGeo = new THREE.BoxGeometry(2, 18, 2);
  disposables.push(legGeo);
  const legFL = new THREE.Mesh(legGeo, structureMat); legFL.position.set(-5, 9, 8);
  const legFR = new THREE.Mesh(legGeo, structureMat); legFR.position.set(5, 9, 8);
  const legBL = new THREE.Mesh(legGeo, structureMat); legBL.position.set(-5, 9, -8);
  const legBR = new THREE.Mesh(legGeo, structureMat); legBR.position.set(5, 9, -8);
  craneGroup.add(legFL, legFR, legBL, legBR);

  // 联系梁
  const beamZGeo = new THREE.BoxGeometry(2, 2, 18);
  disposables.push(beamZGeo);
  const beamL = new THREE.Mesh(beamZGeo, structureMat); beamL.position.set(-5, 17, 0);
  const beamR = new THREE.Mesh(beamZGeo, structureMat); beamR.position.set(5, 17, 0);
  craneGroup.add(beamL, beamR);

  const sillBeamGeo = new THREE.BoxGeometry(2, 1, 14);
  const sillBeam = new THREE.Mesh(sillBeamGeo, structureMat);
  sillBeam.position.set(-5, 4, 0); // 门框横梁
  craneGroup.add(sillBeam);
  
  // 大梁 (Boom)
  const boomGeo = new THREE.BoxGeometry(40, 2, 3);
  disposables.push(boomGeo);
  const boom = new THREE.Mesh(boomGeo, structureMat);
  boom.position.set(10, 19, 0);
  craneGroup.add(boom);

  // 机器房
  const machHouse = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 6), structureMat);
  machHouse.position.set(-5, 22, 0);
  craneGroup.add(machHouse);

  // 3. 锚定装置 (可切换可见性)
  
  // 夹轮器 (Rail Clamps) - 在轮子附近
  const clampGroup = new THREE.Group();
  const clampGeo = new THREE.BoxGeometry(1, 0.8, 1);
  disposables.push(clampGeo);
  
  const c1 = new THREE.Mesh(clampGeo, warningMat); c1.position.set(-5, 0.5, 8);
  const c2 = new THREE.Mesh(clampGeo, warningMat); c2.position.set(5, 0.5, 8);
  const c3 = new THREE.Mesh(clampGeo, warningMat); c3.position.set(-5, 0.5, -8);
  const c4 = new THREE.Mesh(clampGeo, warningMat); c4.position.set(5, 0.5, -8);
  clampGroup.add(c1, c2, c3, c4);
  
  craneGroup.add(clampGroup); // Attached to crane
  animatables.railClamps = clampGroup;

  // 防风铁鞋 (Iron Shoes) - 楔形
  const shoeGroup = new THREE.Group();
  const shoeGeo = new THREE.ConeGeometry(0.8, 1.5, 4);
  disposables.push(shoeGeo);
  
  const s1 = new THREE.Mesh(shoeGeo, warningMat); s1.position.set(-6.5, 0.5, 8); s1.rotation.z = Math.PI/2;
  const s2 = new THREE.Mesh(shoeGeo, warningMat); s2.position.set(6.5, 0.5, -8); s2.rotation.z = -Math.PI/2;
  shoeGroup.add(s1, s2);
  
  group.add(shoeGroup); // Attached to ground/rail
  animatables.ironShoes = shoeGroup;

  // 防风拉杆 (Tie-downs) - 对角线
  const tieDownGroup = new THREE.Group();
  const tieGeo = new THREE.CylinderGeometry(0.1, 0.1, 8);
  disposables.push(tieGeo);

  // 四角拉索
  const t1 = new THREE.Mesh(tieGeo, warningMat);
  t1.position.set(-8, 3, 8); t1.rotation.z = Math.PI/4;
  const t2 = new THREE.Mesh(tieGeo, warningMat);
  t2.position.set(8, 3, 8); t2.rotation.z = -Math.PI/4;
  const t3 = new THREE.Mesh(tieGeo, warningMat);
  t3.position.set(-8, 3, -8); t3.rotation.z = Math.PI/4;
  const t4 = new THREE.Mesh(tieGeo, warningMat);
  t4.position.set(8, 3, -8); t4.rotation.z = -Math.PI/4;
  
  tieDownGroup.add(t1, t2, t3, t4);
  group.add(tieDownGroup); // Ground anchored
  animatables.tieDowns = tieDownGroup;

  // 4. 风场粒子系统
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount);

  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 60; // X
      pPos[i*3+1] = Math.random() * 30;     // Y
      pPos[i*3+2] = 20 + Math.random() * 20; // Z Start (Wind from Z)
      pSpeed[i] = 1 + Math.random();
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pSpeed, 1));
  
  const windParticles = new THREE.Points(pGeo, windMat);
  group.add(windParticles);
  animatables.windParticles = windParticles;

  // 5. 受力箭头 (Force Vectors)
  const arrowGroup = new THREE.Group();
  const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5), arrowMat);
  arrowShaft.rotation.x = Math.PI/2;
  const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(1, 2), arrowMat);
  arrowHead.rotation.x = Math.PI/2;
  arrowHead.position.z = 3.5;
  
  const forceArrow = new THREE.Group();
  forceArrow.add(arrowShaft, arrowHead);
  forceArrow.position.set(0, 20, 10);
  arrowGroup.add(forceArrow);
  
  group.add(arrowGroup);
  animatables.forceArrows = arrowGroup;
};

export const animateCraneWindScene = (
  animatables: CraneWindAnimatables, 
  state: WindLevelState,
  time: number
) => {
  // 1. 风场动画
  let windSpeed = 0.2;
  let craneSway = 0.005;
  
  if (state === 'LEVEL_1') { windSpeed = 0.5; craneSway = 0.01; }
  else if (state === 'LEVEL_2') { windSpeed = 1.0; craneSway = 0.02; }
  else if (state === 'LEVEL_3') { windSpeed = 2.0; craneSway = 0.005; } // Locked, stiff but minimal sway
  else if (state === 'FAILURE') { windSpeed = 2.5; craneSway = 0.08; } // Uncontrolled

  if (animatables.windParticles) {
      const pos = animatables.windParticles.geometry.attributes.position.array as Float32Array;
      const vel = animatables.windParticles.geometry.attributes.velocity.array as Float32Array;
      
      for(let i=0; i<pos.length/3; i++) {
          pos[i*3+2] -= vel[i] * windSpeed;
          if (pos[i*3+2] < -20) {
              pos[i*3+2] = 20 + Math.random() * 10;
          }
      }
      animatables.windParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 2. 岸桥晃动
  if (animatables.craneGroup) {
      // 台风锁定模式下，晃动应该被抑制，除非失效
      const isLocked = state === 'LEVEL_3';
      const swayFactor = isLocked ? 0.2 : 1.0;
      
      animatables.craneGroup.rotation.x = Math.sin(time * 2) * craneSway * swayFactor;
      
      if (state === 'FAILURE') {
          // Slide effect
          animatables.craneGroup.position.z = Math.sin(time * 0.5) * 2; 
      } else {
          animatables.craneGroup.position.z = 0;
      }
  }

  // 3. 装置可见性
  if (animatables.railClamps) animatables.railClamps.visible = state !== 'LEVEL_0';
  if (animatables.ironShoes) animatables.ironShoes.visible = state === 'LEVEL_2' || state === 'LEVEL_3';
  if (animatables.tieDowns) animatables.tieDowns.visible = state === 'LEVEL_3';

  // 4. 受力箭头
  if (animatables.forceArrows) {
      const s = windSpeed * 2;
      animatables.forceArrows.scale.set(s, s, s);
      animatables.forceArrows.visible = state !== 'LEVEL_0';
  }
};

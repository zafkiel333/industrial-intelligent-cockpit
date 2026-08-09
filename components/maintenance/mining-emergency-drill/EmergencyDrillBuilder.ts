
import * as THREE from 'three';
import { EmergencyDrillAnimatables, DrillStep } from './three-types';

export const initDrillScene = (
  group: THREE.Group, 
  animatables: EmergencyDrillAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const heavyMetalMat = new THREE.MeshStandardMaterial({ 
    color: 0x27272a, roughness: 0.8, metalness: 0.4 
  });
  const safetyYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.2, transmission: 0.9 
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.4 });

  disposables.push(heavyMetalMat, safetyYellow, glassMat, wireMat);

  // 1. 卷扬机主体 (Main Hoist)
  const machine = new THREE.Group();
  group.add(machine);
  animatables.mainMachine = machine;

  // 底座
  const base = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 8), heavyMetalMat);
  machine.add(base);

  // 支架
  const frameGeo = new THREE.BoxGeometry(1, 8, 1);
  const frameL = new THREE.Mesh(frameGeo, heavyMetalMat);
  frameL.position.set(-4, 4, 0);
  const frameR = new THREE.Mesh(frameGeo, heavyMetalMat);
  frameR.position.set(4, 4, 0);
  machine.add(frameL, frameR);

  // 主滚筒 (The Drum)
  const drumGeo = new THREE.CylinderGeometry(2.5, 2.5, 7, 32);
  drumGeo.rotateZ(Math.PI / 2);
  const drum = new THREE.Mesh(drumGeo, new THREE.MeshStandardMaterial({color: 0x3f3f46, metalness: 0.7}));
  drum.position.y = 6;
  machine.add(drum);
  animatables.rotatingPart = drum;

  // 滚筒纹理
  const ringGeo = new THREE.TorusGeometry(2.55, 0.05, 8, 50);
  ringGeo.rotateY(Math.PI / 2);
  for(let i=-3; i<=3; i++) {
      const ring = new THREE.Mesh(ringGeo, safetyYellow);
      ring.position.set(i, 6, 0);
      machine.add(ring);
  }

  // 2. 故障特效：电火花 (Fault Sparks)
  const sparkCount = 40;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.15, transparent: true, opacity: 0 });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.position.set(4, 6, 0); // 在右侧轴承处
  machine.add(sparks);
  animatables.faultSparks = sparks;

  // 3. 应急警戒区 (Safety Perimeter)
  const zoneGeo = new THREE.RingGeometry(8, 8.2, 64);
  zoneGeo.rotateX(-Math.PI / 2);
  const zone = new THREE.Mesh(zoneGeo, new THREE.MeshBasicMaterial({color: 0xef4444, transparent: true, opacity: 0, side: THREE.DoubleSide}));
  zone.position.y = 0.05;
  group.add(zone);
  animatables.securityZone = zone;

  // 4. 应急灯
  const emergencyLight = new THREE.PointLight(0xff0000, 0, 15);
  emergencyLight.position.set(0, 8, 0);
  group.add(emergencyLight);
  animatables.emergencyLight = emergencyLight;

  // 地面背景
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -0.5;
  group.add(grid);
};

export const animateDrill = (
  animatables: EmergencyDrillAnimatables, 
  step: DrillStep,
  time: number
) => {
  // 1. 运动逻辑
  if (animatables.rotatingPart) {
    if (step === 'STANDBY' || step === 'RESTORE_TEST') {
        const speed = step === 'RESTORE_TEST' ? 0.05 : 0.2;
        animatables.rotatingPart.rotation.x += speed;
    } else if (step === 'INCIDENT_TRIGGER') {
        // 瞬间卡死抖动
        animatables.rotatingPart.position.x = Math.sin(time * 50) * 0.02;
    }
  }

  // 2. 故障视觉表现
  const isEmergency = step === 'INCIDENT_TRIGGER' || step === 'SITE_CONTAINMENT' || step === 'RAPID_DIAGNOSIS';
  
  if (animatables.emergencyLight) {
      animatables.emergencyLight.intensity = isEmergency ? 5 + Math.sin(time * 10) * 3 : 0;
  }

  if (animatables.faultSparks) {
      const mat = animatables.faultSparks.material as THREE.PointsMaterial;
      if (step === 'INCIDENT_TRIGGER') {
          mat.opacity = 1;
          const pos = animatables.faultSparks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += (Math.random()-0.5)*0.2;
              pos[i+1] += (Math.random()-0.5)*0.2;
              pos[i+2] += (Math.random()-0.5)*0.2;
              if (Math.abs(pos[i]) > 1) { pos[i]=0; pos[i+1]=0; pos[i+2]=0; }
          }
          animatables.faultSparks.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.1);
      }
  }

  // 3. 警戒区动画
  if (animatables.securityZone) {
      const zMat = animatables.securityZone.material as THREE.MeshBasicMaterial;
      if (step === 'SITE_CONTAINMENT' || step === 'RAPID_DIAGNOSIS' || step === 'EMERGENCY_REPAIR') {
          zMat.opacity = 0.5 + Math.sin(time * 3) * 0.3;
          animatables.securityZone.scale.setScalar(1 + Math.sin(time) * 0.02);
      } else {
          zMat.opacity = THREE.MathUtils.lerp(zMat.opacity, 0, 0.1);
      }
  }
};

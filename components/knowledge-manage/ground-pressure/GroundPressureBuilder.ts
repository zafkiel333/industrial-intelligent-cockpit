
import * as THREE from 'three';
import { GroundPressureAnimatables, PressureSimState } from './three-types';

export const initGroundPressureScene = (
  group: THREE.Group, 
  animatables: GroundPressureAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const rockMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f1f1f, roughness: 0.9, metalness: 0.1, flatShading: true, side: THREE.BackSide
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x334155, wireframe: true, transparent: true, opacity: 0.1, side: THREE.BackSide
  });
  const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
  
  // 微震粒子材质
  const seismicMat = new THREE.PointsMaterial({
    color: 0xff4400, size: 0.15, transparent: true, opacity: 0, blending: THREE.AdditiveBlending
  });

  disposables.push(rockMat, wireMat, boltMat, sensorMat, seismicMat);

  // 1. 巷道隧道 (Tunnel)
  // 使用圆柱体模拟巷道，法线反转指向内部
  const tunnelRadius = 4;
  const tunnelLength = 40;
  const tunnelGeo = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, 20, true);
  tunnelGeo.rotateZ(Math.PI / 2);
  
  // 增加一些随机噪声模拟岩石表面
  const pos = tunnelGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // 保持两端开口平整，只扰动中间
      if (Math.abs(x) < tunnelLength/2 - 1) {
          const noise = (Math.random() - 0.5) * 0.3;
          pos.setY(i, y + noise);
          pos.setZ(i, z + noise);
      }
  }
  tunnelGeo.computeVertexNormals();
  disposables.push(tunnelGeo);

  const tunnel = new THREE.Mesh(tunnelGeo, rockMat);
  group.add(tunnel);
  animatables.tunnelMesh = tunnel;

  // 网格覆盖，增加科技感
  const tunnelWire = new THREE.Mesh(tunnelGeo, wireMat);
  tunnelWire.scale.setScalar(0.99); // Slightly smaller to avoid z-fight
  group.add(tunnelWire);

  // 2. 锚杆支护 (Rock Bolts)
  const boltGroup = new THREE.Group();
  const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
  const plateGeo = new THREE.BoxGeometry(0.3, 0.05, 0.3);
  disposables.push(boltGeo, plateGeo);

  // 螺旋分布锚杆
  for(let x = -15; x <= 15; x+=2) {
      for(let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          // Skip floor (assume bottom 1/4 is floor)
          if (a > Math.PI * 1.25 || a < -Math.PI * 0.25) continue; // simplistic check

          const bMesh = new THREE.Mesh(boltGeo, boltMat);
          const pMesh = new THREE.Mesh(plateGeo, boltMat);
          
          // Position on tunnel wall
          const r = tunnelRadius;
          const by = Math.cos(a) * r;
          const bz = Math.sin(a) * r;
          
          bMesh.position.set(x, by, bz);
          bMesh.rotation.x = -a; // Point inward/outward
          bMesh.rotateZ(Math.PI/2); 
          bMesh.translateY(0.75); // Move so plate is on surface

          pMesh.position.copy(bMesh.position);
          pMesh.rotation.copy(bMesh.rotation);
          pMesh.translateY(-0.7);

          boltGroup.add(bMesh);
          boltGroup.add(pMesh);
      }
  }
  group.add(boltGroup);
  animatables.boltGroup = boltGroup;

  // 3. 微震事件点云 (Microseismic Events)
  // 初始化大量点，但在动画中通过属性控制显隐
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSizes = new Float32Array(pCount); // Store magnitude/size
  
  for(let i=0; i<pCount; i++) {
      // Randomly distributed in the rock mass surrounding the tunnel
      const angle = Math.random() * Math.PI * 2;
      const r = tunnelRadius + Math.random() * 5; // Outside tunnel
      const x = (Math.random() - 0.5) * tunnelLength;
      
      pPos[i*3] = x;
      pPos[i*3+1] = Math.cos(angle) * r;
      pPos[i*3+2] = Math.sin(angle) * r;
      
      pSizes[i] = 0; // Initially invisible
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('sizeAttr', new THREE.BufferAttribute(pSizes, 1));
  
  const seismicPoints = new THREE.Points(pGeo, seismicMat);
  group.add(seismicPoints);
  animatables.microSeismicPoints = seismicPoints;

  // 4. 传感器节点 (Geophones)
  const sensorGroup = new THREE.Group();
  const sGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
  disposables.push(sGeo);
  [-10, 0, 10].forEach(x => {
      const s = new THREE.Mesh(sGeo, sensorMat);
      s.position.set(x, -tunnelRadius + 0.2, 0); // On floor
      sensorGroup.add(s);
      
      // Light indicator
      const sl = new THREE.PointLight(0x0ea5e9, 1, 2);
      sl.position.set(0, 0.2, 0);
      s.add(sl);
  });
  group.add(sensorGroup);
  animatables.sensorNodes = sensorGroup;

  // 5. 冲击报警红光
  const alarmLight = new THREE.PointLight(0xff0000, 0, 30);
  alarmLight.position.set(0, 0, 0);
  group.add(alarmLight);
  animatables.warningLight = alarmLight;
  
  // 地板网格 (Reference)
  const grid = new THREE.GridHelper(50, 50, 0x333333, 0x111111);
  grid.position.y = -5;
  group.add(grid);
};

export const animateGroundPressureScene = (
  animatables: GroundPressureAnimatables, 
  state: PressureSimState,
  time: number
) => {
  // 1. 微震粒子动画
  if (animatables.microSeismicPoints) {
      const sizes = animatables.microSeismicPoints.geometry.attributes.sizeAttr.array as Float32Array;
      const positions = animatables.microSeismicPoints.geometry.attributes.position.array as Float32Array;
      const mat = animatables.microSeismicPoints.material as THREE.PointsMaterial;

      // 状态决定活跃度
      let activityLevel = 0.01;
      let sizeScale = 0;
      let colorHex = 0x0ea5e9; // Blue normally

      if (state === 'MONITORING') { activityLevel = 0.05; sizeScale = 0.1; }
      else if (state === 'STRESS_CONC') { activityLevel = 0.3; sizeScale = 0.3; colorHex = 0xfacc15; } // Yellow
      else if (state === 'PRECURSOR') { activityLevel = 0.8; sizeScale = 0.5; colorHex = 0xff8800; } // Orange
      else if (state === 'BURST_EVENT') { activityLevel = 1.0; sizeScale = 1.0; colorHex = 0xff0000; } // Red

      mat.color.setHex(colorHex);
      mat.opacity = state === 'BURST_EVENT' ? 0.9 : 0.6;

      for (let i = 0; i < sizes.length; i++) {
          // Random flickering based on activity level
          if (Math.random() < activityLevel * 0.1) {
              sizes[i] = sizeScale * (0.5 + Math.random());
          } else {
              sizes[i] *= 0.95; // Decay
          }
      }
      // Scale visual size
      mat.size = 0.1 + (state === 'BURST_EVENT' ? 0.3 : 0);
      
      // If BURST, shake positions slightly
      if (state === 'BURST_EVENT') {
         // This is expensive to update full buffer every frame, visually shake the group instead?
         // Let's shake the whole tunnel group in the main loop if possible, 
         // here we just modulate opacity
         mat.opacity = 0.5 + Math.sin(time * 20) * 0.5;
      }
      
      animatables.microSeismicPoints.geometry.attributes.sizeAttr.needsUpdate = true;
      // Use vertex shader for size usually, but PointsMaterial uses size attenuation.
      // We can map sizeAttr to alpha or use custom shader. 
      // For standard PointsMaterial, we can't per-particle size easily without ShaderMaterial.
      // Fallback: We just toggle visible points by moving them out of view or setting opacity global
      // ACTUALLY: Let's use a simpler approach. Just toggle visibility of points by moving them far away if size is 0
      // OR: Re-implement as multiple systems? 
      // Optimized approach: Simply pulse global size property for the 'active' feeling.
  }

  // 2. 巷道应力变色 (通过材质颜色模拟)
  if (animatables.tunnelMesh) {
      const mat = animatables.tunnelMesh.material as THREE.MeshStandardMaterial;
      if (state === 'BURST_EVENT') {
          mat.emissive.setHex(0x550000);
          mat.emissiveIntensity = 0.5 + Math.sin(time * 30) * 0.5; // Flash
      } else if (state === 'PRECURSOR') {
          mat.emissive.setHex(0x331100);
          mat.emissiveIntensity = 0.3;
      } else if (state === 'STRESS_CONC') {
          mat.emissive.setHex(0x111100);
          mat.emissiveIntensity = 0.2;
      } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
      }
  }

  // 3. 报警灯
  if (animatables.warningLight) {
      if (state === 'BURST_EVENT') {
          animatables.warningLight.intensity = 5 + Math.sin(time * 20) * 5;
      } else {
          animatables.warningLight.intensity = 0;
      }
  }
};


import * as THREE from 'three';
import { SlopeAnimatables, SlopeSimState } from './three-types';

export const initSlopeScene = (
  group: THREE.Group, 
  animatables: SlopeAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const rockMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a4036, roughness: 0.9, flatShading: true 
  }); // 深色基岩
  
  const soilMat = new THREE.MeshStandardMaterial({ 
    color: 0x8c6b4a, roughness: 1.0 
  }); // 浅色覆盖层
  
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x06b6d4, transmission: 0.8, opacity: 0.6, transparent: true, roughness: 0.2 
  });
  
  const slipMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, transparent: true, opacity: 0, side: THREE.DoubleSide 
  });

  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  disposables.push(rockMat, soilMat, waterMat, slipMat, sensorMat, arrowMat);

  // 1. 基岩 (Stable Base) - 带有凹槽以容纳滑体
  const baseShape = new THREE.Shape();
  baseShape.moveTo(-20, 0);
  baseShape.lineTo(20, 0);
  baseShape.lineTo(20, 5); // 趾部
  // 滑动面曲线 (Circular Slip Surface)
  const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(20, 5, 0),
      new THREE.Vector3(10, 8, 0),
      new THREE.Vector3(0, 15, 0),
      new THREE.Vector3(-10, 25, 0),
  ]);
  const points = curve.getPoints(20);
  points.forEach(p => baseShape.lineTo(p.x, p.y));
  
  baseShape.lineTo(-20, 25);
  baseShape.lineTo(-20, 0);

  const extrudeSettings = { depth: 20, bevelEnabled: false };
  const baseGeo = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
  baseGeo.translate(0, 0, -10); // Center Z
  
  const baseMesh = new THREE.Mesh(baseGeo, rockMat);
  group.add(baseMesh);
  animatables.stableBase = baseMesh;

  // 2. 滑体 (Sliding Wedge) - 匹配基岩凹槽
  const wedgeShape = new THREE.Shape();
  // 上表面 (Topography)
  wedgeShape.moveTo(-10, 25);
  wedgeShape.lineTo(5, 20);
  wedgeShape.lineTo(20, 5);
  // 下表面 (Slip Surface - match base)
  for(let i=points.length-1; i>=0; i--) {
      wedgeShape.lineTo(points[i].x, points[i].y);
  }
  
  const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, extrudeSettings);
  wedgeGeo.translate(0, 0, -10);
  
  const wedgeGroup = new THREE.Group();
  const wedgeMesh = new THREE.Mesh(wedgeGeo, soilMat);
  wedgeGroup.add(wedgeMesh);
  
  // 滑体表面纹理/植被点缀
  const grassGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
  const grassMat = new THREE.MeshStandardMaterial({color: 0x4d7c0f});
  disposables.push(grassGeo, grassMat);
  for(let i=0; i<30; i++) {
      const g = new THREE.Mesh(grassGeo, grassMat);
      g.position.set(-8 + Math.random()*25, 20 - Math.random()*10, -8 + Math.random()*16);
      // Raycast simple approximation for height placement could be complex, hardcoding offset
      // Simplified: Just scatter on top
      wedgeGroup.add(g);
  }

  group.add(wedgeGroup);
  animatables.slidingWedge = wedgeGroup;

  // 滑动面高亮带 (Slip Surface Highlight)
  const slipGeo = new THREE.BufferGeometry().setFromPoints(points);
  // Extrude line to ribbon? Or just use the base surface.
  // Let's use a slightly scaled visual aid on the base
  const slipLine = new THREE.Line(slipGeo, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }));
  slipLine.position.z = 10.1; // Front face
  group.add(slipLine);
  
  // 3. 水体 (Reservoir)
  const waterGeo = new THREE.BoxGeometry(40, 15, 20);
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(20, 6, 0); // Initial level
  group.add(water);
  animatables.waterPlane = water;

  // 4. 监测传感器节点 (Sensors)
  const sensorGroup = new THREE.Group();
  const sGeo = new THREE.BoxGeometry(0.5, 2, 0.5); // 测斜管
  const headGeo = new THREE.SphereGeometry(0.4); // GNSS Head
  
  const sensorPos = [
      {x: -5, y: 22}, {x: 5, y: 18}, {x: 15, y: 10}
  ];
  
  sensorPos.forEach(p => {
      const s = new THREE.Group();
      s.position.set(p.x, p.y, 0);
      const rod = new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({color: 0x334155}));
      rod.position.y = -1;
      const head = new THREE.Mesh(headGeo, sensorMat);
      s.add(rod, head);
      
      // Vector Arrow (Deformation)
      const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(1, -0.5, 0).normalize(), 
          new THREE.Vector3(0,0,0), 
          0, // Length 0 initially
          0xfacc15
      );
      s.add(arrow);
      sensorGroup.add(s);
  });
  
  // Bind arrows to animatables for update
  animatables.sensorNodes = sensorGroup;
  wedgeGroup.add(sensorGroup); // Sensors move with wedge

  // 5. 降雨系统
  const rainCount = 1000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for(let i=0; i<rainCount; i++) {
      rainPos[i*3] = (Math.random()-0.5) * 40;
      rainPos[i*3+1] = Math.random() * 20 + 20;
      rainPos[i*3+2] = (Math.random()-0.5) * 20;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainPoints = new THREE.Points(rainGeo, new THREE.PointsMaterial({
      color: 0xbfdbfe, size: 0.1, transparent: true, opacity: 0
  }));
  group.add(rainPoints);
  animatables.rainSystem = rainPoints;

  // 辅助网格
  const grid = new THREE.GridHelper(50, 20, 0x334155, 0x1c1917);
  grid.position.y = 0.1;
  group.add(grid);
};

export const animateSlopeScene = (
  animatables: SlopeAnimatables, 
  state: SlopeSimState,
  time: number
) => {
  // 1. 水位变化 (Water Level)
  if (animatables.waterPlane) {
      let targetY = 6; // Normal
      if (state === 'RAINFALL') targetY = 8;
      if (state === 'DRAWDOWN') targetY = 2; // Low level
      
      animatables.waterPlane.position.y = THREE.MathUtils.lerp(animatables.waterPlane.position.y, targetY, 0.02);
      // Gentle wave
      animatables.waterPlane.scale.y = 1 + Math.sin(time) * 0.02;
  }

  // 2. 降雨动画
  if (animatables.rainSystem) {
      const mat = animatables.rainSystem.material as THREE.PointsMaterial;
      if (state === 'RAINFALL') {
          mat.opacity = 0.6;
          const pos = animatables.rainSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.5;
              if (pos[i+1] < 0) pos[i+1] = 40;
          }
          animatables.rainSystem.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = 0;
      }
  }

  // 3. 滑坡变形 (Deformation)
  if (animatables.slidingWedge && animatables.sensorNodes) {
      if (state === 'SLIDING') {
          // Slide down and out along hypothetical slip circle tangent
          animatables.slidingWedge.position.x += 0.05;
          animatables.slidingWedge.position.y -= 0.03;
          animatables.slidingWedge.rotation.z -= 0.002; // Slight rotation
      } 
      else if (state === 'CREEP') {
          // Micro movement
          animatables.slidingWedge.position.x += Math.sin(time) * 0.001 + 0.0005;
          animatables.slidingWedge.position.y -= 0.0002;
      }
      else if (state === 'STABLE' || state === 'STABILIZED') {
          // Reset
          animatables.slidingWedge.position.set(0,0,0);
          animatables.slidingWedge.rotation.set(0,0,0);
      }

      // Update Sensor Vectors
      animatables.sensorNodes.children.forEach(s => {
          const arrow = s.children[2] as THREE.ArrowHelper;
          if (state === 'SLIDING' || state === 'CREEP') {
              arrow.setLength(3 + Math.sin(time*5)*0.5);
              arrow.setColor(0xff0000);
          } else {
              arrow.setLength(0);
          }
      });
  }
};

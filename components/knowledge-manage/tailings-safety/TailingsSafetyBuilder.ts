
import * as THREE from 'three';
import { TailingsAnimatables, DamSafetyState } from './three-types';

export const initTailingsScene = (
  group: THREE.Group, 
  animatables: TailingsAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质 ---
  const damMat = new THREE.MeshStandardMaterial({ 
    color: 0x57534e, roughness: 0.9, flatShading: false 
  }); // 土石坝颜色
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x06b6d4, transmission: 0.8, opacity: 0.6, transparent: true, roughness: 0.2 
  });
  const saturatedMat = new THREE.MeshBasicMaterial({ 
    color: 0x0e7490, transparent: true, opacity: 0.4 
  }); // 饱和土颜色
  const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 });
  const markerMat = new THREE.LineBasicMaterial({ color: 0xfacc15 });
  const warningMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2, side: THREE.DoubleSide });

  disposables.push(damMat, waterMat, saturatedMat, lineMat, markerMat, warningMat);

  // 1. 坝体剖面 (Dam Cross Section)
  // 建立一个梯形坝体
  const damShape = new THREE.Shape();
  damShape.moveTo(0, 0);       // 坝底左
  damShape.lineTo(60, 0);      // 坝底右
  damShape.lineTo(45, 20);     // 坝顶右 (Crest)
  damShape.lineTo(15, 20);     // 坝顶左
  damShape.lineTo(0, 0);       // 回到原点 (Simulating upstream slope)
  
  const extrudeSettings = { depth: 5, bevelEnabled: false };
  const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
  damGeo.translate(-30, 0, -2.5); // Center visually
  disposables.push(damGeo);

  const dam = new THREE.Mesh(damGeo, damMat);
  group.add(dam);
  animatables.damSection = dam;

  // 网格辅助线覆盖在坝体上
  const edges = new THREE.EdgesGeometry(damGeo);
  const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x292524, transparent:true, opacity: 0.3 }));
  dam.add(edgeLine);
  disposables.push(edges);

  // 2. 库区水体 (Water)
  // Upstream water wedge
  const waterGeo = new THREE.BoxGeometry(40, 1, 5); // Height dynamic
  waterGeo.translate(-20, 0.5, 0); // Anchor at bottom left relative
  disposables.push(waterGeo);
  
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(-15, 0, 0); // Position at upstream slope base
  group.add(water);
  animatables.waterBody = water;

  // 3. 浸润线区域 (Saturation Zone - Dynamic Shape)
  // We use a BufferGeometry that we update every frame to show the curve
  const satGeo = new THREE.BufferGeometry();
  const maxPoints = 100;
  const positions = new Float32Array(maxPoints * 3);
  satGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Create an index for triangles to fill the area under the curve
  const indices = [];
  for(let i=0; i<maxPoints-2; i+=2) {
      indices.push(i, i+1, i+2);
      indices.push(i+1, i+3, i+2);
  }
  satGeo.setIndex(indices);
  disposables.push(satGeo);

  const saturationMesh = new THREE.Mesh(satGeo, saturatedMat);
  saturationMesh.position.set(-30, 0, 0.1); // Slightly in front
  group.add(saturationMesh);
  animatables.saturationZone = saturationMesh;

  // Phreatic Line (Top curve)
  const lineGeo = new THREE.BufferGeometry();
  // Using same position buffer logic but just the top vertices
  const phreaticLine = new THREE.Line(lineGeo, lineMat);
  phreaticLine.position.set(-30, 0, 0.2);
  group.add(phreaticLine);
  animatables.phreaticLineCurve = phreaticLine;

  // 4. 干滩长度标记 (Dry Beach Marker)
  const markerGroup = new THREE.Group();
  // Arrow line
  const arrowGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(10,0,0)]);
  const arrow = new THREE.Line(arrowGeo, markerMat);
  markerGroup.add(arrow);
  // Text placeholder (will be hud in React, but here visual anchor)
  const coneGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
  const coneL = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({color: 0xfacc15}));
  coneL.rotation.z = Math.PI/2;
  coneL.position.x = 0;
  const coneR = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({color: 0xfacc15}));
  coneR.rotation.z = -Math.PI/2;
  coneR.position.x = 10;
  markerGroup.add(coneL);
  markerGroup.add(coneR);
  
  markerGroup.position.set(-5, 16, 2.6); // On slope
  group.add(markerGroup);
  animatables.dryBeachMarker = markerGroup;

  // 5. 测压管 (Piezometers)
  const pipeGroup = new THREE.Group();
  const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 25);
  const pipeMat = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.3});
  disposables.push(pipeGeo);
  
  [-10, 0, 10].forEach(x => {
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(x, 10, 0);
      pipeGroup.add(pipe);
  });
  group.add(pipeGroup);
  animatables.sensorPipes = pipeGroup;

  // 6. Rain
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 60;
      pPos[i*3+1] = Math.random() * 30;
      pPos[i*3+2] = (Math.random()-0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const rain = new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0x93c5fd, size: 0.1, opacity: 0}));
  group.add(rain);
  animatables.rainSystem = rain;

  // Grid
  const grid = new THREE.GridHelper(100, 20, 0x1c1917, 0x1c1917);
  grid.position.y = -0.1;
  group.add(grid);
};

export const animateTailingsScene = (
  animatables: TailingsAnimatables, 
  state: DamSafetyState,
  waterLevel: number, // 0 - 20 (Height)
  time: number
) => {
  // 1. Water Level
  if (animatables.waterBody) {
      // Calculate visual height based on input waterLevel
      // Dam height is 20. 
      // Water is a box scaled. 
      animatables.waterBody.scale.y = Math.max(0.1, waterLevel);
      animatables.waterBody.position.y = waterLevel / 2;
      
      // Calculate intersection with upstream slope
      // Upstream slope: (0,0) to (15,20). Slope = 20/15 = 1.33
      // X = Y / 1.33. 
      // Origin of Dam geom is (-30, 0, 0)
      // Local x coord of intersection = waterLevel / 1.33
      // World x = -30 + waterLevel / 1.33
  }

  // 2. Saturation Line & Zone
  if (animatables.saturationZone && animatables.phreaticLineCurve) {
      // Simulate phreatic line curve: Parabola from water level intersection to toe drainage
      const damHeight = 20;
      const damBase = 60;
      const crestX = 15; // Local
      
      // Local intersection X
      const intersectX = waterLevel / (20/15); 
      
      // Update Geometry
      const posAttr = animatables.saturationZone.geometry.attributes.position;
      const lineAttr = new Float32Array(100 * 3); // For line
      
      const width = 60; // Dam base width
      const segments = 50; // Steps
      
      for(let i=0; i<segments; i++) {
          const t = i / (segments - 1);
          const x = intersectX + t * (width - intersectX); // From water contact to toe
          
          // Simplified Dupuit parabola for phreatic line: y^2 = 2qx + C
          // Or just a decay function for visual
          // Start height: waterLevel
          // End height: 0 (at x=60)
          // Add lag based on state (RISING makes it bulge up)
          
          let lag = 0;
          if (state === 'RISING') lag = Math.sin(t * Math.PI) * 2;
          if (state === 'DRAINING') lag = -Math.sin(t * Math.PI) * 2;

          let y = waterLevel * (1 - Math.pow(t, 0.8)) + lag; // Concave down mostly
          if (y < 0) y = 0;
          
          // Fill logic: Top point and Bottom point for triangle strip
          // 2 points per segment
          const idx = i * 2;
          // Bottom point (dam floor)
          posAttr.setXYZ(idx, x, 0, 2.5); // Z depth center
          // Top point (Phreatic surface)
          posAttr.setXYZ(idx+1, x, y, 2.5);

          // Line point
          lineAttr[i*3] = x - 30; // Adjust for world pos translation
          lineAttr[i*3+1] = y;
          lineAttr[i*3+2] = 2.6; // Slightly front
      }
      
      posAttr.needsUpdate = true;
      animatables.saturationZone.geometry.computeVertexNormals(); // Update lighting
      
      // Update Line Geo
      animatables.phreaticLineCurve.geometry.dispose();
      animatables.phreaticLineCurve.geometry = new THREE.BufferGeometry();
      animatables.phreaticLineCurve.geometry.setAttribute('position', new THREE.BufferAttribute(lineAttr.slice(0, segments*3), 3));
  }

  // 3. Dry Beach Marker
  if (animatables.dryBeachMarker) {
      // Dry beach = distance from water edge to crest edge
      // Crest edge X (local) = 15.
      // Water edge X (local) = waterLevel / 1.33
      const waterX = waterLevel / (20/15);
      const crestX = 15;
      
      const beachLen = Math.max(0, crestX - waterX);
      
      // World positions (Dam starts at -30)
      const wCrestX = -30 + crestX;
      const wWaterX = -30 + waterX;
      
      // Scale arrow
      const arrowLine = animatables.dryBeachMarker.children[0] as THREE.Line;
      const pos = arrowLine.geometry.attributes.position.array as Float32Array;
      // Start (Water edge) -> End (Crest)
      // Visualizer positioned at group local
      // Let's just move group to Water Edge and scale X
      animatables.dryBeachMarker.position.set(wWaterX, waterLevel + 1, 3);
      
      // Update Arrow length dynamically
      // Recreating geometry is expensive, better use scale
      // But arrow heads need to stay constant size. 
      // Here simplified: just move the right cone
      const coneL = animatables.dryBeachMarker.children[1];
      const coneR = animatables.dryBeachMarker.children[2];
      
      coneL.position.x = 0;
      coneR.position.x = beachLen;
      
      // Update line vertices
      pos[3] = beachLen; // End X
      arrowLine.geometry.attributes.position.needsUpdate = true;
      
      // Color warning
      const isDanger = beachLen < 5; // e.g., 5m threshold
      (arrowLine.material as THREE.LineBasicMaterial).color.setHex(isDanger ? 0xff0000 : 0xfacc15);
  }

  // 4. Rain
  if (animatables.rainSystem) {
      const mat = animatables.rainSystem.material as THREE.PointsMaterial;
      if (state === 'RISING' || state === 'CRITICAL') {
          mat.opacity = 0.6;
          const pos = animatables.rainSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.5;
              if (pos[i+1] < 0) pos[i+1] = 30;
          }
          animatables.rainSystem.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = 0;
      }
  }
};

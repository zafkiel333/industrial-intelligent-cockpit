
import * as THREE from 'three';
import { PilotAnimatables, NavigationScenario } from './three-types';

export const initPilotScene = (
  group: THREE.Group, 
  animatables: PilotAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x082f49, transmission: 0.9, opacity: 0.8, transparent: true, 
    roughness: 0.2, metalness: 0.1 
  });
  const shipHullMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 }); // Red hull
  const shipDeckMat = new THREE.MeshStandardMaterial({ color: 0x334155 }); // Dark deck
  const ghostMat = new THREE.MeshBasicMaterial({ 
    color: 0x10b981, transparent: true, opacity: 0.3, wireframe: true 
  });
  const buoyRedMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
  const buoyGreenMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x005500 });
  const pathLineMat = new THREE.LineDashedMaterial({ 
    color: 0x10b981, dashSize: 1, gapSize: 0.5, opacity: 0.5, transparent: true 
  });
  const vectorMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.6 });

  disposables.push(waterMat, shipHullMat, shipDeckMat, ghostMat, buoyRedMat, buoyGreenMat, pathLineMat, vectorMat);

  // 1. 水域环境 (Sea)
  const seaGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
  seaGeo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(seaGeo, waterMat);
  sea.position.y = -0.5;
  group.add(sea);

  // 海底地形网格 (Visual Aid)
  const grid = new THREE.GridHelper(200, 50, 0x1e293b, 0x0f172a);
  grid.position.y = -5;
  group.add(grid);

  // 2. 船舶模型构建函数
  const createShip = (materialHull: THREE.Material, materialDeck: THREE.Material) => {
      const sGroup = new THREE.Group();
      
      // Hull
      const hullGeo = new THREE.BoxGeometry(4, 3, 15);
      hullGeo.translate(0, 1.5, 0);
      // Taper front
      const pos = hullGeo.attributes.position;
      for(let i=0; i<pos.count; i++){
          if(pos.getZ(i) < -5) {
              pos.setX(i, pos.getX(i) * 0.5); // Narrow bow
          }
      }
      hullGeo.computeVertexNormals();
      if(materialHull instanceof THREE.MeshStandardMaterial) disposables.push(hullGeo); // Dispose geo if standard mesh
      const hull = new THREE.Mesh(hullGeo, materialHull);
      sGroup.add(hull);

      // Deck House
      const houseGeo = new THREE.BoxGeometry(3.5, 2, 4);
      houseGeo.translate(0, 4, 5);
      const house = new THREE.Mesh(houseGeo, materialDeck);
      sGroup.add(house);
      
      return sGroup;
  };

  // 本船 (Own Ship)
  const ownShip = createShip(shipHullMat, shipDeckMat);
  group.add(ownShip);
  animatables.ownShip = ownShip;

  // 螺旋桨 & 舵 (For animation details)
  const propGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
  propGeo.rotateX(Math.PI/2);
  const prop = new THREE.Mesh(propGeo, new THREE.MeshStandardMaterial({color: 0xb45309}));
  prop.position.set(0, 0, 7.5);
  ownShip.add(prop);
  animatables.propeller = prop;

  const rudderGeo = new THREE.BoxGeometry(0.2, 1.5, 1);
  const rudder = new THREE.Mesh(rudderGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  rudder.position.set(0, 0, 8.2);
  ownShip.add(rudder);
  animatables.rudder = rudder;

  // 影子船 (Ghost Ship - Expert Path)
  const ghostShip = createShip(ghostMat, ghostMat);
  ghostShip.visible = false;
  group.add(ghostShip);
  animatables.ghostShip = ghostShip;

  // 3. 航道浮标 (Buoys)
  const buoyGroup = new THREE.Group();
  const buoyGeo = new THREE.CylinderGeometry(0.3, 0.5, 2);
  
  // S-Curve Channel Layout
  for(let z = -80; z <= 80; z += 20) {
      // S-curve offset logic
      const xOffset = Math.sin(z * 0.05) * 20;
      
      // Port (Red)
      const bRed = new THREE.Mesh(buoyGeo, buoyRedMat);
      bRed.position.set(xOffset - 10, 0.5, z);
      buoyGroup.add(bRed);
      
      // Starboard (Green)
      const bGreen = new THREE.Mesh(buoyGeo, buoyGreenMat);
      bGreen.position.set(xOffset + 10, 0.5, z);
      buoyGroup.add(bGreen);
  }
  group.add(buoyGroup);
  animatables.channelBuoys = buoyGroup;

  // 4. 最优路径线 (Ideal Track)
  const pathPoints = [];
  for(let z = -80; z <= 80; z += 5) {
      const xOffset = Math.sin(z * 0.05) * 20;
      pathPoints.push(new THREE.Vector3(xOffset, 0.5, z));
  }
  const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const pathLine = new THREE.Line(pathGeo, pathLineMat);
  pathLine.computeLineDistances(); // Required for dashed line
  group.add(pathLine);
  animatables.optimalPathLine = pathLine;

  // 5. 水流矢量 (Current Vectors)
  const vectorGroup = new THREE.Group();
  const arrowGeo = new THREE.ConeGeometry(0.5, 1.5, 4);
  arrowGeo.rotateX(Math.PI/2); 
  
  for(let x=-40; x<=40; x+=10) {
      for(let z=-40; z<=40; z+=15) {
          const arrow = new THREE.Mesh(arrowGeo, vectorMat);
          arrow.position.set(x, -1, z);
          // Flow pattern: maybe a swirl or cross current
          // Let's do a cross current in the middle
          const flowAngle = Math.abs(z) < 20 ? Math.PI/4 : 0; 
          arrow.rotation.y = flowAngle;
          vectorGroup.add(arrow);
      }
  }
  group.add(vectorGroup);
  animatables.currentVectors = vectorGroup;

  // 6. 尾迹粒子 (Wake)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.5 });
  const wake = new THREE.Points(pGeo, pMat);
  group.add(wake);
  animatables.wakeParticles = wake;
};

export const animatePilotScene = (
  animatables: PilotAnimatables, 
  scenario: NavigationScenario,
  time: number
) => {
  // Scenario specific motion parameters
  const speed = 0.2;
  const pathFreq = 0.05;
  const pathAmp = 20;
  
  // Calculate position along S-curve
  // z moves from -80 to 80 roughly based on time loop
  const z = ((time * 10) % 160) - 80;
  
  // 1. Own Ship Movement (Simulate slight deviation/correction)
  if (animatables.ownShip) {
      // Ideal X
      const idealX = Math.sin(z * pathFreq) * pathAmp;
      // Ideal Angle (Derivative of sin is cos)
      const idealAngle = Math.atan(pathAmp * pathFreq * Math.cos(z * pathFreq));

      // Add "Human Error" or "Current Drift" drift
      const drift = Math.sin(time * 0.5) * 2; 
      
      animatables.ownShip.position.set(idealX + drift, 0, z);
      
      // Heading should face direction of movement
      // Tangent vector: (dx/dz, 0, 1) -> (Amp*Freq*cos(z*Freq), 0, 1)
      const dx_dz = pathAmp * pathFreq * Math.cos(z * pathFreq);
      const heading = Math.atan2(1, dx_dz); // atan2(z, x) but in 3D rotation Y, 0 is +Z usually?
      // ThreeJS rotation Y: 0 faces +Z? No, typically geometry dependent.
      // Our hull is Length along Z.
      // So rotation 0 aligns with Z.
      // We want to rotate towards the tangent vector.
      // Vector(dx, 0, dz=1). Angle = atan2(dx, dz).
      
      // Simulate yaw/rudder delay
      animatables.ownShip.rotation.y = Math.atan2(dx_dz, 1) + drift * 0.05;

      // Rudder animation
      if (animatables.rudder) {
          animatables.rudder.rotation.y = -drift * 0.2; // Counter steer
      }
      if (animatables.propeller) {
          animatables.propeller.rotation.z += 0.5;
      }
  }

  // 2. Ghost Ship (Perfect adherence)
  if (animatables.ghostShip) {
      animatables.ghostShip.visible = true;
      const idealX = Math.sin(z * pathFreq) * pathAmp;
      const dx_dz = pathAmp * pathFreq * Math.cos(z * pathFreq);
      
      animatables.ghostShip.position.set(idealX, 0, z);
      animatables.ghostShip.rotation.y = Math.atan2(dx_dz, 1);
  }

  // 3. Wake Particles
  if (animatables.wakeParticles && animatables.ownShip) {
      const positions = animatables.wakeParticles.geometry.attributes.position.array as Float32Array;
      // Emit from back of ship
      // Simple cycle buffer
      const shipPos = animatables.ownShip.position;
      const shipRot = animatables.ownShip.rotation.y;
      
      // Shift all particles back visually or re-emit?
      // Let's re-emit one particle per frame at index time%count
      const idx = Math.floor(time * 20) % (positions.length / 3);
      
      // Back of ship offset approx (0,0,-7) rotated
      const offsetZ = -7;
      const emitX = shipPos.x + Math.sin(shipRot) * offsetZ;
      const emitZ = shipPos.z + Math.cos(shipRot) * offsetZ;
      
      positions[idx*3] = emitX + (Math.random()-0.5);
      positions[idx*3+1] = 0.1;
      positions[idx*3+2] = emitZ + (Math.random()-0.5);
      
      animatables.wakeParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Current Vectors Pulse
  if (animatables.currentVectors) {
      animatables.currentVectors.children.forEach((arrow, i) => {
          arrow.scale.setScalar(0.8 + Math.sin(time * 2 + i) * 0.2);
      });
  }
};

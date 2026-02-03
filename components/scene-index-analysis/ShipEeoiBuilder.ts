
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isShipEeoiScene = (type: SceneType): boolean => {
  return type === 'ship-eeoi-analysis';
};

export const setupShipEeoiCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(-15, 8, 15);
  camera.lookAt(0, 0, 0);
};

export const initShipEeoiScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'ship-eeoi-analysis') return;

  // 1. Endless Ocean (Textured Plane)
  const seaGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = seaGeo.attributes.position;
  // Add some waves
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = Math.sin(x*0.5) * Math.cos(y*0.5) * 0.5;
    pos.setZ(i, z);
  }
  seaGeo.computeVertexNormals();
  seaGeo.rotateX(-Math.PI / 2);
  
  const seaMat = new THREE.MeshStandardMaterial({ 
    color: 0x0c4a6e, 
    roughness: 0.2, 
    metalness: 0.6,
    transparent: true,
    opacity: 0.8
  });
  disposables.push(seaGeo, seaMat);
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = -1;
  group.add(sea);
  animatables.water = sea;

  // 2. Container Ship
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.eeoiShip = shipGroup;

  // Hull
  const hullGeo = new THREE.BoxGeometry(4, 2.5, 14);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d }); // Red hull bottom
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0;
  shipGroup.add(hull);

  // Deck
  const deckGeo = new THREE.BoxGeometry(4.2, 0.5, 14.2);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 1.5;
  shipGroup.add(deck);

  // Bridge/Superstructure
  const bridgeGeo = new THREE.BoxGeometry(4, 3, 2);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bridgeGeo, bridgeMat);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 2.5, -5);
  shipGroup.add(bridge);

  // Funnel
  const funnelGeo = new THREE.CylinderGeometry(0.5, 0.5, 2);
  const funnelMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });
  disposables.push(funnelGeo, funnelMat);
  const funnel = new THREE.Mesh(funnelGeo, funnelMat);
  funnel.position.set(0, 4, -5);
  shipGroup.add(funnel);

  // Containers
  const contGeo = new THREE.BoxGeometry(0.8, 0.8, 1.8);
  const colors = [0xef4444, 0x3b82f6, 0xeab308];
  disposables.push(contGeo);
  
  for(let x=-1.2; x<=1.2; x+=1.2) {
    for(let z=-2; z<=5; z+=2) {
        for(let y=0; y<3; y++) {
            if(Math.random() > 0.2) {
                const cMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random()*3)] });
                disposables.push(cMat);
                const cont = new THREE.Mesh(contGeo, cMat);
                cont.position.set(x, 2.2 + y, z);
                shipGroup.add(cont);
            }
        }
    }
  }

  // Propeller (Visual)
  const propGeo = new THREE.BoxGeometry(0.2, 1.5, 0.1);
  const propMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
  disposables.push(propGeo, propMat);
  const prop1 = new THREE.Mesh(propGeo, propMat);
  const prop2 = new THREE.Mesh(propGeo, propMat);
  prop2.rotation.z = Math.PI / 2;
  
  const propGroup = new THREE.Group();
  propGroup.add(prop1);
  propGroup.add(prop2);
  propGroup.position.set(0, -1, -7);
  shipGroup.add(propGroup);
  
  // Actually animate a simple mesh for propeller
  animatables.eeoiPropeller = prop1; // Hack: Just store one part to rotate parent in animate loop? 
  // Better: store the group in userData or animatables
  (shipGroup as any).userData.propeller = propGroup;

  // 3. Wake Particles (Behind Ship)
  const wCount = 400;
  const wGeo = new THREE.BufferGeometry();
  const wPos = new Float32Array(wCount * 3);
  const wLife = new Float32Array(wCount);
  
  for(let i=0; i<wCount; i++) {
      wPos[i*3] = (Math.random() - 0.5) * 2; // Narrow at start
      wPos[i*3+1] = -1;
      wPos[i*3+2] = -7; // Stern
      wLife[i] = Math.random();
  }
  wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
  wGeo.setAttribute('life', new THREE.BufferAttribute(wLife, 1));
  
  const wMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(wGeo, wMat);
  const wake = new THREE.Points(wGeo, wMat);
  group.add(wake);
  animatables.eeoiWake = wake;

  // 4. Smoke Particles (Exhaust)
  const sCount = 200;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  const sLife = new Float32Array(sCount);
  
  for(let i=0; i<sCount; i++) {
      sPos[i*3] = 0;
      sPos[i*3+1] = 5; // Top of funnel
      sPos[i*3+2] = -5;
      sLife[i] = Math.random();
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('life', new THREE.BufferAttribute(sLife, 1));
  
  const sMat = new THREE.PointsMaterial({ color: 0x555555, size: 0.3, transparent: true, opacity: 0.4 });
  disposables.push(sGeo, sMat);
  const smoke = new THREE.Points(sGeo, sMat);
  shipGroup.add(smoke); // Smoke moves with ship (local coord)
  animatables.eeoiSmoke = smoke;
};

export const animateShipEeoiScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'ship-eeoi-analysis') return;

  // Get dynamic parameters from userData (injected by View)
  const shipGroup = animatables.eeoiShip;
  const speed = shipGroup?.userData?.speed || 15; // knots
  const efficiencyColor = shipGroup?.userData?.effColor || new THREE.Color(0xffffff);

  // 1. Animate Water (Simulate movement)
  if (animatables.water) {
      // Instead of moving ship forward endlessly, we move water texture backward?
      // Or just Bobbing for stationary relative view
      animatables.water.position.y = -1 + Math.sin(time) * 0.2;
      // In a real shader, we'd offset UVs
  }

  // 2. Animate Ship (Bobbing)
  if (animatables.eeoiShip) {
      animatables.eeoiShip.rotation.x = Math.sin(time * 0.8) * 0.02; // Pitch
      animatables.eeoiShip.rotation.z = Math.cos(time * 0.5) * 0.02; // Roll
      
      const propGroup = (animatables.eeoiShip as any).userData.propeller as THREE.Group;
      if (propGroup) {
          propGroup.rotation.z += speed * 0.05; // Spin prop based on speed
      }
  }

  // 3. Animate Wake
  if (animatables.eeoiWake) {
      const positions = animatables.eeoiWake.geometry.attributes.position.array as Float32Array;
      const lifes = animatables.eeoiWake.geometry.attributes.life.array as Float32Array;
      const mat = animatables.eeoiWake.material as THREE.PointsMaterial;
      
      // Color wake based on efficiency (Green/Red)
      mat.color.lerp(efficiencyColor, 0.1); 

      for(let i=0; i<lifes.length; i++) {
          lifes[i] += 0.02;
          if (lifes[i] > 1) {
              lifes[i] = 0;
              // Reset to stern
              positions[i*3] = (Math.random() - 0.5) * 2;
              positions[i*3+1] = -1;
              positions[i*3+2] = -7;
          } else {
              // Move backwards relative to ship
              positions[i*3+2] -= speed * 0.05; 
              // Spread out
              positions[i*3] += (Math.random() - 0.5) * 0.1;
          }
      }
      animatables.eeoiWake.geometry.attributes.position.needsUpdate = true;
      animatables.eeoiWake.geometry.attributes.life.needsUpdate = true;
  }

  // 4. Animate Smoke
  if (animatables.eeoiSmoke) {
    const positions = animatables.eeoiSmoke.geometry.attributes.position.array as Float32Array;
    const lifes = animatables.eeoiSmoke.geometry.attributes.life.array as Float32Array;
    
    // Smoke drifts back and up
    for(let i=0; i<lifes.length; i++) {
        lifes[i] += 0.01;
        if(lifes[i] > 1) {
            lifes[i] = 0;
            positions[i*3] = 0;
            positions[i*3+1] = 5;
            positions[i*3+2] = -5;
        } else {
            positions[i*3] += Math.sin(time + i) * 0.01; // Wind wobble
            positions[i*3+1] += 0.05; // Rise
            positions[i*3+2] -= speed * 0.02; // Drag back
        }
    }
    animatables.eeoiSmoke.geometry.attributes.position.needsUpdate = true;
    animatables.eeoiSmoke.geometry.attributes.life.needsUpdate = true;
  }
};

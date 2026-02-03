
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroGridScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(-20, 30, -20);
  group.add(dirLight);
  const gridLight = new THREE.PointLight(0xa855f7, 0.5, 40);
  gridLight.position.set(20, 10, 20);
  group.add(gridLight);

  // 2. Terrain (Dam to City)
  const terrainGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Z world
    
    // Dam side (Left/X-) is high mountains
    // City side (Right/X+) is flat
    let z = 0;
    if (x < -10) {
        z = 5 + Math.random() * 2 + Math.sin(y*0.2)*2;
        // River valley
        if (Math.abs(y) < 10) z -= 6;
    } else {
        z = 0 + Math.random() * 0.2;
    }
    
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);
  
  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e1b4b, // Deep indigo
      roughness: 0.8,
      metalness: 0.2,
      flatShading: true
  });
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.1 });
  
  disposables.push(terrainGeo, terrainMat, gridMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  const terrainWire = new THREE.Mesh(terrainGeo, gridMat);
  terrainWire.position.y = 0.05;
  group.add(terrain);
  group.add(terrainWire);

  // 3. Hydro Station (Dam)
  const damGroup = new THREE.Group();
  damGroup.position.set(-20, 0, 0);
  group.add(damGroup);
  animatables.hgDam = damGroup;

  const damGeo = new THREE.BoxGeometry(10, 12, 30);
  const damMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  damGroup.add(dam);

  // Turbines (Visual Rotors)
  animatables.hgTurbines = [];
  const turbGeo = new THREE.CylinderGeometry(2, 2, 1, 16);
  const turbMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2 });
  disposables.push(turbGeo, turbMat);
  
  [-8, 0, 8].forEach(z => {
      const t = new THREE.Mesh(turbGeo, turbMat);
      t.position.set(2, 6, z);
      damGroup.add(t);
      animatables.hgTurbines?.push(t as unknown as THREE.Group);
  });

  // Water
  const waterGeo = new THREE.PlaneGeometry(30, 40);
  waterGeo.rotateX(-Math.PI/2);
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 });
  disposables.push(waterGeo, waterMat);
  const upWater = new THREE.Mesh(waterGeo, waterMat);
  upWater.position.set(-20, 8, 0); // Behind dam
  damGroup.add(upWater);

  // 4. Transmission Lines (Dam -> City)
  const towerGeo = new THREE.CylinderGeometry(0.5, 2, 12, 4);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  disposables.push(towerGeo, towerMat);

  const towerPositions = [
      new THREE.Vector3(-15, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(15, 0, 0)
  ];
  
  towerPositions.forEach(p => {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(p.x, 6, p.z);
      group.add(t);
  });

  // Cables
  animatables.hgPowerLines = [];
  const lineMat = new THREE.LineBasicMaterial({ color: 0xfacc15, opacity: 0.5, transparent: true });
  disposables.push(lineMat);
  
  const cablePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, 12, 0), // Dam sub
      new THREE.Vector3(0, 11, 0),   // Mid tower
      new THREE.Vector3(15, 12, 0),  // City sub
      new THREE.Vector3(25, 5, 0)    // City grid
  ]);
  
  const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePath.getPoints(50));
  disposables.push(cableGeo);
  const cable = new THREE.Line(cableGeo, lineMat);
  group.add(cable);
  animatables.hgPowerLines.push(cable);

  // 5. City Grid (Load Center)
  const cityGroup = new THREE.Group();
  cityGroup.position.set(25, 0, 0);
  group.add(cityGroup);
  animatables.hgCity = cityGroup;

  // Buildings
  const buildGeo = new THREE.BoxGeometry(1, 1, 1);
  const buildMat = new THREE.MeshStandardMaterial({ color: 0x312e81, emissive: 0x1e1b4b });
  disposables.push(buildGeo, buildMat);

  for(let i=0; i<30; i++) {
      const b = new THREE.Mesh(buildGeo, buildMat);
      const h = 2 + Math.random() * 6;
      b.scale.set(2 + Math.random(), h, 2 + Math.random());
      b.position.set((Math.random()-0.5)*30, h/2, (Math.random()-0.5)*30);
      cityGroup.add(b);
  }

  // Grid Status Ring
  const ringGeo = new THREE.RingGeometry(18, 20, 64);
  ringGeo.rotateX(-Math.PI/2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  disposables.push(ringGeo, ringMat);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.2;
  cityGroup.add(ring);
  animatables.hgGridStatusRing = ring;

  // 6. Electron Flow Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pProgress = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pProgress[i] = Math.random();
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.3, transparent: true });
  disposables.push(pGeo, pMat);
  const electrons = new THREE.Points(pGeo, pMat);
  group.add(electrons);
  animatables.hgElectrons = electrons;
  
  (electrons as any).userData = { path: cablePath };

  // 7. Renewable Source (Wind/Solar) - Background
  const reGroup = new THREE.Group();
  reGroup.position.set(-10, 0, -25);
  group.add(reGroup);
  animatables.hgSolarFarm = reGroup;
  
  const solarGeo = new THREE.PlaneGeometry(2, 4);
  solarGeo.rotateX(-Math.PI/4);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
  disposables.push(solarGeo, solarMat);
  
  for(let i=0; i<20; i++) {
      const s = new THREE.Mesh(solarGeo, solarMat);
      s.position.set((Math.random()-0.5)*20, 1, (Math.random()-0.5)*10);
      reGroup.add(s);
  }
};

export const animateHydroGridDispatchScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { load: number (0-100), gen: number (0-100), freq: number (49-51), price: number }
    const loadPct = simData?.load || 50;
    const genPct = simData?.gen || 50;
    const freq = simData?.freq || 50.0;
    
    // 1. Turbines Spin
    if (animatables.hgTurbines) {
        // Spin speed proportional to generation
        const speed = genPct * 0.005;
        animatables.hgTurbines.forEach(t => t.rotation.y -= speed);
    }

    // 2. Electron Flow
    if (animatables.hgElectrons) {
        const electrons = animatables.hgElectrons;
        const positions = electrons.geometry.attributes.position.array as Float32Array;
        const progress = electrons.geometry.attributes.progress.array as Float32Array;
        const curve = (electrons as any).userData.path as THREE.CatmullRomCurve3;
        
        // Flow speed depends on load/gen
        const flowSpeed = 0.005 + (genPct / 100) * 0.01;

        for(let i=0; i<progress.length; i++) {
            progress[i] += flowSpeed;
            if (progress[i] > 1) progress[i] = 0;
            
            const pt = curve.getPoint(progress[i]);
            positions[i*3] = pt.x + (Math.random()-0.5)*0.2;
            positions[i*3+1] = pt.y + (Math.random()-0.5)*0.2;
            positions[i*3+2] = pt.z + (Math.random()-0.5)*0.2;
        }
        electrons.geometry.attributes.position.needsUpdate = true;
        electrons.geometry.attributes.progress.needsUpdate = true;
        
        // Intensity/Color based on load
        const mat = electrons.material as THREE.PointsMaterial;
        mat.size = 0.2 + (loadPct/100) * 0.3;
        if (freq < 49.8) mat.color.setHex(0xff0000); // Under freq
        else if (freq > 50.2) mat.color.setHex(0x00ff00); // Over freq
        else mat.color.setHex(0xffff00); // Normal
    }

    // 3. City Lights (Load Indicator)
    if (animatables.hgCity) {
        animatables.hgCity.children.forEach((b: any) => {
             if (b.material && b.material.emissive) {
                 b.material.emissiveIntensity = (loadPct / 100) * 1.0 + Math.sin(time*5)*0.1;
             }
        });
    }

    // 4. Grid Status Ring (Frequency Health)
    if (animatables.hgGridStatusRing) {
        const mat = animatables.hgGridStatusRing.material as THREE.MeshBasicMaterial;
        // Green if close to 50Hz, Red if deviating
        const dev = Math.abs(freq - 50.0);
        if (dev < 0.1) mat.color.setHex(0x22c55e);
        else if (dev < 0.3) mat.color.setHex(0xeab308);
        else mat.color.setHex(0xef4444);
        
        // Pulse
        animatables.hgGridStatusRing.scale.setScalar(1 + dev * 0.5 + Math.sin(time * 5) * 0.05);
    }
};

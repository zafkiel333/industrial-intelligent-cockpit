
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortTrafficFlowScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment: Ocean & Sky
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(-20, 30, -20);
  group.add(sun);
  const portLight = new THREE.PointLight(0x0ea5e9, 0.5, 60);
  portLight.position.set(0, 10, 0);
  group.add(portLight);

  // Water Surface
  const waterGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const pos = waterGeo.attributes.position;
  // Initialize wave offsets
  for(let i=0; i<pos.count; i++) {
      // Just flat initially, will animate
      pos.setY(i, 0); 
  }
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x020617, 
      roughness: 0.1, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  group.add(water);
  animatables.ptfWater = water;

  // Grid
  const grid = new THREE.GridHelper(200, 40, 0x1e3a8a, 0x0f172a);
  grid.position.y = 0.5;
  group.add(grid);

  // 2. Channel Markers (Buoys)
  animatables.ptfBuoys = [];
  const buoyGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
  const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Port side
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Starboard side
  disposables.push(buoyGeo, redMat, greenMat);

  // Channel Path: S-Curve
  const curvePoints = [];
  for(let i=0; i<=20; i++) {
      const z = -80 + i * 8;
      const x = Math.sin(i * 0.3) * 20;
      curvePoints.push(new THREE.Vector3(x, 0, z));
      
      // Place Buoys
      const buoyL = new THREE.Mesh(buoyGeo, redMat);
      buoyL.position.set(x - 8, 1, z);
      group.add(buoyL);
      animatables.ptfBuoys.push(buoyL as unknown as THREE.Group);

      const buoyR = new THREE.Mesh(buoyGeo, greenMat);
      buoyR.position.set(x + 8, 1, z);
      group.add(buoyR);
      animatables.ptfBuoys.push(buoyR as unknown as THREE.Group);
  }
  const mainChannelCurve = new THREE.CatmullRomCurve3(curvePoints);
  
  // Store curve for ships
  (group as any).userData.channelCurve = mainChannelCurve;

  // 3. Radar Tower (VTS)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(40, 0, 0); // On shore
  group.add(towerGroup);
  
  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(1, 2, 15, 4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  towerBase.position.y = 7.5;
  towerGroup.add(towerBase);
  
  const radarDish = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 }));
  radarDish.position.y = 16;
  towerGroup.add(radarDish);
  animatables.ptfRadarSweep = radarDish as unknown as THREE.Group;

  // 4. Ships Container
  animatables.ptfShips = []; // Will be populated dynamically in animate or init based on count
  // We initialize a pool of ships
  const shipPoolSize = 10;
  
  // Geometries for different ship types
  const containerGeo = new THREE.BoxGeometry(2, 1.5, 8);
  const tankerGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
  tankerGeo.rotateX(Math.PI/2);
  const bulkGeo = new THREE.BoxGeometry(2.5, 1.2, 7);

  const shipMats = [
      new THREE.MeshStandardMaterial({ color: 0x3b82f6 }), // Blue
      new THREE.MeshStandardMaterial({ color: 0xef4444 }), // Red
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })  // Orange
  ];
  disposables.push(containerGeo, tankerGeo, bulkGeo, ...shipMats);

  for(let i=0; i<shipPoolSize; i++) {
      const shipGroup = new THREE.Group();
      const type = i % 3;
      let mesh;
      if (type === 0) mesh = new THREE.Mesh(containerGeo, shipMats[0]);
      else if (type === 1) mesh = new THREE.Mesh(tankerGeo, shipMats[1]);
      else mesh = new THREE.Mesh(bulkGeo, shipMats[2]);
      
      mesh.position.y = 1;
      shipGroup.add(mesh);
      
      // Label / ID (Floating plane)
      const tagGeo = new THREE.PlaneGeometry(2, 1);
      const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.y = 3;
      tag.rotation.y = Math.PI/2; // Face camera roughly
      // shipGroup.add(tag); // Optional: add complexity

      // Wake particles
      const wakeGeo = new THREE.PlaneGeometry(1, 4);
      wakeGeo.rotateX(-Math.PI/2);
      const wakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      const wake = new THREE.Mesh(wakeGeo, wakeMat);
      wake.position.set(0, 0.1, 5); // Behind
      shipGroup.add(wake);

      group.add(shipGroup);
      
      // Init state
      shipGroup.userData = {
          active: false,
          progress: 0,
          speed: 0,
          direction: 1, // 1 = Inbound, -1 = Outbound
          laneOffset: 0
      };
      
      animatables.ptfShips.push(shipGroup);
  }

  // 5. Fog / Weather System
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 150;
      pPos[i*3+1] = Math.random() * 20;
      pPos[i*3+2] = (Math.random()-0.5) * 150;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ 
      color: 0x94a3b8, 
      size: 0.5, 
      transparent: true, 
      opacity: 0 
  }); // Initially clear
  disposables.push(pGeo, pMat);
  const fog = new THREE.Points(pGeo, pMat);
  group.add(fog);
  animatables.ptfFog = fog;
};

export const animatePortTrafficFlowScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { trafficRate: 0-100, visibility: 0-100, speedLimit: number }
    const trafficRate = simData?.trafficRate || 50;
    const visibility = simData?.visibility || 100; // 100 = Clear, 0 = Heavy Fog
    const limit = (simData?.speedLimit || 12) / 2000; // Normalize speed

    const curve = (animatables.ptfWater?.parent as any)?.userData.channelCurve as THREE.CatmullRomCurve3;

    // 1. Radar Sweep
    if (animatables.ptfRadarSweep) {
        animatables.ptfRadarSweep.rotation.y -= 0.1;
    }

    // 2. Buoys Bobbing
    if (animatables.ptfBuoys) {
        animatables.ptfBuoys.forEach((b, i) => {
            b.position.y = 1 + Math.sin(time * 2 + i) * 0.2;
            b.rotation.z = Math.sin(time + i) * 0.1;
        });
    }

    // 3. Ships Logic
    if (animatables.ptfShips && curve) {
        const ships = animatables.ptfShips;
        
        // Spawn Logic
        if (Math.random() < (trafficRate / 2000)) {
            const inactive = ships.find(s => !s.userData.active);
            if (inactive) {
                inactive.userData.active = true;
                inactive.userData.direction = Math.random() > 0.5 ? 1 : -1;
                inactive.userData.progress = inactive.userData.direction === 1 ? 0 : 1;
                inactive.userData.speed = limit * (0.8 + Math.random() * 0.4); // Var speed
                inactive.userData.laneOffset = (Math.random() - 0.5) * 4; // Lane variation within +/- 2 width
                inactive.visible = true;
            }
        }

        ships.forEach(ship => {
            if (!ship.userData.active) {
                ship.visible = false;
                ship.position.y = -100;
                return;
            }

            const data = ship.userData;
            
            // Move
            if (data.direction === 1) { // Inbound (0 -> 1)
                data.progress += data.speed;
                if (data.progress >= 1) {
                    data.active = false;
                }
            } else { // Outbound (1 -> 0)
                data.progress -= data.speed;
                if (data.progress <= 0) {
                    data.active = false;
                }
            }

            if (data.active) {
                const pt = curve.getPoint(data.progress);
                const tangent = curve.getTangent(data.progress);
                
                // Right hand rule for lane offset
                // Inbound ships keep right (offset +), Outbound keep right (offset - relative to path?)
                // Path defined -80 to 80.
                // Inbound (Z increasing) -> Right is X decreasing?
                // Tangent cross Up = Right Vector.
                const up = new THREE.Vector3(0, 1, 0);
                const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
                
                // Lane logic: Inbound (dir 1) shifts right, Outbound (dir -1) shifts right relative to their heading
                // Since path is shared, we offset perpendicular.
                // Inbound (moving along path): Shift + side
                // Outbound (moving against path): Shift - side
                const laneShift = data.direction === 1 ? 3 : -3;
                
                const finalPos = pt.clone().add(right.multiplyScalar(laneShift + data.laneOffset));
                
                ship.position.copy(finalPos);
                
                // Orientation
                const lookAtPos = finalPos.clone().add(tangent.multiplyScalar(data.direction));
                ship.lookAt(lookAtPos);
                
                // Bobbing
                ship.position.y = 0.5 + Math.sin(time * 3 + ship.id) * 0.1;
            }
        });
    }

    // 4. Fog / Weather
    if (animatables.ptfFog) {
        const opacity = (100 - visibility) / 100 * 0.8;
        (animatables.ptfFog.material as THREE.PointsMaterial).opacity = opacity;
        animatables.ptfFog.rotation.y = time * 0.05;
    }
    
    // 5. Water Waves
    if (animatables.ptfWater) {
        // Simple texture offset if we had texture, or vertex displacement
        // Here we just let it be, maybe color shift?
    }
};

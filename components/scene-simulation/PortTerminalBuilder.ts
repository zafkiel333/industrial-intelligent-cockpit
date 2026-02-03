
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortTerminalLoadingScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(20, 50, 20);
  dirLight.castShadow = true;
  group.add(dirLight);

  // Sea
  const seaGeo = new THREE.PlaneGeometry(100, 80);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshStandardMaterial({ 
      color: 0x0c4a6e, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.8 
  });
  disposables.push(seaGeo, seaMat);
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.set(-15, -0.5, 0);
  group.add(sea);

  // Quay (Dock)
  const quayGeo = new THREE.BoxGeometry(20, 2, 80);
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }); // Concrete
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(20, -1, 0); // Right side is land
  group.add(quay);

  // 2. Container Ship
  const shipGroup = new THREE.Group();
  animatables.ptlShip = shipGroup;
  
  const hullGeo = new THREE.BoxGeometry(14, 5, 60);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hull);
  
  // Bridge
  const bridgeGeo = new THREE.BoxGeometry(14, 8, 8);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bridgeGeo, bridgeMat);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 6.5, -24);
  shipGroup.add(bridge);

  shipGroup.position.set(-5, 0.5, 0); // Docked
  group.add(shipGroup);

  // Instanced Containers on Ship
  const contGeo = new THREE.BoxGeometry(2.4, 2.5, 6); // Approx TEU size scaled
  const contMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(contGeo, contMat);
  
  const iMesh = new THREE.InstancedMesh(contGeo, contMat, 400);
  const dummy = new THREE.Object3D();
  const c = new THREE.Color();
  const colors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981];
  
  let idx = 0;
  for (let x = -6; x <= 6; x += 2.5) {
      for (let z = -18; z <= 18; z += 6.5) {
          const stackHeight = 2 + Math.floor(Math.random() * 4);
          for (let y = 0; y < stackHeight; y++) {
              if (idx < 400) {
                  dummy.position.set(x, 3.8 + y * 2.5, z);
                  dummy.updateMatrix();
                  iMesh.setMatrixAt(idx, dummy.matrix);
                  iMesh.setColorAt(idx, c.setHex(colors[Math.floor(Math.random() * colors.length)]));
                  idx++;
              }
          }
      }
  }
  iMesh.instanceMatrix.needsUpdate = true;
  iMesh.instanceColor!.needsUpdate = true;
  shipGroup.add(iMesh);
  animatables.ptlContainers = iMesh;

  // 3. STS Cranes (Quay Cranes)
  animatables.ptlCranes = [];
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Orange
  const legGeo = new THREE.BoxGeometry(1.5, 20, 1.5);
  const boomGeo = new THREE.BoxGeometry(25, 1.5, 2);
  const trolleyGeo = new THREE.BoxGeometry(2, 1, 2);
  const spreadGeo = new THREE.BoxGeometry(2.5, 0.5, 6.1);
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
  
  disposables.push(craneMat, legGeo, boomGeo, trolleyGeo, spreadGeo, cableGeo);

  // Create 3 cranes
  [-15, 0, 15].forEach((zPos, i) => {
      const craneGroup = new THREE.Group();
      craneGroup.position.set(15, 0, zPos); // On quay edge
      
      // Legs (Portal)
      const l1 = new THREE.Mesh(legGeo, craneMat); l1.position.set(0, 10, 4);
      const l2 = new THREE.Mesh(legGeo, craneMat); l2.position.set(0, 10, -4);
      const l3 = new THREE.Mesh(legGeo, craneMat); l3.position.set(12, 10, 4); // Back legs
      const l4 = new THREE.Mesh(legGeo, craneMat); l4.position.set(12, 10, -4);
      // Top Girder
      const top = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 10), craneMat);
      top.position.set(6, 20, 0);

      // Boom (Extending over ship)
      const boom = new THREE.Mesh(boomGeo, craneMat);
      boom.position.set(-6, 18, 0); // Outreach
      
      craneGroup.add(l1, l2, l3, l4, top, boom);
      group.add(craneGroup);

      // Dynamic Parts
      const trolleyGroup = new THREE.Group();
      trolleyGroup.position.set(0, 18.5, 0); // Moves along X
      group.add(trolleyGroup); // Add to world to move independently of crane static parts? No, add to craneGroup better but need correct relative pos
      // Actually adding to craneGroup is better logic
      craneGroup.add(trolleyGroup);

      const trolley = new THREE.Mesh(trolleyGeo, new THREE.MeshStandardMaterial({color: 0x333}));
      trolleyGroup.add(trolley);
      
      const spreaderGroup = new THREE.Group();
      spreaderGroup.position.set(0, -5, 0); // Hanging down
      trolleyGroup.add(spreaderGroup);
      
      const spreader = new THREE.Mesh(spreadGeo, new THREE.MeshStandardMaterial({color: 0xffff00}));
      spreaderGroup.add(spreader);
      
      // Cables (Visual) - Scaled cylinder
      const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color:0x000000}));
      cable.position.y = 2.5; // Midpoint of 5m len
      cable.scale.y = 5;
      spreaderGroup.add(cable);

      // Container being lifted (Hidden by default)
      const liftCont = new THREE.Mesh(contGeo, new THREE.MeshStandardMaterial({color: 0xef4444}));
      liftCont.position.y = -1.5;
      liftCont.visible = false;
      spreaderGroup.add(liftCont);

      animatables.ptlCranes?.push({
          group: craneGroup,
          trolley: trolleyGroup,
          spreader: spreaderGroup,
          cables: cable,
          container: liftCont,
          id: i
      });
  });

  // 4. AGVs (Ground Transport)
  animatables.ptlAgvs = [];
  const agvGeo = new THREE.BoxGeometry(3, 1, 6.5);
  const agvMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
  disposables.push(agvGeo, agvMat);

  for(let i=0; i<6; i++) {
      const agv = new THREE.Mesh(agvGeo, agvMat);
      agv.position.set(22, 0.5, -25 + i * 10);
      group.add(agv);
      animatables.ptlAgvs.push(agv as unknown as THREE.Group);
      // Give them random initial states
      agv.userData = { 
          targetZ: -25 + i * 10, 
          state: 'IDLE', // IDLE, MOVE_TO_CRANE, WAIT_LOAD, MOVE_TO_YARD
          load: null // Ref to a container mesh if loaded
      };
  }
};

export const animatePortTerminalLoadingScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { activeCranes: number, speed: number }
    const activeCount = simData?.activeCranes || 3;
    const speed = simData?.speed || 1.0;

    // Crane Animation Cycle
    // 0-20: Trolley Out to Ship
    // 20-30: Lower Spreader
    // 30-40: Hoist (Pick)
    // 40-60: Trolley In to Shore
    // 60-70: Lower Spreader
    // 70-80: Hoist (Drop)
    // 80-100: Return
    
    if (animatables.ptlCranes) {
        animatables.ptlCranes.forEach((crane, i) => {
            if (i >= activeCount) return; // Idle if not active

            // Offset cycles for realism
            const t = (time * 10 * speed + i * 33) % 100;
            
            // Trolley X (Relative to crane center)
            // Ship is at x=-20 (relative to crane). Shore/AGV is at x=7.
            let targetX = 0;
            let targetY = 0; // Spreader Y (relative to trolley)
            let hasBox = false;

            if (t < 20) {
                // Out to Ship
                targetX = THREE.MathUtils.lerp(7, -20, t/20);
                targetY = -2; // Travel height
                hasBox = false;
            } else if (t < 30) {
                // Lower at Ship
                targetX = -20;
                targetY = THREE.MathUtils.lerp(-2, -12, (t-20)/10);
                hasBox = false;
            } else if (t < 40) {
                // Hoist Pick
                targetX = -20;
                targetY = THREE.MathUtils.lerp(-12, -2, (t-30)/10);
                hasBox = true;
            } else if (t < 60) {
                // In to Shore
                targetX = THREE.MathUtils.lerp(-20, 7, (t-40)/20);
                targetY = -2;
                hasBox = true;
            } else if (t < 70) {
                // Lower at Shore
                targetX = 7;
                targetY = THREE.MathUtils.lerp(-2, -10, (t-60)/10); // AGV height
                hasBox = true;
            } else if (t < 80) {
                // Hoist Drop
                targetX = 7;
                targetY = THREE.MathUtils.lerp(-10, -2, (t-70)/10);
                hasBox = false;
            } else {
                // Return
                targetX = 7; // Wait or return logic
                targetY = -2;
            }

            crane.trolley.position.x = targetX;
            crane.spreader.position.y = targetY;
            crane.cables.position.y = targetY / 2;
            crane.cables.scale.y = Math.abs(targetY);
            crane.container.visible = hasBox;
        });
    }

    // AGV Logic
    if (animatables.ptlAgvs) {
        animatables.ptlAgvs.forEach((agv, i) => {
            const data = agv.userData;
            // Simple back and forth for visual busy-ness
            // Target Z is usually aligned with a crane (0, -15, 15) or parking
            
            // Just oscillate for now to show movement
            const zBase = -25 + i * 10;
            agv.position.z = zBase + Math.sin(time * 0.5 + i) * 5;
            
            // Add a container if moving away from crane area (simulated)
            // Not fully synced with crane drop for this demo complexity
            const hasLoad = Math.sin(time * 0.5 + i) > 0;
            // Need child mesh for container to toggle visibility
            // Assuming we didn't add container to AGV in builder, let's skip visual load on AGV for now 
            // or modify builder.
        });
    }
};

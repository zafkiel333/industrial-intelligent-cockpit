
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortMultimodalScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-20, 50, 20);
  dirLight.castShadow = true;
  group.add(dirLight);

  // 2. Yard Base (Concrete)
  const groundGeo = new THREE.PlaneGeometry(80, 60);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1f2937, 
      roughness: 0.9,
      metalness: 0.1
  });
  disposables.push(groundGeo, groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.1;
  group.add(ground);

  // Road Markings (Grid overlay style)
  const grid = new THREE.GridHelper(80, 20, 0x374151, 0x374151);
  grid.position.y = 0;
  group.add(grid);

  // 3. Railway Tracks
  const trackGroup = new THREE.Group();
  group.add(trackGroup);
  
  const railGeo = new THREE.BoxGeometry(80, 0.2, 0.2);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  disposables.push(railGeo, railMat);
  
  const tieGeo = new THREE.BoxGeometry(1, 0.1, 4);
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(tieGeo, tieMat);

  // Two sets of tracks
  [-10, -5].forEach(z => {
      const rail1 = new THREE.Mesh(railGeo, railMat);
      rail1.position.set(0, 0.2, z - 0.7);
      trackGroup.add(rail1);
      
      const rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set(0, 0.2, z + 0.7);
      trackGroup.add(rail2);

      // Ties
      for(let x=-38; x<38; x+=2) {
          const tie = new THREE.Mesh(tieGeo, tieMat);
          tie.position.set(x, 0.1, z);
          trackGroup.add(tie);
      }
  });

  // 4. Train (Freight Train)
  const trainGroup = new THREE.Group();
  trainGroup.position.set(0, 0.5, -10);
  group.add(trainGroup);
  animatables.pmmTrain = trainGroup;

  const locoGeo = new THREE.BoxGeometry(4, 3, 2.5);
  const locoMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Yellow Loco
  disposables.push(locoGeo, locoMat);
  const loco = new THREE.Mesh(locoGeo, locoMat);
  loco.position.set(15, 1.5, 0); // Front
  trainGroup.add(loco);

  const wagonGeo = new THREE.BoxGeometry(10, 0.5, 2.5);
  const wagonMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(wagonGeo, wagonMat);
  
  const contGeo = new THREE.BoxGeometry(4, 2, 2);
  const contMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue Container
  disposables.push(contGeo, contMat);

  for(let i=0; i<4; i++) {
      const x = 5 - i * 11;
      const wagon = new THREE.Mesh(wagonGeo, wagonMat);
      wagon.position.set(x, 0.5, 0);
      trainGroup.add(wagon);

      // Container on wagon
      const cont = new THREE.Mesh(contGeo, contMat);
      cont.position.set(0, 1.25, 0);
      cont.scale.set(2.4, 1, 1); // 40ft equiv
      wagon.add(cont);
  }

  // 5. RMG (Rail Mounted Gantry Crane)
  const rmgGroup = new THREE.Group();
  rmgGroup.position.set(-5, 0, -2); // Center over tracks and buffer
  group.add(rmgGroup);
  animatables.pmmRmg = rmgGroup;

  const legGeo = new THREE.BoxGeometry(1, 10, 1);
  const beamGeo = new THREE.BoxGeometry(1, 1, 25);
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red
  disposables.push(legGeo, beamGeo, craneMat);

  // Legs span tracks (-10 to -5) and buffer (0 to 10)
  // Span from Z = -15 to Z = 10 (Total 25 width)
  const l1 = new THREE.Mesh(legGeo, craneMat); l1.position.set(-2, 5, -14);
  const l2 = new THREE.Mesh(legGeo, craneMat); l2.position.set(2, 5, -14);
  const l3 = new THREE.Mesh(legGeo, craneMat); l3.position.set(-2, 5, 10);
  const l4 = new THREE.Mesh(legGeo, craneMat); l4.position.set(2, 5, 10);
  rmgGroup.add(l1, l2, l3, l4);

  const beam = new THREE.Mesh(beamGeo, craneMat);
  beam.position.set(0, 10.5, -2);
  rmgGroup.add(beam);

  // Trolley
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, 10, -10); // Start over train
  rmgGroup.add(trolleyGroup);
  animatables.pmmRmgTrolley = trolleyGroup;

  const cabGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(cabGeo, cabMat);
  const trolleyCab = new THREE.Mesh(cabGeo, cabMat);
  trolleyGroup.add(trolleyCab);

  // Spreader / Cables
  const spreadGeo = new THREE.BoxGeometry(2.5, 0.5, 1.5);
  const spread = new THREE.Mesh(spreadGeo, new THREE.MeshStandardMaterial({color: 0xffff00}));
  spread.position.y = -4; // Hanging
  trolleyGroup.add(spread);
  
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 4);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
  cable.position.y = -2;
  trolleyGroup.add(cable);

  // 6. Container Stack (Buffer)
  const stackGeo = new THREE.BoxGeometry(2, 2, 5); // 20ft container scaled
  const stackMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // Green
  disposables.push(stackGeo, stackMat);

  const iMesh = new THREE.InstancedMesh(stackGeo, stackMat, 100);
  const dummy = new THREE.Object3D();
  let idx = 0;
  // Stack area: X: -30 to 30, Z: 2 to 8
  for (let x = -30; x < 30; x += 3) {
      for (let z = 2; z < 8; z += 3) {
          const h = Math.floor(Math.random() * 4); // 0 to 3 high
          for (let y = 0; y < h; y++) {
              dummy.position.set(x, 1 + y * 2, z);
              dummy.updateMatrix();
              iMesh.setMatrixAt(idx++, dummy.matrix);
          }
      }
  }
  iMesh.instanceMatrix.needsUpdate = true;
  group.add(iMesh);
  animatables.pmmContainers = iMesh;

  // 7. Trucks (Looping Path)
  animatables.pmmTrucks = [];
  const truckGeo = new THREE.BoxGeometry(2, 1, 4);
  const truckMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(truckGeo, truckMat);

  // Path: Enter gate (-35, 15) -> Drive along stack -> Turn -> Exit
  const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-40, 0, 15),
      new THREE.Vector3(-20, 0, 15),
      new THREE.Vector3(20, 0, 15),
      new THREE.Vector3(35, 0, 15),
      new THREE.Vector3(35, 0, 20), // Turn around loop? 
      new THREE.Vector3(20, 0, 20),
      new THREE.Vector3(-40, 0, 20)
  ], false);

  for(let i=0; i<5; i++) {
      const tGroup = new THREE.Group();
      const body = new THREE.Mesh(truckGeo, truckMat);
      body.position.y = 1;
      tGroup.add(body);
      group.add(tGroup);
      
      animatables.pmmTrucks.push({
          mesh: tGroup,
          path: roadCurve,
          t: i * 0.15,
          speed: 0.001 + Math.random() * 0.001,
          id: i
      });
  }

  // 8. Gates (Traffic Lights)
  animatables.pmmTrafficLights = [];
  const gateStructGeo = new THREE.BoxGeometry(1, 4, 10);
  const gateStructMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(gateStructGeo, gateStructMat);

  const gateStruct = new THREE.Mesh(gateStructGeo, gateStructMat);
  gateStruct.position.set(-30, 2, 17.5); // Spanning in/out lanes
  group.add(gateStruct);

  const lightGeo = new THREE.SphereGeometry(0.3);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  disposables.push(lightGeo, lightMat);
  
  const light1 = new THREE.Mesh(lightGeo, lightMat.clone());
  light1.position.set(-29, 3, 15); // Inbound lane light
  group.add(light1);
  animatables.pmmTrafficLights.push(light1 as unknown as THREE.Group);

  const light2 = new THREE.Mesh(lightGeo, lightMat.clone());
  light2.position.set(-29, 3, 20); // Outbound lane light
  group.add(light2);
  animatables.pmmTrafficLights.push(light2 as unknown as THREE.Group);

};

export const animatePortMultimodalScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { truckRate: number, trainActive: boolean }
    const trainActive = simData?.trainActive || false;
    const truckSpeedFactor = (simData?.truckRate || 50) / 50;

    // 1. Train Movement
    if (animatables.pmmTrain) {
        if (trainActive) {
            // Move back and forth or through
            const tPos = (Math.sin(time * 0.2) * 30);
            animatables.pmmTrain.position.x = tPos;
        }
    }

    // 2. RMG Crane Operation
    if (animatables.pmmRmg && animatables.pmmRmgTrolley) {
        // Gantry Move (X)
        animatables.pmmRmg.position.x = Math.sin(time * 0.5) * 15;
        
        // Trolley Move (Z) - Between Rail (-10) and Stack (5)
        const trolleyZ = -2.5 + Math.sin(time * 1.5) * 7.5; 
        animatables.pmmRmgTrolley.position.z = trolleyZ;

        // Hoist (Y) - Bobbing
        const spreader = animatables.pmmRmgTrolley.children[1];
        spreader.position.y = -4 + Math.abs(Math.sin(time * 3)) * 2;
        // Cable scale
        const cable = animatables.pmmRmgTrolley.children[2];
        cable.scale.y = 4 - Math.abs(Math.sin(time * 3)) * 2;
        cable.position.y = (-4 + Math.abs(Math.sin(time * 3)) * 2) / 2;
    }

    // 3. Trucks
    if (animatables.pmmTrucks) {
        animatables.pmmTrucks.forEach(t => {
            t.t += t.speed * truckSpeedFactor;
            if (t.t > 1) t.t = 0;
            
            const pos = t.path.getPoint(t.t);
            const tangent = t.path.getTangent(t.t);
            
            t.mesh.position.copy(pos);
            t.mesh.lookAt(pos.clone().add(tangent));
        });
    }

    // 4. Traffic Lights Blink
    if (animatables.pmmTrafficLights) {
        animatables.pmmTrafficLights.forEach((l, i) => {
            const blink = Math.sin(time * 5 + i) > 0;
            (l as unknown as THREE.Mesh).material.opacity = blink ? 1 : 0.3;
        });
    }
};


import * as THREE from 'three';
import { GeoAnimatables } from './three-types';

export const initTransportScene = (
  scene: THREE.Scene, 
  animatables: GeoAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting & Environment
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);
  const orangeLight = new THREE.PointLight(0xf97316, 2, 20);
  orangeLight.position.set(0, 5, 0);
  scene.add(orangeLight);

  // 2. Headframe (Tower)
  const structureMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.7, 
    metalness: 0.5 
  });
  disposables.push(structureMat);

  const towerGroup = new THREE.Group();
  
  // Legs
  const legGeo = new THREE.BoxGeometry(1, 20, 1);
  disposables.push(legGeo);
  const leg1 = new THREE.Mesh(legGeo, structureMat); leg1.position.set(-3, 10, 3);
  const leg2 = new THREE.Mesh(legGeo, structureMat); leg2.position.set(3, 10, 3);
  const leg3 = new THREE.Mesh(legGeo, structureMat); leg3.position.set(-3, 10, -3);
  const leg4 = new THREE.Mesh(legGeo, structureMat); leg4.position.set(3, 10, -3);
  
  // Brace
  const braceGeo = new THREE.BoxGeometry(7, 1, 7);
  disposables.push(braceGeo);
  const braceTop = new THREE.Mesh(braceGeo, structureMat); braceTop.position.y = 20;

  towerGroup.add(leg1, leg2, leg3, leg4, braceTop);
  scene.add(towerGroup);

  // 3. Sheaves (Rotating Wheels)
  animatables.mtdHoistSheaves = [];
  const sheaveGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
  sheaveGeo.rotateZ(Math.PI / 2);
  const sheaveMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(sheaveGeo, sheaveMat);

  const sheave1 = new THREE.Mesh(sheaveGeo, sheaveMat);
  sheave1.position.set(-1, 21, 0);
  towerGroup.add(sheave1);
  animatables.mtdHoistSheaves.push(sheave1 as unknown as THREE.Group);

  const sheave2 = new THREE.Mesh(sheaveGeo, sheaveMat);
  sheave2.position.set(1, 21, 0);
  towerGroup.add(sheave2);
  animatables.mtdHoistSheaves.push(sheave2 as unknown as THREE.Group);

  // 4. Skip/Cage (Moving Vertical)
  const skipGroup = new THREE.Group();
  const skipGeo = new THREE.BoxGeometry(2, 3, 2);
  const skipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, wireframe: true }); // Yellow cage
  disposables.push(skipGeo, skipMat);
  
  const skipMesh = new THREE.Mesh(skipGeo, skipMat);
  skipGroup.add(skipMesh);
  
  // Ropes
  const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, 40);
  const ropeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  disposables.push(ropeGeo, ropeMat);
  const rope = new THREE.Mesh(ropeGeo, ropeMat);
  rope.position.y = 20;
  skipGroup.add(rope);

  scene.add(skipGroup);
  animatables.mtdSkip = skipGroup;

  // 5. Conveyor Belt (Surface)
  const beltPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), // At shaft
      new THREE.Vector3(0, 0, 8),
      new THREE.Vector3(8, 2, 12),
      new THREE.Vector3(15, 2, 12)
  ]);
  const beltGeo = new THREE.TubeGeometry(beltPath, 64, 0.5, 8, false);
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  disposables.push(beltGeo, beltMat);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  scene.add(belt);
  animatables.mtdConveyorBelt = belt;

  // Flow Particles
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pTime = new Float32Array(pCount); // 0-1 progress
  
  for(let i=0; i<pCount; i++) {
      pTime[i] = Math.random();
      const pt = beltPath.getPoint(pTime[i]);
      pPos[i*3] = pt.x + (Math.random()-0.5)*0.3;
      pPos[i*3+1] = pt.y + 0.3; // On top of belt
      pPos[i*3+2] = pt.z + (Math.random()-0.5)*0.3;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('time', new THREE.BufferAttribute(pTime, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  scene.add(flow);
  animatables.mtdConveyorFlow = flow;
  // Store curve
  (flow as any).userData = { curve: beltPath };

  // 6. Trucks (Haulage)
  animatables.mtdTrucks = [];
  const truckGeo = new THREE.BoxGeometry(1.5, 1, 3);
  const truckMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(truckGeo, truckMat);
  
  const roadPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(12, 0, 10),
      new THREE.Vector3(20, 0, 10),
      new THREE.Vector3(20, 0, -5),
      new THREE.Vector3(12, 0, -5)
  ], true);

  for(let i=0; i<3; i++) {
      const truck = new THREE.Group();
      const body = new THREE.Mesh(truckGeo, truckMat);
      body.position.y = 0.5;
      truck.add(body);
      scene.add(truck);
      
      animatables.mtdTrucks.push({
          mesh: truck,
          path: roadPath,
          t: i * 0.33,
          speed: 0.002
      });
  }

  // 7. Grid Floor
  const grid = new THREE.GridHelper(50, 50, 0xf97316, 0x1e293b);
  grid.position.y = -0.1;
  scene.add(grid);
};

export const animateTransportScene = (animatables: GeoAnimatables, time: number) => {
    // 1. Hoist Animation
    if (animatables.mtdHoistSheaves && animatables.mtdSkip) {
        // Spin sheaves
        const hoistSpeed = Math.sin(time * 0.5); // Cycle up/down
        animatables.mtdHoistSheaves.forEach(s => s.rotation.x -= hoistSpeed * 0.1);
        
        // Move skip (-10 to 15)
        animatables.mtdSkip.position.y = Math.sin(time * 0.5) * 12 + 2;
    }

    // 2. Conveyor Flow
    if (animatables.mtdConveyorFlow) {
        const parts = animatables.mtdConveyorFlow;
        const curve = (parts as any).userData.curve as THREE.CatmullRomCurve3;
        const positions = parts.geometry.attributes.position.array as Float32Array;
        const times = parts.geometry.attributes.time.array as Float32Array;

        for(let i=0; i<times.length; i++) {
            times[i] += 0.005;
            if (times[i] > 1) times[i] = 0;
            
            const pt = curve.getPoint(times[i]);
            positions[i*3] = pt.x + (Math.random()-0.5)*0.3;
            positions[i*3+1] = pt.y + 0.3;
            positions[i*3+2] = pt.z + (Math.random()-0.5)*0.3;
        }
        parts.geometry.attributes.position.needsUpdate = true;
        parts.geometry.attributes.time.needsUpdate = true;
    }

    // 3. Truck Movement
    if (animatables.mtdTrucks) {
        animatables.mtdTrucks.forEach(truck => {
            truck.t = (truck.t + truck.speed) % 1;
            const pos = truck.path.getPoint(truck.t);
            const tangent = truck.path.getTangent(truck.t);
            truck.mesh.position.copy(pos);
            truck.mesh.lookAt(pos.clone().add(tangent));
        });
    }
};

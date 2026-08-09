
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isContainerTerminalScene = (type: SceneType): boolean => {
  return type === 'container-terminal';
};

export const setupContainerTerminalCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initContainerTerminalScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'container-terminal') return;

  // 1. Environment Base (Sea & Quay)
  const seaGeo = new THREE.PlaneGeometry(50, 50);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Dark Ocean
  disposables.push(seaGeo, seaMat);
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = -2;
  group.add(sea);

  const quayGeo = new THREE.BoxGeometry(30, 2, 40);
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }); // Concrete
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(5, -1, 0); // Offset to allow water on left
  group.add(quay);

  // 2. Container Ship (Along Quay)
  const shipGroup = new THREE.Group();
  shipGroup.position.set(-8, 0, 0); // In water
  
  const hullGeo = new THREE.BoxGeometry(6, 3, 25);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d }); // Dark Red Hull
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hull);

  const deckGeo = new THREE.BoxGeometry(7, 0.5, 26);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 1.5;
  shipGroup.add(deck);

  // Ship Containers
  const contColors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981, 0x64748b];
  const contGeo = new THREE.BoxGeometry(1, 1, 2);
  disposables.push(contGeo);
  
  for(let x=-2; x<=2; x+=1.2) {
      for(let z=-10; z<=10; z+=2.2) {
          for(let y=0; y<3; y++) {
              if (Math.random() > 0.8) continue; // Random gaps
              const mat = new THREE.MeshStandardMaterial({ color: contColors[Math.floor(Math.random()*contColors.length)] });
              disposables.push(mat);
              const c = new THREE.Mesh(contGeo, mat);
              c.position.set(x, 2.2 + y, z);
              shipGroup.add(c);
          }
      }
  }
  group.add(shipGroup);

  // 3. STS Cranes
  animatables.stsCranes = [];
  const cranePositions = [-8, 0, 8];
  
  const legGeo = new THREE.BoxGeometry(1, 12, 1);
  const boomGeo = new THREE.BoxGeometry(18, 1, 1);
  const trolleyGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
  disposables.push(legGeo, boomGeo, trolleyGeo);
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Safety Orange
  disposables.push(craneMat);

  cranePositions.forEach(z => {
      const craneGroup = new THREE.Group();
      craneGroup.position.set(0, 0, z);

      // Legs (Portal)
      const leg1 = new THREE.Mesh(legGeo, craneMat);
      leg1.position.set(2, 6, 2);
      craneGroup.add(leg1);
      const leg2 = new THREE.Mesh(legGeo, craneMat);
      leg2.position.set(2, 6, -2);
      craneGroup.add(leg2);
      const leg3 = new THREE.Mesh(legGeo, craneMat); // Landside
      leg3.position.set(10, 6, 2);
      craneGroup.add(leg3);
      const leg4 = new THREE.Mesh(legGeo, craneMat);
      leg4.position.set(10, 6, -2);
      craneGroup.add(leg4);

      // Boom
      const boom = new THREE.Mesh(boomGeo, craneMat);
      boom.position.set(-2, 11, 0); // Overhang ship
      craneGroup.add(boom);

      // Trolley
      const trolley = new THREE.Mesh(trolleyGeo, new THREE.MeshStandardMaterial({ color: 0x333 }));
      trolley.position.set(-6, 10.5, 0); // Start pos
      craneGroup.add(trolley);

      // Hook/Spreader & Cables
      const hook = new THREE.Mesh(contGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 })); // Simulate container being lifted
      hook.position.set(0, -4, 0); // Relative to trolley
      trolley.add(hook);

      const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 4);
      const cableMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.y = -2;
      trolley.add(cable);

      group.add(craneGroup);
      
      if (!animatables.stsCranes) animatables.stsCranes = [];
      animatables.stsCranes.push({ trolley, hook, cable });
  });

  // 4. AGVs (Moving on Quay)
  animatables.agvs = [];
  const agvGeo = new THREE.BoxGeometry(2, 0.5, 4);
  const agvMat = new THREE.MeshStandardMaterial({ color: 0x22c55e }); // Green AGVs
  disposables.push(agvGeo, agvMat);

  for(let i=0; i<6; i++) {
      const agv = new THREE.Mesh(agvGeo, agvMat);
      const container = new THREE.Mesh(contGeo, new THREE.MeshStandardMaterial({ color: contColors[i % contColors.length] }));
      container.position.y = 0.8;
      container.scale.set(1.5, 1, 1.5);
      agv.add(container);
      
      group.add(agv);
      if (!animatables.agvs) animatables.agvs = [];
      animatables.agvs.push({ 
          mesh: agv as unknown as THREE.Group, 
          pathOffset: i * (100 / 6), 
          speed: 0.2 + Math.random() * 0.1 
      });
  }

  // 5. Yard Stacks (Background)
  const yardGroup = new THREE.Group();
  yardGroup.position.set(12, 0, 0);
  
  for(let x=0; x<3; x++) {
      for(let z=-12; z<=12; z+=2.5) {
          const height = Math.floor(Math.random() * 5);
          for(let h=0; h<height; h++) {
              const mat = new THREE.MeshStandardMaterial({ color: contColors[Math.floor(Math.random()*contColors.length)] });
              disposables.push(mat);
              const c = new THREE.Mesh(contGeo, mat);
              c.position.set(x * 2.5, 0.5 + h, z);
              yardGroup.add(c);
          }
      }
  }
  group.add(yardGroup);
};

export const animateContainerTerminalScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'container-terminal') return;

  // STS Crane Animation
  if (animatables.stsCranes) {
      animatables.stsCranes.forEach((crane, i) => {
          // Cycle: Move trolley out -> Lower hook -> Raise hook -> Move trolley in -> Lower hook -> Raise
          const cycle = (time * 0.5 + i * 2) % 10; 
          
          // Trolley Movement (X axis local)
          // Range: -8 (Ship) to 4 (AGV Lane)
          if (cycle < 4) {
              // Move Out
              crane.trolley.position.x = 4 - (cycle/4) * 12;
          } else if (cycle < 5) {
              // Dwell over ship
              crane.trolley.position.x = -8;
          } else if (cycle < 9) {
              // Move In
              crane.trolley.position.x = -8 + ((cycle-5)/4) * 12;
          } else {
              // Dwell over AGV
              crane.trolley.position.x = 4;
          }

          // Hoist Movement (Y axis local)
          // Base Y is 10.5. Drop to 2 (Ship) or 2 (AGV)
          let hoistLen = 1;
          if (cycle > 3.5 && cycle < 5.5) {
              // At Ship: Dip down
              const subPhase = (cycle - 3.5) * Math.PI; // 0 to 2PI
              hoistLen = 1 + Math.sin(subPhase) * 6;
          } else if (cycle > 8.5 || cycle < 0.5) {
              // At AGV: Dip down
              // Wrap around logic is complex, simplify:
              if (cycle > 8.5) {
                  const subPhase = (cycle - 8.5) * Math.PI;
                  hoistLen = 1 + Math.sin(subPhase) * 6;
              }
          }

          crane.hook.position.y = -hoistLen;
          crane.cable.position.y = -hoistLen / 2;
          crane.cable.scale.y = hoistLen * 2; // Stretch cable
      });
  }

  // AGV Animation (Loop path)
  if (animatables.agvs) {
      animatables.agvs.forEach(agv => {
          // Simple rectangular path: (4, z) -> (8, z) -> loop
          let t = (time * agv.speed + agv.pathOffset) % 100;
          
          // Path definition
          // 0-40: Move Z+ at X=4 (Under Crane)
          // 40-50: Move X+ to 8
          // 50-90: Move Z- at X=8 (Return lane)
          // 90-100: Move X- to 4
          
          if (t < 40) {
              agv.mesh.position.set(4, 0.5, -15 + (t/40)*30);
              agv.mesh.rotation.y = 0;
          } else if (t < 50) {
              agv.mesh.position.set(4 + ((t-40)/10)*4, 0.5, 15);
              agv.mesh.rotation.y = -Math.PI/2;
          } else if (t < 90) {
              agv.mesh.position.set(8, 0.5, 15 - ((t-50)/40)*30);
              agv.mesh.rotation.y = Math.PI;
          } else {
              agv.mesh.position.set(8 - ((t-90)/10)*4, 0.5, -15);
              agv.mesh.rotation.y = Math.PI/2;
          }
      });
  }
};


import * as THREE from 'three';
import { TransformerAnimatables } from './three-types';

export const initTransformerScene = (
  group: THREE.Group, 
  animatables: TransformerAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.6 }); // Industrial Grey
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2, metalness: 0.1 }); // Brown Porcelain
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 }); // Copper
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.7 });
  const oilMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf59e0b, transmission: 0.6, opacity: 0.8, transparent: true, roughness: 0.1 
  });
  const hazardMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });

  disposables.push(tankMat, porcelainMat, copperMat, steelMat, oilMat, hazardMat);

  // 1. Main Tank Body
  const tankGeo = new THREE.BoxGeometry(6, 5, 4);
  disposables.push(tankGeo);
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.y = 2.5;
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);
  animatables.mainTank = tank;

  // 2. HV Bushings (High Voltage - Large)
  const hvGroup = new THREE.Group();
  const bushingGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 16);
  // Add ribs to look like porcelain insulators
  disposables.push(bushingGeo);
  
  [-1.5, 0, 1.5].forEach(x => {
      const bushing = new THREE.Mesh(bushingGeo, porcelainMat);
      bushing.position.set(x, 6.5, 1);
      
      // Terminal on top
      const termGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
      const term = new THREE.Mesh(termGeo, steelMat);
      term.position.y = 1.75;
      bushing.add(term);
      
      hvGroup.add(bushing);
  });
  group.add(hvGroup);
  animatables.hvBushings = hvGroup;

  // 3. LV Bushings (Low Voltage - Smaller)
  const lvGroup = new THREE.Group();
  const lvBushingGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 16);
  disposables.push(lvBushingGeo);
  
  [-1, 0, 1].forEach(x => {
      const bushing = new THREE.Mesh(lvBushingGeo, porcelainMat);
      bushing.position.set(x, 5.75, -1.2);
      lvGroup.add(bushing);
  });
  group.add(lvGroup);
  animatables.lvBushings = lvGroup;

  // 4. Conservator (Oil Tank)
  const consGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
  consGeo.rotateZ(Math.PI / 2);
  disposables.push(consGeo);
  const conservator = new THREE.Mesh(consGeo, tankMat);
  conservator.position.set(0, 6, -2.5);
  group.add(conservator);
  animatables.conservator = conservator;

  // Pipe connecting conservator
  const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5);
  pipeGeo.rotateX(Math.PI/4);
  const pipe = new THREE.Mesh(pipeGeo, steelMat);
  pipe.position.set(0, 5.5, -1.5);
  group.add(pipe);

  // 5. Radiators (Cooling Fins)
  animatables.coolingFans = [];
  const radGeo = new THREE.BoxGeometry(0.5, 3, 2);
  const fanBladeGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  disposables.push(radGeo, fanBladeGeo);

  [-3.2, 3.2].forEach((x, idx) => {
      const radGroup = new THREE.Group();
      radGroup.position.set(x, 2.5, 0);
      
      // Fin block
      const rad = new THREE.Mesh(radGeo, steelMat);
      radGroup.add(rad);

      // Fans
      [0.5, -0.5].forEach(z => {
          const fanGroup = new THREE.Group();
          fanGroup.position.set(x > 0 ? 0.3 : -0.3, 0, z);
          fanGroup.rotation.z = Math.PI / 2;
          
          const blade1 = new THREE.Mesh(fanBladeGeo, steelMat);
          const blade2 = new THREE.Mesh(fanBladeGeo, steelMat);
          blade2.rotation.x = Math.PI / 2;
          
          fanGroup.add(blade1);
          fanGroup.add(blade2);
          
          // Cage
          const cage = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.45, 16), steelMat);
          fanGroup.add(cage);

          radGroup.add(fanGroup);
          animatables.coolingFans?.push(fanGroup);
      });

      group.add(radGroup);
  });

  // 6. Internal Core (Hidden by default, used for Lift Core animation)
  const coreGroup = new THREE.Group();
  const ironCoreGeo = new THREE.BoxGeometry(4, 3.5, 1);
  const ironCore = new THREE.Mesh(ironCoreGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  coreGroup.add(ironCore);
  
  // Windings
  const windingGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
  [-1.2, 0, 1.2].forEach(x => {
      const winding = new THREE.Mesh(windingGeo, copperMat);
      winding.position.x = x;
      coreGroup.add(winding);
  });
  
  coreGroup.position.set(0, 2.5, 0);
  coreGroup.visible = false; // Hidden initially
  group.add(coreGroup);
  animatables.coreAssembly = coreGroup;

  // 7. Fault Arcs (Hidden by default)
  const arcGroup = new THREE.Group();
  // Create jagged lines
  for(let i=0; i<5; i++) {
      const pts = [];
      let cy = 0;
      for(let j=0; j<10; j++) {
          pts.push(new THREE.Vector3((Math.random()-0.5)*0.5, cy, (Math.random()-0.5)*0.5));
          cy += 0.3;
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00ffff }));
      arcGroup.add(line);
  }
  arcGroup.position.set(0, 3, 0); // Inside tank
  arcGroup.visible = false;
  group.add(arcGroup);
  animatables.arcs = arcGroup;

  // Floor
  const floorGeo = new THREE.CircleGeometry(10, 32);
  floorGeo.rotateX(-Math.PI/2);
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  group.add(floor);
};

export const animateTransformerScene = (
  animatables: TransformerAnimatables, 
  phase: string,
  time: number,
  isHeatmapMode: boolean
) => {
  // 1. Fan Animation
  if (animatables.coolingFans && phase === 'MONITORING') {
      animatables.coolingFans.forEach((fan, i) => {
          fan.rotation.x += 0.2 + (i % 2) * 0.05;
      });
  }

  // 2. Fault Simulation (Monitoring phase with issue)
  if (phase === 'MONITORING' && animatables.arcs) {
      // Simulate internal arcing flash
      animatables.arcs.visible = Math.random() > 0.9;
      animatables.arcs.rotation.y = Math.random() * Math.PI;
  } else if (animatables.arcs) {
      animatables.arcs.visible = false;
  }

  // 3. Lift Core Animation
  if (animatables.coreAssembly && animatables.mainTank) {
      if (phase === 'LIFT_CORE') {
          animatables.mainTank.material.opacity = 0.3;
          animatables.mainTank.material.transparent = true;
          animatables.mainTank.material.needsUpdate = true;
          
          animatables.coreAssembly.visible = true;
          // Bobbing animation to simulate crane holding it
          const liftHeight = 6;
          // Smooth lift
          const targetY = 2.5 + liftHeight;
          animatables.coreAssembly.position.y = 2.5 + Math.sin(time) * 0.2 + liftHeight;
      } else if (phase === 'REPAIR') {
          animatables.coreAssembly.visible = true;
          animatables.coreAssembly.position.y = 2.5; // Back in tank but visible? Or on stand?
          // Let's keep it lifted for repair visualization
          animatables.coreAssembly.position.y = 4; 
          animatables.coreAssembly.rotation.y = time * 0.2; // Inspect
      } else {
          // Reset
          animatables.coreAssembly.visible = false;
          animatables.mainTank.material.opacity = 1.0;
          animatables.mainTank.material.transparent = false;
      }
  }

  // 4. Heatmap Mode (Material Manipulation)
  if (animatables.mainTank) {
      const mat = animatables.mainTank.material as THREE.MeshStandardMaterial;
      if (isHeatmapMode) {
          mat.emissive.setHex(0xef4444); // Red glow
          mat.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2; // Pulsing heat
      } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
      }
  }
};

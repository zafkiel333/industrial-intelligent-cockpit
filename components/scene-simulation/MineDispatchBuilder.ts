
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineDispatchScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Terrain: Pit + Processing Area
  const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
  const pos = groundGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Z in world
      // Pit in center
      const dist = Math.sqrt(x*x + y*y);
      let z = 0;
      if (dist < 20) {
          z = -10 + dist * 0.5;
          // Bench steps
          z = Math.floor(z / 2) * 2;
      }
      pos.setZ(i, z);
  }
  groundGeo.computeVertexNormals();
  groundGeo.rotateX(-Math.PI / 2);

  const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      flatShading: true,
      wireframe: false
  });
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.1 });
  
  disposables.push(groundGeo, groundMat, gridMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  const groundGrid = new THREE.Mesh(groundGeo, gridMat);
  groundGrid.position.y = 0.05;
  
  group.add(ground);
  group.add(groundGrid);
  animatables.dispatchTerrain = ground;

  // 2. Towers (Communication Nodes)
  animatables.dispatchNetworkNodes = [];
  const towerGeo = new THREE.CylinderGeometry(0.2, 0.5, 8);
  const towerMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  disposables.push(towerGeo, towerMat);

  const tPos = [{x: -25, z: -25}, {x: 25, z: -25}, {x: -25, z: 25}, {x: 25, z: 25}];
  tPos.forEach(p => {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(p.x, 4, p.z);
      group.add(t);
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 16), new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, transparent: true }));
      pulse.rotation.x = Math.PI/2;
      pulse.position.y = 8; // Top of tower (height 8)
      t.add(pulse);
      animatables.dispatchNetworkNodes?.push(t as unknown as THREE.Group);
  });

  // 3. Diggers (Static Equipment)
  animatables.dispatchDiggers = [];
  const diggerGeo = new THREE.BoxGeometry(2, 2, 2);
  const diggerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  disposables.push(diggerGeo, diggerMat);
  
  // Place diggers at bottom of pit and top
  const dPos = [
      {x: 0, y: -10, z: 0},
      {x: 15, y: 0, z: 10},
      {x: -15, y: 0, z: -10}
  ];
  
  dPos.forEach(p => {
      const dGroup = new THREE.Group();
      dGroup.position.set(p.x, p.y + 1, p.z);
      const body = new THREE.Mesh(diggerGeo, diggerMat);
      dGroup.add(body);
      // Arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), diggerMat);
      arm.position.set(0, 1, 2);
      dGroup.add(arm);
      
      group.add(dGroup);
      animatables.dispatchDiggers?.push({ mesh: dGroup, type: 'DIGGER' });
  });

  // 4. Trucks (Moving Agents)
  animatables.dispatchTrucks = [];
  const truckGeo = new THREE.BoxGeometry(1.5, 1, 2.5);
  const truckMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(truckGeo, truckMat);

  for(let i=0; i<6; i++) {
      const tGroup = new THREE.Group();
      const mesh = new THREE.Mesh(truckGeo, truckMat);
      mesh.position.y = 0.5;
      tGroup.add(mesh);
      
      // Halo for status
      const halo = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.6, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      halo.rotation.x = -Math.PI/2;
      halo.position.y = 0.1;
      tGroup.add(halo);

      group.add(tGroup);
      
      animatables.dispatchTrucks.push({
          mesh: tGroup,
          type: 'TRUCK',
          speed: 0.1 + Math.random() * 0.05,
          velocity: new THREE.Vector3(),
          target: new THREE.Vector3((Math.random()-0.5)*40, 0, (Math.random()-0.5)*40)
      });
  }

  // 5. People (Moving Agents)
  animatables.dispatchPeople = [];
  const personGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
  const personMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
  disposables.push(personGeo, personMat);

  for(let i=0; i<10; i++) {
      const pGroup = new THREE.Group();
      const mesh = new THREE.Mesh(personGeo, personMat);
      mesh.position.y = 0.7;
      pGroup.add(mesh);
      
      group.add(pGroup);
      
      animatables.dispatchPeople.push({
          mesh: pGroup,
          type: 'HUMAN',
          speed: 0.03 + Math.random() * 0.02,
          velocity: new THREE.Vector3(),
          target: new THREE.Vector3((Math.random()-0.5)*50, 0, (Math.random()-0.5)*50)
      });
  }

  // 6. Network Links (Dynamic Lines)
  // Create a buffer geometry for lines that we update every frame
  const maxLinks = 200; // Increased buffer
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(maxLinks * 2 * 3); // 2 points per line, 3 coords per point
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.3, 
      blending: THREE.AdditiveBlending 
  });
  disposables.push(lineGeo, lineMaterial);
  
  const lines = new THREE.LineSegments(lineGeo, lineMaterial);
  lines.frustumCulled = false;
  group.add(lines);
  animatables.dispatchLinks = lines;

  // Lights
  const spot = new THREE.SpotLight(0xffffff, 1);
  spot.position.set(0, 30, 0);
  group.add(spot);
};

export const animateMineDispatchScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { mode: 'AI' | 'MANUAL', alert: boolean }
    const isAlert = simData?.alert || false;

    // 1. Move Agents
    const allAgents: any[] = [...(animatables.dispatchTrucks || []), ...(animatables.dispatchPeople || [])];

    // Simple height function for terrain
    const getHeight = (x: number, z: number) => {
        const dist = Math.sqrt(x*x + z*z);
        if (dist < 20) return -10 + dist * 0.5;
        return 0;
    };

    allAgents.forEach(agent => {
        const pos = agent.mesh.position;
        const target = agent.target;
        
        // Move towards target
        const dir = new THREE.Vector3().subVectors(target, pos);
        dir.y = 0; // Move on plane first
        const dist = dir.length();
        
        if (dist < 1) {
            // New random target
            agent.target.set((Math.random()-0.5)*50, 0, (Math.random()-0.5)*50);
        } else {
            dir.normalize();
            
            // Collision Avoidance (Simple)
            // If human is near truck, truck stops or human runs?
            // Let's implement slowing down near others
            let speedMod = 1.0;
            allAgents.forEach(other => {
                if (other === agent) return;
                const d = pos.distanceTo(other.mesh.position);
                if (d < 3) speedMod = 0.2; // Slow down
                if (isAlert) speedMod = 0; // Stop on alert
            });

            pos.add(dir.multiplyScalar(agent.speed * speedMod));
            
            // Look at
            agent.mesh.lookAt(pos.clone().add(dir));
            
            // Set Height
            const h = getHeight(pos.x, pos.z);
            // Smooth y transition
            pos.y = THREE.MathUtils.lerp(pos.y, h + (agent.type === 'TRUCK' ? 0 : 0.7), 0.1);
        }
        
        // Status Color Update
        if (agent.type === 'TRUCK') {
             const halo = agent.mesh.children[1];
             if (halo) {
                const mat = halo.material as THREE.MeshBasicMaterial;
                if (isAlert) mat.color.setHex(0xff0000);
                else mat.color.setHex(0x22c55e);
             }
        }
    });

    // 2. Rotate Diggers
    if (animatables.dispatchDiggers) {
        animatables.dispatchDiggers.forEach(d => {
            d.mesh.rotation.y = Math.sin(time * 0.5) * 0.5;
            if (d.mesh.children[1]) {
               d.mesh.children[1].rotation.x = Math.sin(time) * 0.5; // Arm move
            }
        });
    }

    // 3. Update Network Lines
    // Draw lines between agents if close (< 15m)
    if (animatables.dispatchLinks) {
        const positions = animatables.dispatchLinks.geometry.attributes.position.array as Float32Array;
        let lineIdx = 0;
        
        for(let i=0; i<allAgents.length; i++) {
            const a1 = allAgents[i]; // Correct scope
            
            // Agent-to-Agent
            for(let j=i+1; j<allAgents.length; j++) {
                const a2 = allAgents[j];
                const d = a1.mesh.position.distanceTo(a2.mesh.position);
                
                if (d < 15) { // Connection range
                    if (lineIdx < positions.length - 6) {
                        positions[lineIdx++] = a1.mesh.position.x;
                        positions[lineIdx++] = a1.mesh.position.y + 2;
                        positions[lineIdx++] = a1.mesh.position.z;
                        
                        positions[lineIdx++] = a2.mesh.position.x;
                        positions[lineIdx++] = a2.mesh.position.y + 2;
                        positions[lineIdx++] = a2.mesh.position.z;
                    }
                }
            }
            
            // Connect to Towers
            if (animatables.dispatchNetworkNodes) {
                animatables.dispatchNetworkNodes.forEach(tower => {
                    const d = a1.mesh.position.distanceTo(tower.position);
                    if (d < 25) {
                         if (lineIdx < positions.length - 6) {
                            positions[lineIdx++] = a1.mesh.position.x;
                            positions[lineIdx++] = a1.mesh.position.y + 2;
                            positions[lineIdx++] = a1.mesh.position.z;
                            
                            positions[lineIdx++] = tower.position.x;
                            positions[lineIdx++] = tower.position.y + 8;
                            positions[lineIdx++] = tower.position.z;
                        }
                    }
                });
            }
        }
        
        // Zero out remaining lines
        for(let k=lineIdx; k<positions.length; k++) positions[k] = 0;
        
        animatables.dispatchLinks.geometry.attributes.position.needsUpdate = true;
    }
    
    // Tower Pulse
    if (animatables.dispatchNetworkNodes) {
        animatables.dispatchNetworkNodes.forEach(t => {
            const ring = t.children[0]; // Ring is the first child added in initialization
            if (ring) {
                const s = 1 + Math.sin(time * 5) * 0.5;
                ring.scale.set(s, s, s);
                (ring.material as THREE.Material).opacity = 1 - (s - 1);
            }
        });
    }
};

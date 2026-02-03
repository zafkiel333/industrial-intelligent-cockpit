
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineCrashScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Test Track)
  const floorGeo = new THREE.PlaneGeometry(60, 20);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x18181b, 
      roughness: 0.8,
      metalness: 0.2
  });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = 0;
  group.add(floor);

  // Grid Markings
  const gridHelper = new THREE.GridHelper(60, 20, 0xf97316, 0x333333);
  gridHelper.position.y = 0.02;
  group.add(gridHelper);

  // Wall/Barrier at End
  const wallGeo = new THREE.BoxGeometry(2, 6, 12);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(wallGeo, wallMat);
  const backstop = new THREE.Mesh(wallGeo, wallMat);
  backstop.position.set(20, 3, 0);
  group.add(backstop);

  // 2. Buffer System (Hydraulic Piston)
  const bufferGroup = new THREE.Group();
  bufferGroup.position.set(18, 1.5, 0);
  group.add(bufferGroup);
  animatables.crashBuffer = bufferGroup;

  // Cylinder Base
  const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 4);
  cylGeo.rotateZ(Math.PI / 2);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(cylGeo, cylMat);
  const cylinder = new THREE.Mesh(cylGeo, cylMat);
  bufferGroup.add(cylinder);

  // Piston (Movable)
  const pistonGeo = new THREE.CylinderGeometry(0.6, 0.6, 4);
  pistonGeo.rotateZ(Math.PI / 2);
  const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  disposables.push(pistonGeo, pistonMat);
  const piston = new THREE.Mesh(pistonGeo, pistonMat);
  piston.position.x = -2; // Extended to left
  bufferGroup.add(piston);

  // Bumper Plate
  const plateGeo = new THREE.BoxGeometry(0.5, 3, 6);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Warning color
  disposables.push(plateGeo, plateMat);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.x = -4; // End of piston
  piston.add(plate); // Attach to piston so it moves with it

  // 3. Mining Truck (Simplistic but sturdy looking)
  const truckGroup = new THREE.Group();
  group.add(truckGroup);
  animatables.crashTruck = truckGroup;

  const chassisGeo = new THREE.BoxGeometry(6, 1, 4);
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46 });
  disposables.push(chassisGeo, chassisMat);
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 1;
  truckGroup.add(chassis);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(1, 1, 1, 32);
  wheelGeo.rotateX(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  disposables.push(wheelGeo, wheelMat);
  
  const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.position.set(2, 1, 2); truckGroup.add(w1);
  const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.position.set(2, 1, -2); truckGroup.add(w2);
  const w3 = new THREE.Mesh(wheelGeo, wheelMat); w3.position.set(-2, 1, 2); truckGroup.add(w3);
  const w4 = new THREE.Mesh(wheelGeo, wheelMat); w4.position.set(-2, 1, -2); truckGroup.add(w4);

  // Cab
  const cabGeo = new THREE.BoxGeometry(2, 2, 2);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  disposables.push(cabGeo, cabMat);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(1.5, 2.5, 1);
  truckGroup.add(cab);

  // Dump Bed
  const bedGeo = new THREE.BoxGeometry(5, 2, 3.5);
  const bedMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  disposables.push(bedGeo, bedMat);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(-0.5, 2.8, -0.2);
  truckGroup.add(bed);

  // Impact Zone (Visual Mesh on front bumper)
  const impactGeo = new THREE.BoxGeometry(0.2, 1, 3.8);
  const impactMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
  disposables.push(impactGeo, impactMat);
  const impactMesh = new THREE.Mesh(impactGeo, impactMat);
  impactMesh.position.set(3.1, 1, 0); // Front bumper
  truckGroup.add(impactMesh);
  animatables.impactZone = impactMesh;

  // 4. Force Vectors (Hidden Arrows)
  animatables.crashForceVectors = [];
  const dir = new THREE.Vector3(-1, 0, 0); // Reaction force points left
  const origin = new THREE.Vector3(14, 1.5, 0); // Impact point approx
  const arrow = new THREE.ArrowHelper(dir, origin, 3, 0xef4444, 1, 1);
  arrow.visible = false;
  group.add(arrow);
  animatables.crashForceVectors.push(arrow);

  // 5. Debris Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  
  const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.2, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.crashDebris = particles;

  // Lighting
  const spot = new THREE.SpotLight(0xffffff, 2);
  spot.position.set(0, 20, 0);
  spot.target = truckGroup;
  group.add(spot);
};

export const animateMineCrashScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { trigger: boolean, reset: boolean, speed: number (m/s), mass: number }
    // We handle the physics loop here based on time delta
    
    // Internal state simulation (would be better in a class, but closure works)
    // We assume 'time' is monotonic. We need delta or manage our own step.
    // For simplicity, we use simData.progress (0-100) if provided, or manage state here.
    // Actually, React updating simData on every frame is slow. 
    // Best practice: Receive a 'Command' and handle animation loop internally in this function.
    
    const truck = animatables.crashTruck;
    const bufferPiston = animatables.crashBuffer?.children[1]; // Piston
    const impactMesh = animatables.impactZone;
    const particles = animatables.crashDebris;
    const arrow = animatables.crashForceVectors?.[0];

    if (!truck || !bufferPiston) return;

    // Simulation Constants
    const startX = -20;
    const impactX = 14; // Where buffer plate is (18 - 4)
    const maxCompression = 2.0;

    // State stored on the group userData to persist between frames
    if (!truck.userData.simState) {
        truck.userData.simState = {
            phase: 'IDLE', // IDLE, RUNNING, CRASH, REBOUND
            x: startX,
            velocity: 0,
            impactTime: 0
        };
    }
    const state = truck.userData.simState;

    // Handle Commands
    if (simData?.reset) {
        state.phase = 'IDLE';
        state.x = startX;
        state.velocity = 0;
        
        // Reset Visuals
        truck.position.x = startX;
        truck.rotation.z = 0; // Reset pitch
        bufferPiston.position.x = -2; // Extended
        if (impactMesh) (impactMesh.material as THREE.Material).opacity = 0;
        if (particles) (particles.material as THREE.Material).opacity = 0;
        if (arrow) arrow.visible = false;
        
        return; // Frame done
    }

    if (simData?.trigger && state.phase === 'IDLE') {
        state.phase = 'RUNNING';
        state.velocity = (simData.speed || 50) * 0.02; // Scale speed for visual
    }

    // Animation Logic
    if (state.phase === 'RUNNING') {
        state.x += state.velocity;
        
        // Check Collision
        if (state.x >= impactX) {
            state.x = impactX;
            state.phase = 'CRASH';
            state.impactTime = time;
            
            // Initial Impact Visuals
            triggerExplosion(particles!, impactX, 1.5, 0);
        }
        
        truck.position.x = state.x;
    
    } else if (state.phase === 'CRASH') {
        const dt = time - state.impactTime;
        
        // 1. Buffer Compression (Spring Damping)
        // Simulate compression: x = A * (1 - exp(-t)) * sin(wt) or simple compression
        // Let's do simple compression then rebound
        let compression = 0;
        if (dt < 0.2) {
            // Compressing
            compression = (dt / 0.2) * maxCompression;
        } else if (dt < 0.5) {
            // Rebounding
            compression = maxCompression - ((dt - 0.2) / 0.3) * maxCompression;
        } else {
            compression = 0;
            state.phase = 'IDLE'; // End of event
        }
        
        bufferPiston.position.x = -2 + compression; // -2 is extended, +compression moves it right (wait, piston moves right into cylinder?)
        // Cylinder at 18. Piston at 18 + localX.
        // Piston visual mesh is centered. 
        // Logic: Piston needs to move +X to compress into cylinder? No, cylinder is at 18. Truck hits at 14.
        // Piston extends LEFT from 18. So compressing means moving RIGHT (towards 18).
        // Initial pos x = -2 (relative to 18). Target compressed x = 0.
        // So we add compression to x. Correct.
        
        // 2. Truck Position matches Piston
        truck.position.x = impactX + compression;

        // 3. Cab Pitch (Simulate suspension dive/cab shake)
        const shake = Math.sin(dt * 50) * 0.1 * (1 - dt/0.5);
        truck.rotation.z = -compression * 0.1 + shake; // Dip nose down

        // 4. Force Arrow
        if (arrow) {
            arrow.visible = true;
            const forceMag = (compression / maxCompression) * 5; // Scale arrow
            arrow.setLength(forceMag, 1, 0.5);
            // Arrow position tracks impact point
            arrow.position.set(truck.position.x + 3, 2, 0);
        }

        // 5. Impact Heatmap
        if (impactMesh) {
             (impactMesh.material as THREE.Material).opacity = Math.max(0, 1 - dt * 2);
        }

        // 6. Particles
        if (particles) {
            animateDebris(particles);
            (particles.material as THREE.Material).opacity = Math.max(0, 1 - dt);
        }
    }
};

function triggerExplosion(system: THREE.Points, x: number, y: number, z: number) {
    const pos = system.geometry.attributes.position.array as Float32Array;
    const vel = system.geometry.attributes.velocity.array as Float32Array;
    
    for(let i=0; i<pos.length; i+=3) {
        pos[i] = x + (Math.random()-0.5);
        pos[i+1] = y + (Math.random()-0.5);
        pos[i+2] = z + (Math.random()-0.5);
        
        // Explode outward
        vel[i] = (Math.random()-0.5) * 1.5; // X
        vel[i+1] = Math.random() * 1.5;   // Y Up
        vel[i+2] = (Math.random()-0.5) * 1.5; // Z
    }
    (system.material as THREE.Material).opacity = 1;
    system.geometry.attributes.position.needsUpdate = true;
}

function animateDebris(system: THREE.Points) {
    const pos = system.geometry.attributes.position.array as Float32Array;
    const vel = system.geometry.attributes.velocity.array as Float32Array;
    
    for(let i=0; i<pos.length; i+=3) {
        pos[i] += vel[i];
        pos[i+1] += vel[i+1];
        pos[i+2] += vel[i+2];
        
        vel[i+1] -= 0.05; // Gravity
        
        if (pos[i+1] < 0) {
            pos[i+1] = 0;
            vel[i] = 0;
            vel[i+1] = 0;
            vel[i+2] = 0;
        }
    }
    system.geometry.attributes.position.needsUpdate = true;
}

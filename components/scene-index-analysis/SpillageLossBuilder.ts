
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isSpillageLossScene = (type: SceneType): boolean => {
  return type === 'spillage-loss-analysis';
};

export const setupSpillageLossCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 10, 15);
  camera.lookAt(0, -2, 0);
};

export const initSpillageLossScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'spillage-loss-analysis') return;

  // 1. Dam Structure (Spillway Section)
  const damGeo = new THREE.BoxGeometry(20, 8, 4);
  const damMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, 
    roughness: 0.8,
    metalness: 0.2
  });
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  dam.position.set(0, 0, 0);
  group.add(dam);

  // Spillway Chute (Curved ramp)
  const chuteShape = new THREE.Shape();
  chuteShape.moveTo(-10, 0);
  chuteShape.lineTo(10, 0);
  chuteShape.lineTo(10, -5);
  chuteShape.quadraticCurveTo(10, -8, 12, -8); // Flip bucket
  chuteShape.lineTo(-10, -8);
  chuteShape.lineTo(-10, 0);

  const chuteGeo = new THREE.ExtrudeGeometry(chuteShape, { depth: 10, bevelEnabled: false });
  chuteGeo.translate(0, 0, 2); // Attach to dam front
  chuteGeo.rotateY(-Math.PI / 2); // Fix orientation
  chuteGeo.translate(0, 0, 0); 
  
  // Simplified Chute Ramp
  const rampGeo = new THREE.PlaneGeometry(16, 12, 16, 16);
  const pos = rampGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const y = pos.getY(i); // Local Y is vertical on plane before rotation
      // Curve: Z goes down and out
      // We want a ski-jump profile
      // Map linear plane to curve
      const t = (y + 6) / 12; // 0 to 1
      const z = 2 + t * 8;
      const h = -t * t * 8; // Parabolic drop
      
      // Update actual coords (rotated later)
      // We'll construct manual mesh or just use Box for simplicity if Curve is hard
  }
  
  // Use simple slope boxes for chute
  const slopeGeo = new THREE.BoxGeometry(16, 0.5, 10);
  const slopeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(slopeGeo, slopeMat);
  const slope = new THREE.Mesh(slopeGeo, slopeMat);
  slope.rotation.x = Math.PI / 4;
  slope.position.set(0, -3, 4);
  group.add(slope);

  // 2. Reservoir Surface
  const waterGeo = new THREE.PlaneGeometry(30, 20);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.7, 
    roughness: 0.1 
  });
  disposables.push(waterGeo, waterMat);
  const reservoir = new THREE.Mesh(waterGeo, waterMat);
  reservoir.position.set(0, 3, -12);
  group.add(reservoir);
  animatables.reservoirSurface = reservoir;

  // 3. Spillway Gates (3 Gates)
  animatables.spillwayGates = [];
  const gateGeo = new THREE.BoxGeometry(4, 5, 0.5);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Orange gates
  disposables.push(gateGeo, gateMat);

  [-5, 0, 5].forEach(x => {
    // Gate Guides
    const guideGeo = new THREE.BoxGeometry(1, 6, 1);
    const guide = new THREE.Mesh(guideGeo, damMat);
    guide.position.set(x - 2.5, 3, 2);
    group.add(guide);
    const guide2 = guide.clone();
    guide2.position.set(x + 2.5, 3, 2);
    group.add(guide2);

    // The Gate
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(x, 2.5, 2); // Closed position
    group.add(gate);
    animatables.spillwayGates?.push(gate);
  });

  // 4. Spillage Flow Particles (Waterfall)
  const pCount = 1500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0-1 life

  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 15; // X spread
    pPos[i*3+1] = -10; // Start hidden
    pPos[i*3+2] = 0;
    pLife[i] = Math.random();
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));

  const pMat = new THREE.PointsMaterial({ 
    color: 0xcffafe, 
    size: 0.2, 
    transparent: true, 
    opacity: 0.8,
    map: createSprayTexture()
  });
  disposables.push(pMat, pGeo);

  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.spillwayFlow = flow;
};

// Helper texture
function createSprayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(16,16,0, 16,16,16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,32,32);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export const animateSpillageLossScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'spillage-loss-analysis') return;

  // Retrieve gate openness from userData or infer from Y position if controlled externally
  // For demo, we simulate gate movement based on time
  const openAmount = 0.5 + Math.sin(time * 0.5) * 0.5; // 0 to 1

  if (animatables.spillwayGates) {
    animatables.spillwayGates.forEach((gate, i) => {
      // Staggered opening
      const offset = i * 0.5;
      const localOpen = Math.max(0, Math.min(1, Math.sin(time * 0.5 + offset) * 0.5 + 0.5));
      gate.position.y = 2.5 + localOpen * 4; // Lift up
      // Store open amount for particles
      gate.userData.open = localOpen;
    });
  }

  // Animate Water Particles
  if (animatables.spillwayFlow && animatables.spillwayGates) {
    const positions = animatables.spillwayFlow.geometry.attributes.position.array as Float32Array;
    const lifes = animatables.spillwayFlow.geometry.attributes.life.array as Float32Array;
    
    // Gates X positions: -5, 0, 5. Width 4.
    const gates = animatables.spillwayGates;

    for(let i=0; i<lifes.length; i++) {
      lifes[i] += 0.02; // Age

      if (lifes[i] > 1) {
        // Reset particle
        lifes[i] = 0;
        
        // Pick a random gate
        const gIdx = Math.floor(Math.random() * 3);
        const gate = gates[gIdx];
        const isOpen = gate.userData.open || 0;
        
        if (isOpen > 0.1) {
           // Spawn at gate crest
           positions[i*3] = gate.position.x + (Math.random() - 0.5) * 4;
           positions[i*3+1] = 2; // Crest height
           positions[i*3+2] = 2; // Front of dam
        } else {
           // Hide if gate closed
           positions[i*3+1] = -50; 
        }
      } else {
        // Physics for active particles
        if (positions[i*3+1] > -10) {
            // Gravity arc
            positions[i*3+1] -= 0.15 + lifes[i] * 0.2; // Accelerate down
            positions[i*3+2] += 0.15; // Move forward
            
            // Deflect on ramp (approximate collision)
            // Slope is roughly z=4 to 8, y=-1 to -5
            if (positions[i*3+2] > 3 && positions[i*3+2] < 10) {
                if (positions[i*3+1] < -2) {
                    positions[i*3+2] += 0.1; // Ski jump
                    positions[i*3+1] += 0.1;
                }
            }
        }
      }
    }
    
    animatables.spillwayFlow.geometry.attributes.position.needsUpdate = true;
    animatables.spillwayFlow.geometry.attributes.life.needsUpdate = true;
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isTurbineWearScene = (type: SceneType): boolean => {
  return type === 'turbine-wear-analysis';
};

export const setupTurbineWearCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(8, 6, 8);
  camera.lookAt(0, 1, 0);
};

export const initTurbineWearScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'turbine-wear-analysis') return;

  // 1. Single Turbine Blade (Abstracted Form)
  // Create a curved shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(2, 2, 4, 1);
  shape.lineTo(3.5, 5);
  shape.quadraticCurveTo(1.5, 4, 0, 0);

  const extrudeSettings = {
    steps: 2,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 5
  };

  const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center it
  bladeGeo.center();
  
  // Custom material that can change color based on "wear"
  const bladeMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, // Base metal
    roughness: 0.4,
    metalness: 0.8,
    emissive: 0x000000
  });
  
  disposables.push(bladeGeo, bladeMat);
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  // Tilt it to look like a blade in a runner
  blade.rotation.x = -Math.PI / 4;
  blade.rotation.z = Math.PI / 6;
  group.add(blade);
  animatables.turbineBlade = blade;

  // 2. Cavitation Bubbles (White/Cyan particles near surface)
  const cCount = 1000;
  const cGeo = new THREE.BufferGeometry();
  const cPos = new Float32Array(cCount * 3);
  const cLife = new Float32Array(cCount);
  
  for(let i=0; i<cCount; i++) {
    cPos[i*3] = (Math.random() - 0.5) * 4;
    cPos[i*3+1] = -2 + Math.random() * 4;
    cPos[i*3+2] = (Math.random() - 0.5) * 1;
    cLife[i] = Math.random();
  }
  
  cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
  cGeo.setAttribute('life', new THREE.BufferAttribute(cLife, 1));
  
  const cMat = new THREE.PointsMaterial({ 
    color: 0xcffafe, 
    size: 0.1, 
    transparent: true, 
    opacity: 0, // Controlled by animation
    blending: THREE.AdditiveBlending
  });
  
  disposables.push(cGeo, cMat);
  const bubbles = new THREE.Points(cGeo, cMat);
  group.add(bubbles);
  animatables.cavitationBubbles = bubbles;

  // 3. Sediment Particles (Brown/Grey particles flowing over)
  const sCount = 800;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  const sSpeed = new Float32Array(sCount);
  
  for(let i=0; i<sCount; i++) {
    sPos[i*3] = (Math.random() - 0.5) * 4;
    sPos[i*3+1] = 4; // Start high
    sPos[i*3+2] = (Math.random() - 0.5) * 1;
    sSpeed[i] = 0.1 + Math.random() * 0.1;
  }
  
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('speed', new THREE.BufferAttribute(sSpeed, 1));
  
  const sMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.08 });
  disposables.push(sGeo, sMat);
  const sediment = new THREE.Points(sGeo, sMat);
  group.add(sediment);
  animatables.sedimentParticles = sediment;

  // 4. Hub/Shaft Reference
  const hubGeo = new THREE.CylinderGeometry(1, 1, 6, 32);
  hubGeo.rotateX(Math.PI/2); // Horizontal shaft
  hubGeo.translate(0, 0, -3);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(hubGeo, hubMat);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  group.add(hub);
};

export const animateTurbineWearScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'turbine-wear-analysis') return;

  // External params passed via userData if possible, otherwise defaults
  // We can infer severity from the opacity/intensity set in the View component (via props potentially, 
  // but here we simulate based on time or hardcoded for now, waiting for View to pass data is cleaner but 
  // ThreeScene structure doesn't easily pass Props down to animate loop without context.
  // We will make the particles react to a "simulated" severity cycle.
  
  const severityCycle = Math.sin(time * 0.5) * 0.5 + 0.5; // 0 to 1

  // 1. Cavitation Bubble Animation
  if (animatables.cavitationBubbles) {
    const positions = animatables.cavitationBubbles.geometry.attributes.position.array as Float32Array;
    const life = animatables.cavitationBubbles.geometry.attributes.life.array as Float32Array;
    const material = animatables.cavitationBubbles.material as THREE.PointsMaterial;
    
    // Pulse opacity based on "Severity"
    material.opacity = 0.2 + severityCycle * 0.6;
    material.size = 0.05 + severityCycle * 0.1;

    for (let i = 0; i < life.length; i++) {
      life[i] += 0.05;
      if (life[i] > 1) {
        life[i] = 0;
        // Reset to "low pressure zone" (Trailing edge of blade)
        // Blade coords roughly x: -2 to 2, y: -2 to 2.
        // Cavitation usually at outlet or suction side
        positions[i*3] = (Math.random() - 0.5) * 3;
        positions[i*3+1] = -1 + Math.random() * 2;
        positions[i*3+2] = 0.5 + Math.random() * 0.5; // Near surface
      } else {
        // Implode/Jitter
        positions[i*3] += (Math.random() - 0.5) * 0.1;
        positions[i*3+1] += (Math.random() - 0.5) * 0.1;
        positions[i*3+2] += (Math.random() - 0.5) * 0.1;
      }
    }
    animatables.cavitationBubbles.geometry.attributes.position.needsUpdate = true;
    animatables.cavitationBubbles.geometry.attributes.life.needsUpdate = true;
  }

  // 2. Sediment Flow
  if (animatables.sedimentParticles) {
    const positions = animatables.sedimentParticles.geometry.attributes.position.array as Float32Array;
    const speeds = animatables.sedimentParticles.geometry.attributes.speed.array as Float32Array;

    for (let i = 0; i < speeds.length; i++) {
      positions[i*3+1] -= speeds[i]; // Move down (Flow direction)
      positions[i*3] -= speeds[i] * 0.5; // Flow along blade curve
      
      // Reset
      if (positions[i*3+1] < -3) {
        positions[i*3+1] = 3;
        positions[i*3] = 1 + (Math.random() - 0.5) * 2;
        positions[i*3+2] = (Math.random() - 0.5) * 1;
      }
    }
    animatables.sedimentParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Blade Heatmap Pulse (Emissive Color)
  if (animatables.turbineBlade) {
    const mat = animatables.turbineBlade.material as THREE.MeshStandardMaterial;
    // Turn redder when severity high
    const r = severityCycle * 0.8;
    const g = 0.2;
    const b = 0.1;
    mat.emissive.setRGB(r, g, b);
  }
};

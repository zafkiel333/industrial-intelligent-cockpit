
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineralRecoveryScene = (type: SceneType): boolean => {
  return type === 'mineral-recovery-analysis';
};

export const setupMineralRecoveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 5, 12);
  camera.lookAt(0, 1, 0);
};

export const initMineralRecoveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'mineral-recovery-analysis') return;

  // 1. Flotation Column Container (Glass)
  const cylinderGeo = new THREE.CylinderGeometry(3, 3, 10, 32, 1, true);
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x22d3ee, 
    transparent: true, 
    opacity: 0.2, 
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide
  });
  disposables.push(cylinderGeo, glassMat);
  const cylinder = new THREE.Mesh(cylinderGeo, glassMat);
  group.add(cylinder);

  // 2. Impeller / Agitator Base
  const baseGeo = new THREE.CylinderGeometry(0.5, 3, 1, 32);
  baseGeo.translate(0, -5, 0);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.5 });
  disposables.push(baseGeo, baseMat);
  const base = new THREE.Mesh(baseGeo, baseMat);
  group.add(base);

  // 3. Bubbles (Rising)
  const bubbleCount = 400;
  const bubbleGeo = new THREE.BufferGeometry();
  const bubblePos = new Float32Array(bubbleCount * 3);
  const bubbleSpeeds = new Float32Array(bubbleCount);
  
  for(let i=0; i<bubbleCount; i++) {
    const r = Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    bubblePos[i*3] = r * Math.cos(theta);
    bubblePos[i*3+1] = -5 + Math.random() * 10;
    bubblePos[i*3+2] = r * Math.sin(theta);
    bubbleSpeeds[i] = 0.05 + Math.random() * 0.1;
  }
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
  bubbleGeo.setAttribute('speed', new THREE.BufferAttribute(bubbleSpeeds, 1));
  
  const bubbleMat = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.2, 
    transparent: true, 
    opacity: 0.6,
    map: createCircleTexture()
  });
  
  disposables.push(bubbleGeo, bubbleMat);
  const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
  group.add(bubbles);
  animatables.separationBubbles = bubbles;

  // 4. Mineral Particles (Attached to bubbles or sinking)
  const minCount = 300;
  const minGeo = new THREE.BufferGeometry();
  const minPos = new Float32Array(minCount * 3);
  const minColor = new Float32Array(minCount * 3);
  const minSpeeds = new Float32Array(minCount); // + for rise, - for sink
  
  const colorGold = new THREE.Color(0xfacc15); // Ore
  const colorWaste = new THREE.Color(0x475569); // Waste

  for(let i=0; i<minCount; i++) {
    const r = Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    minPos[i*3] = r * Math.cos(theta);
    minPos[i*3+1] = -5 + Math.random() * 9; // Slightly lower start
    minPos[i*3+2] = r * Math.sin(theta);
    
    // 70% chance to be ore (simulated high grade feed)
    const isOre = Math.random() > 0.4; 
    if (isOre) {
      minColor[i*3] = colorGold.r;
      minColor[i*3+1] = colorGold.g;
      minColor[i*3+2] = colorGold.b;
      minSpeeds[i] = 0.05 + Math.random() * 0.05; // Rise
    } else {
      minColor[i*3] = colorWaste.r;
      minColor[i*3+1] = colorWaste.g;
      minColor[i*3+2] = colorWaste.b;
      minSpeeds[i] = -0.02 - Math.random() * 0.02; // Sink slowly
    }
  }
  minGeo.setAttribute('position', new THREE.BufferAttribute(minPos, 3));
  minGeo.setAttribute('color', new THREE.BufferAttribute(minColor, 3));
  minGeo.setAttribute('speed', new THREE.BufferAttribute(minSpeeds, 1));

  const minMat = new THREE.PointsMaterial({ 
    vertexColors: true, 
    size: 0.15,
    transparent: true,
    opacity: 0.9
  });
  
  disposables.push(minGeo, minMat);
  const minerals = new THREE.Points(minGeo, minMat);
  group.add(minerals);
  animatables.separationMineral = minerals;

  // 5. Froth Layer (Top)
  const frothGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
  frothGeo.translate(0, 4.5, 0);
  const frothMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8
  });
  disposables.push(frothGeo, frothMat);
  const froth = new THREE.Mesh(frothGeo, frothMat);
  group.add(froth);
  animatables.frothSurface = froth;
};

// Helper for bubble texture
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  if (context) {
    context.beginPath();
    context.arc(16, 16, 14, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const animateMineralRecoveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'mineral-recovery-analysis') return;

  // Animate Bubbles
  if (animatables.separationBubbles) {
    const positions = animatables.separationBubbles.geometry.attributes.position.array as Float32Array;
    const speeds = animatables.separationBubbles.geometry.attributes.speed.array as Float32Array;
    
    for(let i=0; i<positions.length/3; i++) {
      positions[i*3+1] += speeds[i];
      // Swirl effect
      const x = positions[i*3];
      const z = positions[i*3+2];
      const angle = 0.02;
      positions[i*3] = x * Math.cos(angle) - z * Math.sin(angle);
      positions[i*3+2] = x * Math.sin(angle) + z * Math.cos(angle);

      // Reset
      if (positions[i*3+1] > 4) {
        positions[i*3+1] = -5;
        const r = Math.random() * 2.8;
        const theta = Math.random() * Math.PI * 2;
        positions[i*3] = r * Math.cos(theta);
        positions[i*3+2] = r * Math.sin(theta);
      }
    }
    animatables.separationBubbles.geometry.attributes.position.needsUpdate = true;
  }

  // Animate Minerals
  if (animatables.separationMineral) {
    const positions = animatables.separationMineral.geometry.attributes.position.array as Float32Array;
    const speeds = animatables.separationMineral.geometry.attributes.speed.array as Float32Array;
    
    for(let i=0; i<positions.length/3; i++) {
      positions[i*3+1] += speeds[i];
      
      // Rising particles swirl, sinking particles drift
      if (speeds[i] > 0) {
        const x = positions[i*3];
        const z = positions[i*3+2];
        const angle = 0.02;
        positions[i*3] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i*3+2] = x * Math.sin(angle) + z * Math.cos(angle);
        
        // Reset Ore
        if (positions[i*3+1] > 4) positions[i*3+1] = -5;
      } else {
        // Reset Waste
        if (positions[i*3+1] < -5) positions[i*3+1] = 0;
      }
    }
    animatables.separationMineral.geometry.attributes.position.needsUpdate = true;
  }

  // Animate Froth
  if (animatables.frothSurface) {
    animatables.frothSurface.scale.y = 1 + Math.sin(time * 2) * 0.1;
    animatables.frothSurface.position.y = 4.5 + Math.sin(time * 2) * 0.05;
  }
};

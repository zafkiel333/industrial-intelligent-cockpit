
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isReservoirBenefitScene = (type: SceneType): boolean => {
  return type === 'reservoir-benefit-analysis';
};

export const setupReservoirBenefitCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 0, 0);
};

export const initReservoirBenefitScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'reservoir-benefit-analysis') return;

  // 1. Terrain Basin
  // Create a U-shaped valley with a dam at one end
  const terrainGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
  const pos = terrainGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Valley curve
    let z = Math.pow(x * 0.2, 2) * 1.5; 
    // Slope down towards dam (positive Y is upstream, negative Y is dam)
    z += (y + 15) * 0.1;
    // Noise
    z += Math.random() * 0.2;
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1c1917, 
    roughness: 0.9, 
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -3;
  group.add(terrain);

  // 2. Dam Body
  const damGeo = new THREE.CylinderGeometry(1, 4, 6, 32, 1, false, Math.PI, Math.PI);
  damGeo.translate(0, 3, 0);
  damGeo.rotateY(Math.PI/2);
  const damMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  dam.scale.z = 2; // Widen
  dam.position.set(0, -3, 10);
  group.add(dam);

  // 3. Dynamic Water Surface
  const waterGeo = new THREE.PlaneGeometry(25, 20);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.5
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(0, 0, 0);
  group.add(water);
  animatables.resWater = water;

  // 4. Benefit Particles (Gold for Power, Green for Irrigation)
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  const pType = new Float32Array(pCount); // 0 = power, 1 = irrigation
  const pLife = new Float32Array(pCount);
  
  const colGold = new THREE.Color(0xfacc15);
  const colGreen = new THREE.Color(0x22c55e);

  for(let i=0; i<pCount; i++) {
    const isIrrigation = Math.random() > 0.6; // 40% irrigation
    pType[i] = isIrrigation ? 1 : 0;
    
    // Spawn point based on type
    if (!isIrrigation) {
      // Power (Turbine Intake at bottom center)
      pPos[i*3] = (Math.random()-0.5)*2;
      pPos[i*3+1] = -2;
      pPos[i*3+2] = 10;
      
      pCol[i*3] = colGold.r;
      pCol[i*3+1] = colGold.g;
      pCol[i*3+2] = colGold.b;
    } else {
      // Irrigation (Side intake)
      pPos[i*3] = 6;
      pPos[i*3+1] = 0;
      pPos[i*3+2] = 8;
      
      pCol[i*3] = colGreen.r;
      pCol[i*3+1] = colGreen.g;
      pCol[i*3+2] = colGreen.b;
    }
    
    pLife[i] = Math.random();
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('type', new THREE.BufferAttribute(pType, 1));
  
  const pMat = new THREE.PointsMaterial({ vertexColors: true, size: 0.2, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.benefitParticles = particles;
};

export const animateReservoirBenefitScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'reservoir-benefit-analysis') return;

  // Animate Water Level (Gentle Bobbing)
  // Actual level set by simulation logic via scale/position would be better, but we simulate life here
  if (animatables.resWater) {
    // Just surface ripple effect, assume main level controlled by props if integrated deeply
    // Here we just keep it steady or let it receive updates from the View if we wire it up
  }

  // Animate Particles
  if (animatables.benefitParticles) {
    const positions = animatables.benefitParticles.geometry.attributes.position.array as Float32Array;
    const lifes = animatables.benefitParticles.geometry.attributes.life.array as Float32Array;
    const types = animatables.benefitParticles.geometry.attributes.type.array as Float32Array;
    
    for(let i=0; i<lifes.length; i++) {
      lifes[i] += 0.02;
      
      if (lifes[i] > 1) {
        lifes[i] = 0;
        // Reset spawn
        if (types[i] === 0) { // Power
           positions[i*3] = (Math.random()-0.5)*2;
           positions[i*3+1] = -2;
           positions[i*3+2] = 10;
        } else { // Irrigation
           positions[i*3] = 6;
           positions[i*3+1] = 0;
           positions[i*3+2] = 8;
        }
      } else {
        // Move
        if (types[i] === 0) {
           // Power flow: Shoot out downstream
           positions[i*3+2] += 0.3;
           positions[i*3] += (Math.random()-0.5)*0.1; // Spread
        } else {
           // Irrigation flow: Flow sideways/down channel
           positions[i*3] += 0.2;
           positions[i*3+2] += 0.1;
        }
      }
    }
    
    animatables.benefitParticles.geometry.attributes.position.needsUpdate = true;
    animatables.benefitParticles.geometry.attributes.life.needsUpdate = true;
  }
};

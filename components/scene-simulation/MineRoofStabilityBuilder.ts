
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineRoofStabilityScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Brighter Industrial)
  const ambient = new THREE.AmbientLight(0xffffff, 0.5); // Boost ambient
  group.add(ambient);
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(10, 20, 20);
  group.add(mainLight);

  // Machinery Light (Orange Glow near face)
  const spotLight = new THREE.SpotLight(0xffaa00, 2, 50, Math.PI / 4, 0.5, 1);
  spotLight.position.set(0, 5, -5);
  spotLight.target.position.set(0, 0, -10);
  group.add(spotLight);
  group.add(spotLight.target);

  // 2. Floor (Coal Seam Floor)
  const floorGeo = new THREE.PlaneGeometry(60, 30);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, // Lighter than black
    roughness: 0.9, 
    metalness: 0.1 
  });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -2;
  group.add(floor);

  // 3. Coal Face (The wall being mined)
  const faceGeo = new THREE.BoxGeometry(40, 6, 2);
  const faceMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f1f1f, // Dark grey not pure black
    roughness: 0.6,
    metalness: 0.2,
    bumpScale: 0.5
  });
  disposables.push(faceGeo, faceMat);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 1, -10);
  group.add(face);
  animatables.coalFace = face;

  // 4. Hydraulic Supports (Shields) - The main equipment
  animatables.hydraulicSupports = [];
  const supportCount = 15;
  
  // Geometries reused for performance
  const baseGeo = new THREE.BoxGeometry(1.8, 0.5, 6);
  const canopyGeo = new THREE.BoxGeometry(1.8, 0.4, 7);
  const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.5);
  const shieldGeo = new THREE.BoxGeometry(1.8, 4, 0.5);
  
  // Brighter Materials
  const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa, // Light Blue
      roughness: 0.3, 
      metalness: 0.6 
  });
  const legMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, // White Chrome
      roughness: 0.2, 
      metalness: 0.8,
      emissive: 0x333333,
      emissiveIntensity: 0.2
  });
  
  disposables.push(baseGeo, canopyGeo, legGeo, shieldGeo, metalMat, legMat);

  for (let i = 0; i < supportCount; i++) {
    const supportGroup = new THREE.Group();
    const x = (i - supportCount / 2) * 2.2;
    
    // Base
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = -1.75;
    base.position.z = 2;
    supportGroup.add(base);

    // Legs (Hydraulic Cylinders)
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.5, 0, 2);
    supportGroup.add(legL);
    
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.5, 0, 2);
    supportGroup.add(legR);

    // Canopy (Top)
    const canopy = new THREE.Mesh(canopyGeo, metalMat);
    canopy.position.set(0, 1.8, 1); // Resting height
    canopy.rotation.x = 0.05; // Slight tilt
    supportGroup.add(canopy);

    // Shield (Back)
    const shield = new THREE.Mesh(shieldGeo, metalMat);
    shield.position.set(0, 0, 5);
    shield.rotation.x = -0.2;
    supportGroup.add(shield);

    supportGroup.position.set(x, 0, -5);
    group.add(supportGroup);
    
    // Store original Y for animation
    (supportGroup as any).userData = { 
        id: i, 
        baseY: 1.8, 
        resistance: 0 // Current load
    };
    animatables.hydraulicSupports.push(supportGroup);
  }

  // 5. Roof Strata (The Rock Layer) - Dynamic Mesh
  const roofSegmentsX = 40;
  const roofSegmentsZ = 20;
  const roofGeo = new THREE.PlaneGeometry(50, 20, roofSegmentsX, roofSegmentsZ);
  roofGeo.rotateX(Math.PI / 2); // Face down
  
  const roofMat = new THREE.MeshStandardMaterial({ 
    color: 0xa8a29e, // Stone Grey
    roughness: 1.0,
    side: THREE.DoubleSide,
    vertexColors: true, // Allow stress coloring
    wireframe: false
  });
  disposables.push(roofGeo, roofMat);

  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.2; // Just above supports
  roof.position.z = 0;
  group.add(roof);
  animatables.roofStrata = roof;

  // Initialize vertex colors to grey
  const count = roofGeo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
      colors[i*3] = 0.5; // R
      colors[i*3+1] = 0.5; // G
      colors[i*3+2] = 0.5; // B
  }
  roofGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 6. Stress Field (Floating particles showing fracture zones)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 40;
      pPos[i*3+1] = 2.5 + Math.random() * 5; // Above roof
      pPos[i*3+2] = (Math.random()-0.5) * 15;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ 
      color: 0xff4444, 
      size: 0.2, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const stressField = new THREE.Points(pGeo, pMat);
  group.add(stressField);
  animatables.stressField = stressField;
};

export const animateMineRoofStabilityScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // 1. Simulate Periodic Weighting (Roof Pressure Cycle)
    // simData.pressure is 0-100 (normalized) representing current roof pressure
    const pressureLevel = simData?.pressure || 0; 
    
    // Animate Supports (Compressing under load)
    if (animatables.hydraulicSupports) {
        animatables.hydraulicSupports.forEach((sup, i) => {
            const userData = (sup as any).userData;
            // Calculate specific load for this support based on a wave moving across face
            // Simulates uneven loading
            const localLoad = Math.sin(time * 2 + i * 0.5) * 0.2 + (pressureLevel / 100);
            
            // Canopy Compression (Visualized by lowering slightly)
            // Base Y is 1.8. Max compression lowers it to 1.6
            const targetY = userData.baseY - Math.max(0, localLoad * 0.2); 
            
            // Find canopy mesh (index 2 based on builder order)
            const canopy = sup.children[2];
            canopy.position.y = THREE.MathUtils.lerp(canopy.position.y, targetY, 0.1);

            // Legs color changes based on pressure (Blue -> Red)
            const legL = sup.children[1] as THREE.Mesh;
            
            if (localLoad > 0.8) {
               (legL.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
               (legL.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
            } else {
               (legL.material as THREE.MeshStandardMaterial).emissive.setHex(0x333333);
               (legL.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
            }
        });
    }

    // 2. Animate Roof Deformation & Stress Heatmap
    if (animatables.roofStrata) {
        const geo = animatables.roofStrata.geometry;
        const pos = geo.attributes.position;
        const col = geo.attributes.color;
        const count = pos.count;
        
        // Simulating roof sag
        // Center of the face sags most
        for(let i=0; i<count; i++) {
            const x = pos.getX(i);
            const z = pos.getY(i); // Local Y is Z world
            
            // Distance from face start
            const distZ = Math.abs(z - (-5)); // Face is at -10, roof starts slightly back
            
            // Sag Calculation
            const sag = Math.sin(x * 0.1 + time) * 0.1 + (pressureLevel/100) * 0.5 * Math.exp(-distZ * 0.1);
            
            // Vertex Coloring based on stress
            // High stress (Red) near the face line (z approx 0)
            const stress = (pressureLevel/100) * Math.exp(-Math.abs(z + 5) * 0.2) + Math.random()*0.1;
            
            const r = 0.5 + stress * 0.5;
            const g = 0.5 - stress * 0.3;
            const b = 0.5 - stress * 0.3;
            
            col.setXYZ(i, r, g, b);
        }
        col.needsUpdate = true;
    }

    // 3. Stress Particles (Fractures)
    if (animatables.stressField) {
        const mat = animatables.stressField.material as THREE.PointsMaterial;
        // Opacity increases with pressure
        mat.opacity = Math.max(0.1, (pressureLevel / 100) * 0.8);
        
        const positions = animatables.stressField.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<positions.length; i+=3) {
            positions[i+1] -= 0.05; // Fall
            if (positions[i+1] < 2) {
                positions[i+1] = 8;
            }
        }
        animatables.stressField.geometry.attributes.position.needsUpdate = true;
    }
};


import * as THREE from 'three';
import { CavitationAnimatables, CavitationSimState } from './three-types';

export const initCavitationScene = (
  group: THREE.Group, 
  animatables: CavitationAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0xa0a0a0, roughness: 0.4, metalness: 0.8, side: THREE.DoubleSide 
  });
  const damageMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });
  const bubbleMat = new THREE.PointsMaterial({ 
    color: 0xa5f3fc, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });
  const flowMat = new THREE.LineBasicMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.3 
  });

  disposables.push(steelMat, damageMat, bubbleMat, flowMat);

  // 1. Turbine Runner (Francis Type Simplified)
  const runnerGroup = new THREE.Group();
  group.add(runnerGroup);
  animatables.runnerGroup = runnerGroup;

  // Crown (Top Hub)
  const crownGeo = new THREE.CylinderGeometry(1, 2, 1, 32);
  crownGeo.translate(0, 1.5, 0);
  disposables.push(crownGeo);
  const crown = new THREE.Mesh(crownGeo, steelMat);
  runnerGroup.add(crown);

  // Band (Bottom Ring)
  const bandGeo = new THREE.CylinderGeometry(3, 3, 0.5, 32, 1, true);
  bandGeo.translate(0, -1.5, 0);
  disposables.push(bandGeo);
  const band = new THREE.Mesh(bandGeo, steelMat);
  runnerGroup.add(band);

  // Blades
  animatables.blades = [];
  const bladeCount = 9;
  for(let i=0; i<bladeCount; i++) {
      // Create a curved blade using a parametric-like approach with PlaneGeometry and vertex manipulation
      const bladeGeo = new THREE.PlaneGeometry(2, 3, 10, 10);
      const pos = bladeGeo.attributes.position;
      
      for(let j=0; j<pos.count; j++) {
          const x = pos.getX(j);
          const y = pos.getY(j);
          const z = pos.getZ(j);
          
          // Twist the blade
          const angle = (y + 1.5) * 0.5; // Twist based on height
          const newX = x * Math.cos(angle) - z * Math.sin(angle);
          const newZ = x * Math.sin(angle) + z * Math.cos(angle);
          
          // Curve it
          const curveOffset = Math.sin(x * 1.5) * 0.5;
          
          pos.setXYZ(j, newX, y, newZ + curveOffset);
      }
      bladeGeo.computeVertexNormals();
      disposables.push(bladeGeo);

      const blade = new THREE.Mesh(bladeGeo, steelMat);
      
      // Position radially
      const rot = (i / bladeCount) * Math.PI * 2;
      blade.position.set(Math.cos(rot)*2, 0, Math.sin(rot)*2);
      blade.rotation.y = -rot + Math.PI/2; // Tangential
      blade.rotation.x = 0.2; // Tilt
      
      runnerGroup.add(blade);
      animatables.blades.push(blade);
  }

  // 2. Cavitation Bubbles (Particles)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // For animation
  
  for(let i=0; i<pCount; i++) {
      // Initialize near blades
      const bladeIdx = Math.floor(Math.random() * bladeCount);
      const angle = (bladeIdx / bladeCount) * Math.PI * 2;
      const r = 1.5 + Math.random();
      
      pPos[i*3] = Math.cos(angle) * r;
      pPos[i*3+1] = (Math.random() - 0.5) * 2;
      pPos[i*3+2] = Math.sin(angle) * r;
      pLife[i] = Math.random();
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const bubbles = new THREE.Points(pGeo, bubbleMat);
  runnerGroup.add(bubbles); // Bubbles move with runner locally? No, typically flow moves through.
  // Actually, let's keep bubbles static relative to world flow, or attached to blades.
  // For 'IDLE' they shouldn't show much. For 'FLOW_SIM' they stream.
  bubbles.visible = false;
  animatables.cavitationBubbles = bubbles;

  // 3. Damage Markers (Specific Case Locations)
  const markersGroup = new THREE.Group();
  runnerGroup.add(markersGroup); // Attached to runner to rotate with it
  animatables.damageMarkers = markersGroup;

  // Create a few damage hotspots
  const damageGeo = new THREE.SphereGeometry(0.2, 8, 8);
  disposables.push(damageGeo);
  
  const createMarker = (x:number, y:number, z:number) => {
      const m = new THREE.Mesh(damageGeo, damageMat);
      m.position.set(x, y, z);
      // Add a glow
      const glow = new THREE.PointLight(0xff0000, 1, 2);
      m.add(glow);
      markersGroup.add(m);
  };
  
  // Example spots on blade edges
  createMarker(2.1, 0.5, 0); 
  createMarker(-1.5, -0.8, 1.5);
  createMarker(0, 1.0, -2.2);

  // 4. Grid Floor
  const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -3;
  group.add(grid);
};

export const animateCavitationScene = (
  animatables: CavitationAnimatables, 
  state: CavitationSimState,
  time: number
) => {
  // Rotate Runner
  if (animatables.runnerGroup) {
      const speed = state === 'IDLE' ? 0.005 : 0.05;
      animatables.runnerGroup.rotation.y -= speed;
  }

  // Particle Animation
  if (animatables.cavitationBubbles) {
      animatables.cavitationBubbles.visible = (state === 'FLOW_SIM' || state === 'DAMAGE_MAP');
      
      if (state === 'FLOW_SIM') {
          const positions = animatables.cavitationBubbles.geometry.attributes.position.array as Float32Array;
          const life = animatables.cavitationBubbles.geometry.attributes.life.array as Float32Array;
          
          for(let i=0; i<life.length; i++) {
              life[i] -= 0.02; // Decay
              
              // Move downwards and outwards simulating flow
              positions[i*3+1] -= 0.05; 
              
              if (life[i] < 0) {
                  life[i] = 1;
                  // Reset to top
                  const angle = Math.random() * Math.PI * 2;
                  const r = 1.5 + Math.random();
                  positions[i*3] = Math.cos(angle) * r;
                  positions[i*3+1] = 2; // Top
                  positions[i*3+2] = Math.sin(angle) * r;
              }
          }
          animatables.cavitationBubbles.geometry.attributes.position.needsUpdate = true;
          animatables.cavitationBubbles.geometry.attributes.life.needsUpdate = true;
      }
  }

  // Damage Marker Pulse
  if (animatables.damageMarkers) {
      animatables.damageMarkers.visible = (state === 'DAMAGE_MAP' || state === 'CASE_FOCUS');
      animatables.damageMarkers.children.forEach((marker, i) => {
          const scale = 1 + Math.sin(time * 5 + i) * 0.3;
          marker.scale.setScalar(scale);
      });
  }
};

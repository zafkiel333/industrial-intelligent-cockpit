
import * as THREE from 'three';
import { SeepageAnimatables, SeepageSimState } from './three-types';

export const initSeepageScene = (
  group: THREE.Group, 
  animatables: SeepageAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, roughness: 0.9, transparent: true, opacity: 0.3, wireframe: false 
  });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.9, opacity: 0.6, transparent: true, roughness: 0.1 
  });
  const fiberMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
  const leakMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
  
  // Custom Shader Material for Thermal Gradient (simplified via Vertex Colors here for stability)
  const thermalMat = new THREE.MeshBasicMaterial({ 
    vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });

  disposables.push(concreteMat, waterMat, fiberMat, leakMat, thermalMat);

  // 1. Dam Cross Section (Trapezoid extrusion)
  const damShape = new THREE.Shape();
  damShape.moveTo(0, 0);       // Bottom Left (Heel)
  damShape.lineTo(40, 0);      // Bottom Right (Toe)
  damShape.lineTo(25, 40);     // Top Right
  damShape.lineTo(0, 40);      // Top Left (Vertical face)
  damShape.lineTo(0, 0);

  const damGeo = new THREE.ExtrudeGeometry(damShape, { depth: 60, bevelEnabled: false });
  damGeo.center(); // Center geometry
  const dam = new THREE.Mesh(damGeo, concreteMat);
  group.add(dam);
  animatables.damBody = dam;

  // Wireframe overlay for technical look
  const edges = new THREE.EdgesGeometry(damGeo);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 }));
  dam.add(line);
  disposables.push(edges);

  // 2. Thermal Field Plane (A slice inside the dam)
  const planeGeo = new THREE.PlaneGeometry(40, 40, 20, 20);
  const count = planeGeo.attributes.position.count;
  const colors = [];
  const colorHot = new THREE.Color(0xff4400); // Red (Leak/High Temp)
  const colorCool = new THREE.Color(0x0044ff); // Blue (Water)
  const colorEarth = new THREE.Color(0x10b981); // Green (Stable)

  for (let i = 0; i < count; i++) {
     // Initial gradient
     colors.push(colorEarth.r, colorEarth.g, colorEarth.b);
  }
  planeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  disposables.push(planeGeo);
  
  const thermalPlane = new THREE.Mesh(planeGeo, thermalMat);
  thermalPlane.rotation.y = Math.PI / 2; // Slice through length
  thermalPlane.position.x = 0; // Center
  group.add(thermalPlane);
  animatables.thermalPlane = thermalPlane;

  // 3. Upstream Water
  const waterGeo = new THREE.BoxGeometry(20, 35, 60);
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(-20, 0, 0); // Left of dam
  group.add(water);
  animatables.waterUpstream = water;

  // 4. Fiber Optic Cable (DTS) - Zigzag path inside dam
  const fiberPoints = [];
  for(let i=-25; i<=25; i+=5) {
      fiberPoints.push(new THREE.Vector3(5, 5, i));
      fiberPoints.push(new THREE.Vector3(15, 15, i));
      fiberPoints.push(new THREE.Vector3(10, 30, i));
  }
  const fiberGeo = new THREE.BufferGeometry().setFromPoints(fiberPoints);
  disposables.push(fiberGeo);
  const fiber = new THREE.Line(fiberGeo, fiberMat);
  group.add(fiber);
  animatables.fiberOpticLine = fiber;

  // 5. Seepage Particles
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = -10; // Start at upstream face
      pPos[i*3+1] = Math.random() * 35 - 15; // Y range
      pPos[i*3+2] = (Math.random()-0.5) * 50; // Z range
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.3, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.seepageFlow = particles;

  // 6. Leak Indicator
  const leakGeo = new THREE.SphereGeometry(1.5, 16, 16);
  disposables.push(leakGeo);
  const leak = new THREE.Mesh(leakGeo, leakMat);
  leak.position.set(5, -5, 10); // Arbitrary location
  leak.visible = false;
  group.add(leak);
  animatables.leakPoint = leak;

  // Grid
  const grid = new THREE.GridHelper(80, 40, 0x1e293b, 0x0f172a);
  grid.position.y = -20;
  group.add(grid);
  animatables.scanGrid = grid;
};

export const animateSeepageScene = (
  animatables: SeepageAnimatables, 
  state: SeepageSimState,
  time: number
) => {
  // 1. Thermal Plane Animation (Color shifting)
  if (animatables.thermalPlane) {
      const colors = animatables.thermalPlane.geometry.attributes.color;
      const count = colors.count;
      const positions = animatables.thermalPlane.geometry.attributes.position;
      
      const colorHot = new THREE.Color(0xff2200);
      const colorCool = new THREE.Color(0x0088ff);
      const colorBase = new THREE.Color(0x059669);

      for (let i = 0; i < count; i++) {
          const x = positions.getX(i); // Local coords on plane
          const y = positions.getY(i);
          
          let targetColor = colorBase;
          
          if (state === 'THERMAL_SCAN' || state === 'INVERSION') {
              // Simulate wave of scanning
              const scanPos = Math.sin(time * 2) * 20;
              if (Math.abs(x - scanPos) < 5) {
                  targetColor = colorCool;
              }
          } 
          else if (state === 'LEAK_DETECT' || state === 'RESULT') {
              // Highlight the leak area (approx local pos on plane)
              // Leak is at World (5, -5, 10). Plane is rotated Y 90.
              // Plane X corresponds to World Z roughly, Plane Y is World Y.
              const dist = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y + 5, 2));
              if (dist < 8) {
                  targetColor = colorHot; // Hotspot at leak
              }
          }

          // Simple lerp effect (visual noise)
          const r = colors.getX(i);
          const g = colors.getY(i);
          const b = colors.getZ(i);
          
          colors.setXYZ(i, 
              r + (targetColor.r - r) * 0.05,
              g + (targetColor.g - g) * 0.05,
              b + (targetColor.b - b) * 0.05
          );
      }
      colors.needsUpdate = true;
      
      // Visibility
      animatables.thermalPlane.visible = state !== 'IDLE';
  }

  // 2. Seepage Particles
  if (animatables.seepageFlow) {
      const mat = animatables.seepageFlow.material as THREE.PointsMaterial;
      if (state === 'INVERSION' || state === 'LEAK_DETECT') {
          mat.opacity = 0.6;
          const pos = animatables.seepageFlow.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += 0.2; // Move downstream (+X)
              
              // Converge towards leak in LEAK_DETECT mode
              if (state === 'LEAK_DETECT') {
                 if (pos[i+2] > 10) pos[i+2] -= 0.1;
                 if (pos[i+2] < 10) pos[i+2] += 0.1;
                 if (pos[i+1] > -5) pos[i+1] -= 0.05;
              }

              if (pos[i] > 20) {
                  pos[i] = -10;
                  pos[i+1] = Math.random() * 35 - 15;
                  pos[i+2] = (Math.random()-0.5) * 50; 
              }
          }
          animatables.seepageFlow.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = 0;
      }
  }

  // 3. Leak Indicator
  if (animatables.leakPoint) {
      if (state === 'LEAK_DETECT' || state === 'RESULT') {
          animatables.leakPoint.visible = true;
          const s = 1 + Math.sin(time * 5) * 0.3;
          animatables.leakPoint.scale.set(s, s, s);
      } else {
          animatables.leakPoint.visible = false;
      }
  }

  // 4. Fiber Pulse
  if (animatables.fiberOpticLine) {
      (animatables.fiberOpticLine.material as THREE.LineBasicMaterial).color.setHSL((time * 0.1) % 1, 1, 0.5);
  }
};

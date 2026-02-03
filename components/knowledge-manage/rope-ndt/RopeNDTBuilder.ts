
import * as THREE from 'three';
import { RopeNDTAnimatables, DefectType } from './three-types';

export const initRopeNDTScene = (
  group: THREE.Group, 
  animatables: RopeNDTAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const ropeSteelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.6, metalness: 0.8 
  });
  const ropeRustyMat = new THREE.MeshStandardMaterial({ 
    color: 0x854d0e, roughness: 0.9, metalness: 0.2 
  });
  const scannerMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, roughness: 0.2, metalness: 0.9, emissive: 0x1e3a8a, emissiveIntensity: 0.2 
  });
  const defectMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.8, wireframe: true 
  });
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const magneticMat = new THREE.PointsMaterial({ 
    color: 0x3b82f6, size: 0.05, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending 
  });

  disposables.push(ropeSteelMat, ropeRustyMat, scannerMat, defectMat, sensorMat, magneticMat);

  // 1. Procedural Wire Rope (Helical Strands)
  const ropeGroup = new THREE.Group();
  // Rotate to be vertical for the hoist context
  ropeGroup.rotation.z = Math.PI / 2; 
  group.add(ropeGroup);
  animatables.ropeGroup = ropeGroup;
  animatables.strands = [];

  const ropeLength = 20;
  const twistFactor = 5; // How many turns
  const strandRadius = 0.4;
  const coreRadius = 0.2;
  const ropeRadius = 0.8;

  // Central Core
  const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, ropeLength, 16);
  coreGeo.rotateZ(Math.PI/2);
  disposables.push(coreGeo);
  const core = new THREE.Mesh(coreGeo, ropeSteelMat); // Usually fiber core, but visually simplified
  ropeGroup.add(core);

  // Outer Strands (6x19 style simplified)
  // We construct a helical path for each strand
  for (let i = 0; i < 6; i++) {
    const angleOffset = (i / 6) * Math.PI * 2;
    const points = [];
    const segments = 100;
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments; // 0 to 1
      const x = (t - 0.5) * ropeLength;
      const angle = t * Math.PI * 2 * twistFactor + angleOffset;
      const y = Math.cos(angle) * ropeRadius;
      const z = Math.sin(angle) * ropeRadius;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const strandGeo = new THREE.TubeGeometry(curve, 64, strandRadius, 8, false);
    disposables.push(strandGeo);
    
    const strand = new THREE.Mesh(strandGeo, ropeSteelMat.clone()); // Clone material for individual defect coloring
    strand.userData = { originalMat: ropeSteelMat }; 
    ropeGroup.add(strand);
    animatables.strands.push(strand);
  }

  // 2. MRT Scanner Ring
  const scannerGroup = new THREE.Group();
  group.add(scannerGroup);
  animatables.scannerRing = scannerGroup;

  // Housing
  const ringGeo = new THREE.CylinderGeometry(2, 2, 1.5, 32, 1, true); // Outer shell
  ringGeo.rotateZ(Math.PI/2);
  disposables.push(ringGeo);
  const ring = new THREE.Mesh(ringGeo, scannerMat);
  scannerGroup.add(ring);
  
  // Inner sensors rings
  const sensorRingGeo = new THREE.TorusGeometry(1.5, 0.1, 8, 32);
  sensorRingGeo.rotateY(Math.PI/2);
  disposables.push(sensorRingGeo);
  const sensorRing = new THREE.Mesh(sensorRingGeo, new THREE.MeshBasicMaterial({color: 0x1e293b}));
  scannerGroup.add(sensorRing);

  // Sensor Lights (Hall Effect Sensors)
  animatables.sensorLights = [];
  for(let i=0; i<8; i++) {
      const angle = (i/8) * Math.PI * 2;
      const sGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
      const sMesh = new THREE.Mesh(sGeo, sensorMat);
      sMesh.position.set(0, Math.cos(angle)*1.4, Math.sin(angle)*1.4);
      sMesh.lookAt(0,0,0);
      
      const light = new THREE.PointLight(0x22d3ee, 0, 2);
      light.position.copy(sMesh.position);
      sMesh.add(light);
      animatables.sensorLights.push(light);

      scannerGroup.add(sMesh);
  }

  // 3. Defect Visualization (Broken Wire)
  const defectGroup = new THREE.Group();
  defectGroup.visible = false;
  ropeGroup.add(defectGroup); // Moves with rope if rope moves (but here rope is static, scanner moves)
  // Actually scanner moves along X.
  // Defect positioned at x=0 for demo
  
  // Broken wires sticking out
  const wireGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
  for(let i=0; i<5; i++) {
      const w = new THREE.Mesh(wireGeo, new THREE.MeshStandardMaterial({color: 0xef4444}));
      w.position.set(0, (Math.random()-0.5)*1.5, (Math.random()-0.5)*1.5);
      w.rotation.z = Math.random();
      w.rotation.y = Math.random();
      defectGroup.add(w);
  }
  // Glow
  const defectGlow = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), defectMat);
  defectGroup.add(defectGlow);
  animatables.defectMarker = defectGroup;

  // 4. Magnetic Field Particles (Leakage Flux)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Initial random positions around scanner center
  for(let i=0; i<pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 0.8;
      pPos[i*3] = (Math.random() - 0.5) * 2; // x width of field
      pPos[i*3+1] = Math.cos(angle) * r;
      pPos[i*3+2] = Math.sin(angle) * r;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const field = new THREE.Points(pGeo, magneticMat);
  scannerGroup.add(field);
  animatables.magneticField = field;
  field.visible = false;

  // Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x050505);
  grid.position.y = -5;
  group.add(grid);
};

export const animateRopeNDT = (
  animatables: RopeNDTAnimatables, 
  state: { defectType: DefectType, scanning: boolean, scanProgress: number },
  time: number
) => {
  // 1. Scanner Movement
  if (animatables.scannerRing) {
      // Map progress 0-1 to X position -8 to 8
      const targetX = (state.scanProgress - 0.5) * 16;
      animatables.scannerRing.position.x = targetX;
      
      // Rotate scanner slightly to simulate operation
      if (state.scanning) {
          animatables.scannerRing.rotation.x = Math.sin(time * 5) * 0.05;
      }
  }

  // 2. Defect Visuals
  if (animatables.ropeGroup && animatables.strands) {
      const isDefectZone = Math.abs((state.scanProgress - 0.5) * 16) < 2; // Scanner near center (where defect is)
      
      // Update Material based on defect type
      animatables.strands.forEach(strand => {
          const mat = strand.material as THREE.MeshStandardMaterial;
          if (state.defectType === 'CORROSION') {
              mat.color.setHex(0x854d0e); // Rusty
              mat.roughness = 1.0;
          } else if (state.defectType === 'ABRASION') {
              mat.color.setHex(0xc0c0c0); // Shiny worn
              mat.roughness = 0.2;
          } else {
              mat.color.setHex(0x94a3b8); // Normal Steel
              mat.roughness = 0.6;
          }
      });

      // Specific Broken Wire Effect
      if (animatables.defectMarker) {
          animatables.defectMarker.visible = state.defectType === 'BROKEN_WIRE';
          if (animatables.defectMarker.visible) {
             animatables.defectMarker.scale.setScalar(1 + Math.sin(time * 10) * 0.1); // Pulse
          }
      }
  }

  // 3. Sensor & Field Effects
  if (animatables.sensorLights) {
      const isDetecting = Math.abs((state.scanProgress - 0.5) * 16) < 1.5 && state.defectType !== 'NORMAL';
      
      animatables.sensorLights.forEach((light, i) => {
          if (state.scanning) {
              // Idle blink
              light.intensity = 0.5 + Math.sin(time * 10 + i) * 0.5;
              // Alert flash
              if (isDetecting) {
                  light.color.setHex(0xff0000);
                  light.intensity = 2 + Math.sin(time * 30) * 2;
              } else {
                  light.color.setHex(0x22d3ee);
              }
          } else {
              light.intensity = 0;
          }
      });

      if (animatables.magneticField) {
          animatables.magneticField.visible = isDetecting && state.scanning;
          if (animatables.magneticField.visible) {
              const pos = animatables.magneticField.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pos.length/3; i++) {
                  // Agitate particles
                  pos[i*3] += (Math.random()-0.5) * 0.1;
                  // Reset if drift too far
                  if (Math.abs(pos[i*3]) > 2) pos[i*3] = 0;
              }
              animatables.magneticField.geometry.attributes.position.needsUpdate = true;
          }
      }
  }
};

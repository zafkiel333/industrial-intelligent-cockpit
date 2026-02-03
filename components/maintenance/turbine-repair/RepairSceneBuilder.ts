
import * as THREE from 'three';
// @ts-ignore
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { RepairAnimatables, RepairStep } from './three-types';

export const initRepairScene = (
  group: THREE.Group, 
  animatables: RepairAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, 
    roughness: 0.3, 
    metalness: 0.8,
    side: THREE.DoubleSide
  });
  const roughSteelMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, 
    roughness: 0.8, 
    metalness: 0.4 
  });
  const robotMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
  const scanMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });

  disposables.push(steelMat, roughSteelMat, robotMat, laserMat, scanMat);

  // 1. Turbine Blade Segment (Curved Surface)
  // Simulate a section of a Francis runner blade
  const bladeGeo = new ParametricGeometry((u: number, v: number, target: THREE.Vector3) => {
      const x = (u - 0.5) * 10;
      const z = (v - 0.5) * 10;
      const y = Math.sin(u * Math.PI) * 2 + Math.cos(v * Math.PI) * 2;
      target.set(x, y, z);
  }, 20, 20);
  disposables.push(bladeGeo);
  const blade = new THREE.Mesh(bladeGeo, steelMat);
  blade.position.y = -2;
  blade.receiveShadow = true;
  group.add(blade);
  animatables.bladeSegment = blade;

  // 2. Cavitation Damage (Pits)
  const damageGroup = new THREE.Group();
  blade.add(damageGroup);
  animatables.damagePoints = damageGroup;

  const pitGeo = new THREE.SphereGeometry(0.2, 8, 8);
  disposables.push(pitGeo);
  const pitMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1.0 });
  disposables.push(pitMat);

  // Scatter pits in a specific "erosion zone"
  for(let i=0; i<30; i++) {
      const pit = new THREE.Mesh(pitGeo, pitMat);
      // Random position near center
      const u = 0.3 + Math.random() * 0.4;
      const v = 0.3 + Math.random() * 0.4;
      
      // Calculate position on surface
      const x = (u - 0.5) * 10;
      const z = (v - 0.5) * 10;
      const y = Math.sin(u * Math.PI) * 2 + Math.cos(v * Math.PI) * 2;
      
      // Perturb normal to look like a pit
      pit.position.set(x, y + 0.1, z);
      pit.scale.y = 0.5;
      damageGroup.add(pit);
  }

  // 3. Robotic Arm (Simplified 3-axis)
  const robotGroup = new THREE.Group();
  robotGroup.position.set(5, 0, -5);
  group.add(robotGroup);
  animatables.robotArmGroup = robotGroup;

  // Base
  const baseGeo = new THREE.CylinderGeometry(1, 1.5, 1, 16);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, robotMat);
  robotGroup.add(base);

  // Joint 1 (Shoulder)
  const joint1Group = new THREE.Group();
  joint1Group.position.y = 1;
  robotGroup.add(joint1Group);
  animatables.robotJoint1 = joint1Group;

  const arm1Geo = new THREE.BoxGeometry(1, 4, 1);
  arm1Geo.translate(0, 2, 0);
  disposables.push(arm1Geo);
  const arm1 = new THREE.Mesh(arm1Geo, robotMat);
  joint1Group.add(arm1);

  // Joint 2 (Elbow)
  const joint2Group = new THREE.Group();
  joint2Group.position.y = 4;
  joint1Group.add(joint2Group);
  animatables.robotJoint2 = joint2Group;

  const arm2Geo = new THREE.BoxGeometry(0.8, 4, 0.8);
  arm2Geo.translate(0, 2, 0); // Pivot at bottom
  arm2Geo.rotateZ(Math.PI/2); // Horizontal initially
  disposables.push(arm2Geo);
  const arm2 = new THREE.Mesh(arm2Geo, robotMat);
  joint2Group.add(arm2);

  // Head (End Effector)
  const headGeo = new THREE.ConeGeometry(0.3, 1, 16);
  headGeo.rotateX(Math.PI);
  headGeo.translate(-4, 0, 0); // Position at end of arm2
  disposables.push(headGeo);
  const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  joint2Group.add(head);
  animatables.robotHead = head;

  // 4. Laser Beam / Tool Effect
  const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 3);
  beamGeo.translate(-4, -1.5, 0);
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  beam.visible = false;
  joint2Group.add(beam);
  animatables.laserBeam = beam;

  // 5. Sparks (Particles)
  const pGeo = new THREE.BufferGeometry();
  const pCount = 50;
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.15, transparent: true });
  disposables.push(pGeo, pMat);
  const sparks = new THREE.Points(pGeo, pMat);
  joint2Group.add(sparks);
  animatables.weldSparks = sparks;
  sparks.visible = false;

  // 6. Scan Grid (Projected light)
  const gridHelper = new THREE.GridHelper(4, 10, 0x22d3ee, 0x22d3ee);
  gridHelper.position.set(0, 0, 0); // Center of blade roughly
  gridHelper.visible = false;
  group.add(gridHelper);
  animatables.scanGrid = gridHelper;
};

export const animateRepairScene = (
  animatables: RepairAnimatables, 
  step: RepairStep, 
  time: number
) => {
  // Robot Movement Logic (Inverse Kinematics faked)
  // Target moves in a raster pattern over the damage zone
  const targetX = Math.sin(time * 0.5) * 2;
  const targetZ = Math.cos(time * 0.5) * 2;
  
  if (animatables.robotJoint1) {
      animatables.robotJoint1.rotation.y = Math.sin(time * 0.2) * 0.5 + Math.PI/4;
  }
  if (animatables.robotJoint2) {
      animatables.robotJoint2.rotation.z = Math.sin(time * 0.5) * 0.2 - 0.5;
  }

  // Step Specific Visuals
  if (step === 'SCANNING') {
      if (animatables.scanGrid) {
          animatables.scanGrid.visible = true;
          animatables.scanGrid.position.y = -1 + Math.sin(time * 2) * 0.5; // Scan line moving up/down
      }
      if (animatables.laserBeam) animatables.laserBeam.visible = false;
      if (animatables.weldSparks) animatables.weldSparks.visible = false;
  } 
  else if (step === 'WELDING') {
      if (animatables.scanGrid) animatables.scanGrid.visible = false;
      if (animatables.laserBeam) {
          animatables.laserBeam.visible = true;
          (animatables.laserBeam.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);
      }
      if (animatables.weldSparks) {
          animatables.weldSparks.visible = true;
          if (animatables.weldSparks.geometry.attributes.position) {
            const positions = animatables.weldSparks.geometry.attributes.position.array as Float32Array;
            // Emitter at tool tip (-4, 0, 0) relative to joint2
            for(let i=0; i<positions.length/3; i++) {
                positions[i*3] = -4 + (Math.random()-0.5)*0.5;
                positions[i*3+1] = (Math.random()-0.5)*0.5 - 2; // Downwards
                positions[i*3+2] = (Math.random()-0.5)*0.5;
            }
            animatables.weldSparks.geometry.attributes.position.needsUpdate = true;
          }
      }
      // Fill pits slowly
      if (animatables.damagePoints) {
          animatables.damagePoints.children.forEach((pit) => {
              if (Math.random() > 0.99) pit.visible = false; // "Repaired"
          });
      }
  }
  else if (step === 'GRINDING') {
      if (animatables.laserBeam) animatables.laserBeam.visible = false; // Grinder head touches directly
      if (animatables.weldSparks) {
          animatables.weldSparks.visible = true;
          (animatables.weldSparks.material as THREE.PointsMaterial).color.setHex(0xffffff); // White sparks
          // ... particle logic similar to welding
          if (animatables.weldSparks.geometry.attributes.position) {
              const positions = animatables.weldSparks.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<positions.length/3; i++) {
                positions[i*3] = -4 + (Math.random()-0.5)*0.5;
                positions[i*3+1] = (Math.random()-0.5)*0.5 - 2; // Downwards
                positions[i*3+2] = (Math.random()-0.5)*0.5;
              }
              animatables.weldSparks.geometry.attributes.position.needsUpdate = true;
          }
      }
  }
  else {
      // Idle / Inspect
      if (animatables.scanGrid) animatables.scanGrid.visible = false;
      if (animatables.laserBeam) animatables.laserBeam.visible = false;
      if (animatables.weldSparks) animatables.weldSparks.visible = false;
      // Reset pits visibility for loop
      if (step === 'INSPECT' && Math.random() > 0.99 && animatables.damagePoints) {
           // Maybe highlight the repaired area
      }
  }
};


import * as THREE from 'three';
import { RobotAnimatables, RobotSimState } from './three-types';

export const initRobotScene = (
  group: THREE.Group, 
  animatables: RobotAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.9, bumpScale: 0.2 
  });
  const rovMat = new THREE.MeshStandardMaterial({ 
    color: 0xfacc15, roughness: 0.4, metalness: 0.6 
  }); // Yellow Submarine style
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x00ffff, transmission: 0.9, opacity: 0.3, transparent: true 
  });
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00, transparent: true, opacity: 0.1, side: THREE.DoubleSide, wireframe: true 
  });
  const particulateMat = new THREE.PointsMaterial({
    color: 0xa5f3fc, size: 0.05, transparent: true, opacity: 0.4
  });

  disposables.push(concreteMat, rovMat, metalMat, glassMat, scanMat, particulateMat);

  // 1. Dam Structure (The Wall)
  const damGeo = new THREE.BoxGeometry(40, 30, 5);
  damGeo.translate(0, 5, -10); // Background wall
  disposables.push(damGeo);
  const dam = new THREE.Mesh(damGeo, concreteMat);
  group.add(dam);

  // Intake Tower feature
  const towerGeo = new THREE.CylinderGeometry(3, 4, 20, 16, 1, false, 0, Math.PI);
  disposables.push(towerGeo);
  const tower = new THREE.Mesh(towerGeo, concreteMat);
  tower.position.set(-8, 0, -8);
  tower.rotation.y = -Math.PI/2; // Half cylinder sticking out
  group.add(tower);

  // Trash Rack (Grating)
  const rackGeo = new THREE.BoxGeometry(4, 8, 0.5);
  const rack = new THREE.Mesh(rackGeo, new THREE.MeshStandardMaterial({color: 0x0f172a, wireframe: true}));
  rack.position.set(-8, -2, -6); // In front of tower
  group.add(rack);

  // 2. The ROV (Remotely Operated Vehicle)
  const rovGroup = new THREE.Group();
  rovGroup.position.set(0, 0, 0);
  group.add(rovGroup);
  animatables.rovGroup = rovGroup;

  // Frame
  const frameGeo = new THREE.BoxGeometry(2, 1.2, 3);
  disposables.push(frameGeo);
  const chassis = new THREE.Mesh(frameGeo, rovMat);
  rovGroup.add(chassis);

  // Camera Dome
  const domeGeo = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  domeGeo.rotateX(Math.PI/2);
  disposables.push(domeGeo);
  const dome = new THREE.Mesh(domeGeo, glassMat);
  dome.position.set(0, 0.2, 1.5);
  rovGroup.add(dome);

  // Thrusters (4 vertical, 2 horizontal)
  animatables.propellers = [];
  const propGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
  const bladeGeo = new THREE.BoxGeometry(0.5, 0.05, 0.1);
  disposables.push(propGeo, bladeGeo);

  const addThruster = (x: number, y: number, z: number, axis: 'y'|'z') => {
      const tGroup = new THREE.Group();
      tGroup.position.set(x, y, z);
      if (axis === 'z') tGroup.rotation.x = Math.PI/2;
      
      const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16, 1, true), metalMat);
      tGroup.add(shroud);

      const prop = new THREE.Mesh(bladeGeo, metalMat);
      tGroup.add(prop);
      animatables.propellers!.push(prop);
      
      rovGroup.add(tGroup);
  };

  addThruster(-1.2, 0, 1, 'y');
  addThruster(1.2, 0, 1, 'y');
  addThruster(-1.2, 0, -1, 'y');
  addThruster(1.2, 0, -1, 'y');
  addThruster(-1.2, -0.5, 0, 'z'); // Horizontal
  addThruster(1.2, -0.5, 0, 'z');

  // Spotlights
  animatables.spotlights = [];
  [-0.6, 0.6].forEach(x => {
      const spot = new THREE.SpotLight(0xffffff, 5, 20, 0.5, 0.5, 1);
      spot.position.set(x, 0.5, 1.4);
      spot.target.position.set(x, 0, 10);
      rovGroup.add(spot);
      rovGroup.add(spot.target);
      animatables.spotlights!.push(spot);
      
      // Visual bulb
      const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xffffff}));
      bulb.position.set(x, 0.5, 1.51);
      rovGroup.add(bulb);
  });

  // Tether (Umbilical) - Visual only line for now
  const tetherMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const tetherPoints = [new THREE.Vector3(0, 0.6, -1.5), new THREE.Vector3(0, 20, -5)];
  const tetherGeo = new THREE.BufferGeometry().setFromPoints(tetherPoints);
  const tether = new THREE.Line(tetherGeo, tetherMat);
  rovGroup.add(tether); // Attached to ROV
  animatables.tether = tether;

  // Scan Cone (Laser/Sonar visual)
  const coneGeo = new THREE.ConeGeometry(2, 5, 4, 1, true);
  coneGeo.rotateX(-Math.PI/2);
  coneGeo.rotateZ(Math.PI/4); // Diamond shape
  const scanCone = new THREE.Mesh(coneGeo, scanMat);
  scanCone.position.set(0, 0, 1.5);
  scanCone.visible = false;
  rovGroup.add(scanCone);
  animatables.scanCone = scanCone;

  // 3. Environmental Particulates (Marine Snow)
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 30;
      pPos[i*3+1] = (Math.random() - 0.5) * 30;
      pPos[i*3+2] = (Math.random() - 0.5) * 30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, particulateMat);
  group.add(particles);
  animatables.particles = particles;
};

export const animateRobotScene = (
  animatables: RobotAnimatables, 
  state: RobotSimState,
  time: number
) => {
  // 1. ROV Movement Logic
  if (animatables.rovGroup) {
      // Idle Hover
      let targetY = Math.sin(time) * 0.2;
      let targetX = 0;
      let targetZ = 0;
      let targetRotY = 0;

      if (state === 'SCANNING') {
          targetX = Math.sin(time * 0.5) * 4; // Sweep left right
          targetRotY = Math.sin(time * 0.5) * 0.2;
      } 
      else if (state === 'INSPECTING') {
          targetZ = 2; // Move closer
          targetX = -5; // Move to specific feature
          targetRotY = 0.5; // Look at feature
      }
      else if (state === 'DIVING') {
          targetY = 10 - (time % 10) * 2; // Fall
          if (targetY < 0) targetY = 0;
      }

      // Lerp position
      animatables.rovGroup.position.y = THREE.MathUtils.lerp(animatables.rovGroup.position.y, targetY, 0.05);
      animatables.rovGroup.position.x = THREE.MathUtils.lerp(animatables.rovGroup.position.x, targetX, 0.05);
      animatables.rovGroup.position.z = THREE.MathUtils.lerp(animatables.rovGroup.position.z, targetZ, 0.05);
      animatables.rovGroup.rotation.y = THREE.MathUtils.lerp(animatables.rovGroup.rotation.y, targetRotY, 0.05);
      
      // Update tether end point in world space (simplified: just stretches up)
      if (animatables.tether) {
         // In a real physics sim, we'd update geometry. Here we assume it stays stiff relative to ROV
      }
  }

  // 2. Props
  if (animatables.propellers) {
      animatables.propellers.forEach(p => {
          p.rotation.y += 0.5; // Always spinning a bit to maintain position
      });
  }

  // 3. Scan Effect
  if (animatables.scanCone) {
      animatables.scanCone.visible = state === 'SCANNING' || state === 'INSPECTING';
      if (animatables.scanCone.visible) {
          animatables.scanCone.rotation.z += 0.05;
          (animatables.scanCone.material as THREE.Material).opacity = 0.1 + Math.sin(time * 10) * 0.05;
      }
  }

  // 4. Particles Drift
  if (animatables.particles) {
      // Rotate entire particle field slowly
      animatables.particles.rotation.y = time * 0.05;
  }
};

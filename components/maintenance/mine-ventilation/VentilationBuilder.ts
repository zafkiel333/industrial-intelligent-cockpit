
import * as THREE from 'three';
import { VentilationAnimatables, VentilationSimState } from './three-types';

export const initVentilationScene = (
  group: THREE.Group, 
  animatables: VentilationAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const housingMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide
  }); // Dark Grey Housing
  const bladeMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, roughness: 0.3, metalness: 0.6 
  }); // Yellow Blades (High visibility)
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, roughness: 0.9 
  });
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, roughness: 0.9 
  });
  const highlightMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.5 
  });
  const airMat = new THREE.PointsMaterial({ 
    color: 0x22d3ee, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });

  disposables.push(housingMat, bladeMat, floorMat, concreteMat, highlightMat, airMat);

  // 1. Environment (Fan Station Floor)
  const floorGeo = new THREE.PlaneGeometry(30, 20);
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(0, -2, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  group.add(floor);

  // 2. Main Fan Housing (Cylindrical with removable top)
  const housingGroup = new THREE.Group();
  group.add(housingGroup);

  // Bottom half (Fixed)
  const bottomShellGeo = new THREE.CylinderGeometry(3.2, 3.2, 4, 32, 1, true, 0, Math.PI);
  bottomShellGeo.rotateZ(Math.PI / 2);
  bottomShellGeo.rotateX(Math.PI); // Flip to be bottom cup
  disposables.push(bottomShellGeo);
  const bottomShell = new THREE.Mesh(bottomShellGeo, housingMat);
  bottomShell.position.y = 0;
  housingGroup.add(bottomShell);

  // Support Legs
  const legGeo = new THREE.BoxGeometry(0.5, 2, 4);
  disposables.push(legGeo);
  const legL = new THREE.Mesh(legGeo, concreteMat); legL.position.set(-3.5, -1, 0);
  const legR = new THREE.Mesh(legGeo, concreteMat); legR.position.set(3.5, -1, 0);
  housingGroup.add(legL, legR);

  // Top half (Removable Casing)
  const topShellGeo = new THREE.CylinderGeometry(3.2, 3.2, 4, 32, 1, true, 0, Math.PI);
  topShellGeo.rotateZ(Math.PI / 2);
  disposables.push(topShellGeo);
  const topShell = new THREE.Mesh(topShellGeo, housingMat);
  
  // Flanges on top shell
  const flangeGeo = new THREE.BoxGeometry(4.2, 0.2, 6.6); // Approximate box for visual weight
  disposables.push(flangeGeo);
  
  const casingGroup = new THREE.Group();
  casingGroup.add(topShell);
  casingGroup.position.y = 0; // Starts closed
  housingGroup.add(casingGroup);
  animatables.casingTop = casingGroup;

  // 3. Rotor Assembly (Fan Blades)
  const rotorGroup = new THREE.Group();
  group.add(rotorGroup);
  animatables.fanRotor = rotorGroup;

  // Hub
  const hubGeo = new THREE.CylinderGeometry(1, 1, 1.5, 16);
  hubGeo.rotateZ(Math.PI / 2);
  disposables.push(hubGeo);
  const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  rotorGroup.add(hub);

  // Blades
  const bladeGeo = new THREE.BoxGeometry(0.2, 2.2, 0.8);
  // Twist modifier simulation by rotating individual blades
  disposables.push(bladeGeo);
  const bladeCount = 12;
  for(let i=0; i<bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      
      // Position around hub
      blade.position.y = Math.cos(angle) * 1.8;
      blade.position.z = Math.sin(angle) * 1.8;
      
      // Orient outwards
      blade.lookAt(0, Math.cos(angle)*5, Math.sin(angle)*5);
      
      // Twist for aerodynamic look
      blade.rotateX(0.5); 
      
      rotorGroup.add(blade);
  }

  // 4. Motor & Shaft
  const motorGeo = new THREE.BoxGeometry(2.5, 2.5, 3);
  motorGeo.translate(4, 0, 0); // Behind the fan
  disposables.push(motorGeo);
  const motor = new THREE.Mesh(motorGeo, housingMat);
  group.add(motor);

  const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 4);
  shaftGeo.rotateZ(Math.PI / 2);
  shaftGeo.translate(2, 0, 0);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({color: 0x888888}));
  group.add(shaft);

  // 5. Diffuser (Output Cone)
  const diffGeo = new THREE.CylinderGeometry(4.5, 3.2, 6, 32, 1, true);
  diffGeo.rotateZ(Math.PI / 2);
  diffGeo.translate(-5, 0, 0); // Output side
  disposables.push(diffGeo);
  const diffuser = new THREE.Mesh(diffGeo, housingMat);
  group.add(diffuser);
  animatables.diffuser = diffuser;

  // 6. Airflow Particles
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount); // Individual speed variance

  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 20; // X spread (flow direction)
      // Random position in circle Y/Z
      const r = Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      pPos[i*3+1] = r * Math.cos(theta);
      pPos[i*3+2] = r * Math.sin(theta);
      
      pSpeed[i] = 0.2 + Math.random() * 0.3;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeed, 1));
  
  const particles = new THREE.Points(pGeo, airMat);
  group.add(particles);
  animatables.airParticles = particles;

  // 7. Vibration Alarm Icon
  const spriteMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png');
  const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xff0000, transparent: true, opacity: 0 });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2, 2, 1);
  sprite.position.set(0, 3.5, 0);
  group.add(sprite);
  animatables.vibrationIcon = sprite;
};

export const animateVentilationScene = (
  animatables: VentilationAnimatables, 
  state: VentilationSimState,
  time: number
) => {
  // 1. Fan Rotation
  if (animatables.fanRotor) {
      let speed = 0;
      if (state === 'RUNNING') speed = 0.8;
      else if (state === 'SURGE_ALARM') speed = 0.8 + Math.sin(time * 20) * 0.1; // Erratic speed
      else if (state === 'STOP_BRAKE') speed = Math.max(0, 0.8 - (time % 10) * 0.1); // Decelerate
      else if (state === 'REVERSE_WIND') speed = -0.6; // Reverse
      else if (state === 'CLOSE_TEST') speed = 0.3; // Low speed testing
      else speed = 0; // Maintenance modes

      animatables.fanRotor.rotation.x -= speed;
      
      // Surge Wobble
      if (state === 'SURGE_ALARM') {
          animatables.fanRotor.position.y = Math.sin(time * 50) * 0.05;
          animatables.fanRotor.position.z = Math.cos(time * 50) * 0.05;
      } else {
          animatables.fanRotor.position.y = 0;
          animatables.fanRotor.position.z = 0;
      }
  }

  // 2. Airflow Particles
  if (animatables.airParticles && animatables.airParticles.geometry.attributes.position) {
      const positions = animatables.airParticles.geometry.attributes.position.array as Float32Array;
      const speeds = animatables.airParticles.geometry.attributes.speed.array as Float32Array;
      const mat = animatables.airParticles.material as THREE.PointsMaterial;
      
      let dir = -1; // Standard flow: Right to Left (positive X to negative X)
      // Actually my setup: Diffuser at -5 (Output). Motor at +4. Fan at 0. 
      // Flow usually Motor -> Fan -> Diffuser (Suction) or vice versa.
      // Let's assume flow is +X to -X (Suction from +X).
      
      if (state === 'REVERSE_WIND') {
          dir = 1; 
          mat.color.setHex(0xf59e0b); // Orange flow
          mat.opacity = 0.6;
      } else if (state === 'SURGE_ALARM') {
          dir = -1 * (1 + Math.sin(time*10)*0.5); // Pulsing flow
          mat.color.setHex(0xffffff); // Turbulent white
          mat.opacity = 0.6;
      } else if (state === 'RUNNING') {
          dir = -1;
          mat.color.setHex(0x22d3ee); // Cyan
          mat.opacity = 0.6;
      } else if (state === 'CLOSE_TEST') {
          dir = -1;
          mat.color.setHex(0x22d3ee);
          mat.opacity = 0.3; // Light flow
      } else {
          dir = 0; // Stopped
          mat.opacity = 0;
      }

      for(let i=0; i<positions.length/3; i++) {
          positions[i*3] += dir * speeds[i];
          
          // Reset particles
          if (positions[i*3] < -10) positions[i*3] = 10;
          if (positions[i*3] > 10) positions[i*3] = -10;
          
          // Surge effect: expand radius randomly
          if (state === 'SURGE_ALARM') {
              const r = Math.sqrt(positions[i*3+1]**2 + positions[i*3+2]**2);
              if (r < 2.5) {
                  positions[i*3+1] *= 1.01;
                  positions[i*3+2] *= 1.01;
              }
          }
      }
      animatables.airParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Maintenance Animation (Casing Lift)
  if (animatables.casingTop) {
      if (state === 'OPEN_CASING' || state === 'BLADE_REPAIR') {
          // Lift up and move aside
          const targetY = 3;
          const targetZ = -3;
          animatables.casingTop.position.y = THREE.MathUtils.lerp(animatables.casingTop.position.y, targetY, 0.05);
          animatables.casingTop.position.z = THREE.MathUtils.lerp(animatables.casingTop.position.z, targetZ, 0.05);
      } else {
          // Reset
          animatables.casingTop.position.y = THREE.MathUtils.lerp(animatables.casingTop.position.y, 0, 0.1);
          animatables.casingTop.position.z = THREE.MathUtils.lerp(animatables.casingTop.position.z, 0, 0.1);
      }
  }

  // 4. Alarm Indicator
  if (animatables.vibrationIcon) {
      if (state === 'SURGE_ALARM') {
          animatables.vibrationIcon.material.opacity = Math.sin(time * 15) * 0.5 + 0.5;
      } else {
          animatables.vibrationIcon.material.opacity = 0;
      }
  }
};

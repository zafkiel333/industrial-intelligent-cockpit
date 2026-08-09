
import * as THREE from 'three';
import { TireAnimatables, RoadSurfaceType, ViewMode } from './three-types';

export const initTireScene = (
  group: THREE.Group, 
  animatables: TireAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const rubberMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, roughness: 0.9, metalness: 0.1, flatShading: false
  });
  
  const rimMat = new THREE.MeshStandardMaterial({ 
    color: 0xfacc15, roughness: 0.4, metalness: 0.6 // Caterpillar Yellow ish
  });

  const roadMat = new THREE.MeshStandardMaterial({ 
    color: 0x3f3f46, roughness: 1.0 
  });

  const thermalMat = new THREE.MeshBasicMaterial({ 
    vertexColors: true 
  }); // 用于热力图模式

  disposables.push(rubberMat, rimMat, roadMat, thermalMat);

  // 1. 巨型轮胎 (Giant Tire)
  const tireGroup = new THREE.Group();
  tireGroup.position.y = 2.5; // 半径2.5米
  group.add(tireGroup);
  animatables.tireGroup = tireGroup;

  // 胎体 (Torus-like shape using Cylinder)
  const tireRadius = 2.5;
  const tireWidth = 1.8;
  const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 64, 1, false);
  tireGeo.rotateZ(Math.PI / 2);
  disposables.push(tireGeo);
  const tireMesh = new THREE.Mesh(tireGeo, rubberMat);
  tireGroup.add(tireMesh);
  animatables.treadMesh = tireMesh;

  // 胎纹 (Treads - Chunky blocks)
  const treadCount = 24;
  const treadGeo = new THREE.BoxGeometry(0.8, tireWidth - 0.2, 0.2);
  disposables.push(treadGeo);
  
  for(let i=0; i<treadCount; i++) {
      const angle = (i / treadCount) * Math.PI * 2;
      const tread = new THREE.Mesh(treadGeo, rubberMat);
      
      // Position on surface
      tread.position.x = Math.cos(angle) * tireRadius;
      tread.position.y = Math.sin(angle) * tireRadius;
      
      // Rotation
      tread.rotation.z = angle;
      
      // Chevron pattern offset
      if (i % 2 === 0) tread.position.z = 0.2;
      else tread.position.z = -0.2;

      tireGroup.add(tread);
  }

  // 轮毂 (Rim)
  const rimRadius = 1.2;
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, tireWidth + 0.1, 32);
  rimGeo.rotateZ(Math.PI / 2);
  disposables.push(rimGeo);
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  tireGroup.add(rimMesh);
  animatables.rimMesh = rimMesh;

  // 轮毂螺栓细节
  const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2);
  boltGeo.rotateZ(Math.PI/2);
  for(let i=0; i<12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({color: 0xcccccc}));
      bolt.position.set(Math.cos(angle)*0.8, Math.sin(angle)*0.8, tireWidth/2 + 0.1);
      tireGroup.add(bolt);
  }

  // 2. 动态路面 (Scrolling Road)
  const roadGeo = new THREE.PlaneGeometry(10, 40, 20, 40);
  roadGeo.rotateX(-Math.PI / 2);
  disposables.push(roadGeo);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.position.y = 0;
  group.add(road);
  animatables.roadBed = road;

  // 3. 扬尘/碎石粒子
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 4;
      pPos[i*3+1] = Math.random() * 2;
      pPos[i*3+2] = (Math.random()-0.5) * 4 + 2; // Behind tire
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ 
      color: 0x8b7e66, size: 0.1, transparent: true, opacity: 0 
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.particles = particles;

  // 4. 热力光晕 (Thermal Glow)
  const spriteMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png');
  const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xff4500, transparent: true, opacity: 0 });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(6, 6, 1);
  sprite.position.copy(tireGroup.position);
  group.add(sprite);
  animatables.heatAura = sprite;
};

export const animateTireScene = (
  animatables: TireAnimatables, 
  surface: RoadSurfaceType,
  viewMode: ViewMode,
  speed: number, // km/h scaled
  time: number
) => {
  const rotSpeed = speed * 0.1;

  // 1. Tire Rotation
  if (animatables.tireGroup) {
      animatables.tireGroup.rotation.z -= rotSpeed;
      
      // Vibration based on road type
      let vibY = 0;
      let vibZ = 0;
      if (surface === 'GRAVEL') {
          vibY = Math.sin(time * 50) * 0.05;
      } else if (surface === 'HARD_ROCK') {
          vibY = (Math.random() - 0.5) * 0.15; // Sharp bumps
          vibZ = (Math.random() - 0.5) * 0.05;
      } else if (surface === 'MUDDY') {
          vibY = Math.sin(time * 10) * 0.02; // Slow wallow
      }
      animatables.tireGroup.position.y = 2.5 + vibY;
      animatables.tireGroup.position.z = vibZ;
  }

  // 2. Road Scrolling Effect (Vertex manipulation)
  if (animatables.roadBed) {
      const pos = animatables.roadBed.geometry.attributes.position;
      const count = pos.count;
      for(let i=0; i<count; i++) {
          const z = pos.getZ(i); // Local Y is Z in world due to rotation
          // Reset if passed
          let newZ = z + speed * 10; 
          // In PlaneGeometry, Z is actually Y coordinate locally before rotation
          // Let's assume standard UV scroll simulation via noise offset or just vertex wave
          // Simplified: Just update roughness based on type visually
      }
      
      // Update material roughness/color based on type
      const mat = animatables.roadBed.material as THREE.MeshStandardMaterial;
      if (surface === 'GRAVEL') {
          mat.color.setHex(0x57534e);
          mat.roughness = 1.0;
      } else if (surface === 'HARD_ROCK') {
          mat.color.setHex(0x27272a);
          mat.roughness = 0.6;
      } else if (surface === 'MUDDY') {
          mat.color.setHex(0x3f2e18);
          mat.roughness = 0.4; // Wet
      } else {
          mat.color.setHex(0x3f3f46);
          mat.roughness = 0.8;
      }
  }

  // 3. View Mode Logic
  if (animatables.treadMesh) {
      const mat = animatables.treadMesh.material as THREE.MeshStandardMaterial;
      if (viewMode === 'THERMAL') {
          mat.emissive.setHex(0xff0000);
          // Intensity based on speed
          mat.emissiveIntensity = Math.min(1, speed * 2) * (0.5 + Math.sin(time * 5)*0.1);
      } else if (viewMode === 'WEAR_MAP') {
          mat.emissive.setHex(0x00ff00); // Green = Good, Red = Bad (Simulated via color)
          mat.emissiveIntensity = 0;
          mat.color.setHex(0x555555); // Worn grey
      } else {
          mat.emissiveIntensity = 0;
          mat.color.setHex(0x1a1a1a);
      }
  }

  // 4. Heat Aura
  if (animatables.heatAura) {
      if (viewMode === 'THERMAL') {
          animatables.heatAura.material.opacity = Math.min(0.6, speed * 0.5);
      } else {
          animatables.heatAura.material.opacity = 0;
      }
  }

  // 5. Particles (Dust)
  if (animatables.particles) {
      const pMat = animatables.particles.material as THREE.PointsMaterial;
      if (speed > 0.1) {
          pMat.opacity = surface === 'HARD_ROCK' ? 0.2 : 0.6; // Less dust on rock
          const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+2] += speed * 5; // Move back relative to tire
              pos[i+1] += Math.random() * 0.1; // Rise
              if (pos[i+2] > 10) {
                  pos[i+2] = -2; // Reset near tire
                  pos[i+1] = 0;
                  pos[i] = (Math.random()-0.5) * 4;
              }
          }
          animatables.particles.geometry.attributes.position.needsUpdate = true;
      } else {
          pMat.opacity = 0;
      }
  }
};

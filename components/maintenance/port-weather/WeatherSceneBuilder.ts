
import * as THREE from 'three';
import { WeatherAnimatables, WeatherType } from './three-types';

export const initWeatherScene = (
  group: THREE.Group, 
  animatables: WeatherAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const structureMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.6, opacity: 0.6, transparent: true, roughness: 0.1 
  });
  const rainMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });

  disposables.push(structureMat, quayMat, waterMat, rainMat);

  // 1. Port Base (Quay)
  const quay = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 20), quayMat);
  quay.position.y = -1;
  group.add(quay);

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), waterMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.1;
  group.add(sea);

  // 2. STS Crane (Simplified)
  const crane = new THREE.Group();
  crane.position.set(0, 0, -2);
  group.add(crane);
  animatables.craneGroup = crane;

  const legGeo = new THREE.BoxGeometry(1, 15, 1);
  const leg1 = new THREE.Mesh(legGeo, structureMat); leg1.position.set(-4, 7.5, 3); crane.add(leg1);
  const leg2 = new THREE.Mesh(legGeo, structureMat); leg2.position.set(4, 7.5, 3); crane.add(leg2);
  const leg3 = new THREE.Mesh(legGeo, structureMat); leg3.position.set(-4, 7.5, -3); crane.add(leg3);
  const leg4 = new THREE.Mesh(legGeo, structureMat); leg4.position.set(4, 7.5, -3); crane.add(leg4);

  const boom = new THREE.Mesh(new THREE.BoxGeometry(25, 1.2, 2), structureMat);
  boom.position.y = 15;
  crane.add(boom);

  // 3. Rain Particle System
  const rCount = 3000;
  const rGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array(rCount * 3);
  for(let i=0; i<rCount; i++) {
      rPos[i*3] = (Math.random()-0.5)*40;
      rPos[i*3+1] = Math.random()*20;
      rPos[i*3+2] = (Math.random()-0.5)*40;
  }
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  const rain = new THREE.Points(rGeo, rainMat);
  rain.visible = false;
  group.add(rain);
  animatables.rainParticles = rain;

  // 4. Status Beacon
  const beacon = new THREE.PointLight(0xf97316, 0, 10);
  beacon.position.set(0, 16, 0);
  group.add(beacon);
  animatables.statusLight = beacon;

  // 5. Environmental Grid
  const grid = new THREE.GridHelper(60, 20, 0x1e3a8a, 0x0f172a);
  grid.position.y = -0.99;
  group.add(grid);
};

export const animateWeatherScene = (
  animatables: WeatherAnimatables, 
  weather: WeatherType,
  time: number,
  scene: THREE.Scene
) => {
  if (!animatables.craneGroup) return;

  // 1. Weather Effects Handling
  switch(weather) {
    case 'RAIN':
      if (animatables.rainParticles) {
          animatables.rainParticles.visible = true;
          const pos = animatables.rainParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length/3; i++) {
              pos[i*3+1] -= 0.5;
              if(pos[i*3+1] < 0) pos[i*3+1] = 20;
          }
          animatables.rainParticles.geometry.attributes.position.needsUpdate = true;
      }
      scene.fog = new THREE.FogExp2(0xe8f1f6, 0.05);
      break;

    case 'FOG':
      if (animatables.rainParticles) animatables.rainParticles.visible = false;
      scene.fog = new THREE.FogExp2(0xe8f1f6, 0.15);
      break;

    case 'STORM':
      if (animatables.rainParticles) animatables.rainParticles.visible = true;
      // High wind effect: Shaking the crane
      animatables.craneGroup.position.x = Math.sin(time * 15) * 0.1;
      animatables.craneGroup.rotation.z = Math.sin(time * 12) * 0.02;
      scene.fog = new THREE.FogExp2(0xe8f1f6, 0.08);
      break;

    case 'NIGHT':
      if (animatables.rainParticles) animatables.rainParticles.visible = false;
      scene.fog = new THREE.FogExp2(0xe8f1f6, 0.02);
      if (animatables.statusLight) {
          animatables.statusLight.intensity = 5 + Math.sin(time * 5) * 2;
      }
      break;

    default: // CLEAR
      if (animatables.rainParticles) animatables.rainParticles.visible = false;
      scene.fog = null;
      if (animatables.statusLight) animatables.statusLight.intensity = 0;
      animatables.craneGroup.position.set(0,0,0);
      animatables.craneGroup.rotation.set(0,0,0);
  }
};

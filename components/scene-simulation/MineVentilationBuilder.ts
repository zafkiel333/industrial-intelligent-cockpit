
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineVentilationScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Much Brighter)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6); // Increased from 0.2
  group.add(ambient);

  // Main overhead light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(10, 20, 10);
  group.add(dirLight);

  // Add Point lights along the tunnel to simulate mining lights
  const lightColors = [0xffaa00, 0xffffff, 0xffaa00];
  [-15, 0, 15].forEach((x, i) => {
      const pointLight = new THREE.PointLight(lightColors[i % 3], 1.5, 20);
      pointLight.position.set(x, 4, 0);
      group.add(pointLight);
  });

  // 2. Complex Tunnel System (U-Shape + Crosscuts)
  // Material: Grid/Tech look - Brighter lines
  const tunnelMat = new THREE.MeshBasicMaterial({ 
    color: 0x475569, // Lighter grey for wireframe
    wireframe: true, 
    transparent: true, 
    opacity: 0.15 
  });
  // Floor needs to be visible but dark
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.8,
    metalness: 0.1
  });
  disposables.push(tunnelMat, floorMat);

  // Define Path
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-20, 0, 10), // Intake
    new THREE.Vector3(-20, 0, -10),
    new THREE.Vector3(0, 0, -15),  // Face area
    new THREE.Vector3(20, 0, -10),
    new THREE.Vector3(20, 0, 10),  // Return
  ]);

  // Tunnel Tube
  const tunnelGeo = new THREE.TubeGeometry(curve, 64, 3, 8, false);
  disposables.push(tunnelGeo);
  const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
  group.add(tunnel);
  animatables.tunnelWalls = tunnel;

  // Solid Floor inside tunnel (approximation)
  const floorGeo = new THREE.TubeGeometry(curve, 64, 2.8, 4, false);
  // Flatten to make floor
  floorGeo.scale(1, 0.1, 1);
  floorGeo.translate(0, -2, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  group.add(floor);

  // 3. Local Fan (Duct Fan) - High Visibility Orange
  animatables.fans = [];
  const fanGroup = new THREE.Group();
  fanGroup.position.set(-18, 0, 8); // Near intake
  const fanGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
  fanGeo.rotateX(Math.PI / 2);
  const fanMat = new THREE.MeshStandardMaterial({ 
      color: 0xf59e0b, 
      emissive: 0xd97706,
      emissiveIntensity: 0.4
  });
  disposables.push(fanGeo, fanMat);
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fanGroup.add(fan);
  
  // Duct
  const ductGeo = new THREE.CylinderGeometry(0.8, 0.8, 15, 16);
  ductGeo.rotateX(Math.PI / 2);
  ductGeo.translate(0, 0, -8);
  const ductMat = new THREE.MeshStandardMaterial({ 
      color: 0xfcd34d, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4 
  });
  disposables.push(ductGeo, ductMat);
  const duct = new THREE.Mesh(ductGeo, ductMat);
  fanGroup.add(duct);
  
  // Blades
  const bladeGeo = new THREE.BoxGeometry(0.1, 1.8, 0.5);
  disposables.push(bladeGeo);
  const blades = new THREE.Mesh(bladeGeo, new THREE.MeshBasicMaterial({color: 0xffffff}));
  fanGroup.add(blades);
  
  group.add(fanGroup);
  // Store blades for rotation
  animatables.fans.push(blades as unknown as THREE.Group);

  // 4. Airflow Particles (Fresh Air) - Bright Cyan
  const airCount = 800;
  const airGeo = new THREE.BufferGeometry();
  const airPos = new Float32Array(airCount * 3);
  const airProgress = new Float32Array(airCount);
  
  for(let i=0; i<airCount; i++) {
    airProgress[i] = Math.random();
    // Pos updated in loop
    airPos[i*3] = 0; airPos[i*3+1] = 0; airPos[i*3+2] = 0;
  }
  airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
  airGeo.setAttribute('progress', new THREE.BufferAttribute(airProgress, 1));
  
  const airMat = new THREE.PointsMaterial({ 
      color: 0x67e8f9, // Lighter cyan
      size: 0.25, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(airGeo, airMat);
  const airSys = new THREE.Points(airGeo, airMat);
  group.add(airSys);
  animatables.airflowParticles = airSys;
  (airSys as any).userData = { curve };

  // 5. Hazardous Gas Cloud (Red/Orange) - Originating from "Face"
  const gasCount = 1000;
  const gasGeo = new THREE.BufferGeometry();
  const gasPos = new Float32Array(gasCount * 3);
  const gasLife = new Float32Array(gasCount); // 0 to 1
  
  for(let i=0; i<gasCount; i++) {
      gasPos[i*3] = (Math.random()-0.5) * 5; // X spread at face
      gasPos[i*3+1] = (Math.random()-0.5) * 4; // Y
      gasPos[i*3+2] = -15 + (Math.random()-0.5) * 5; // Z Face Area
      gasLife[i] = Math.random();
  }
  gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPos, 3));
  gasGeo.setAttribute('life', new THREE.BufferAttribute(gasLife, 1));
  
  const gasMat = new THREE.PointsMaterial({ 
      color: 0xff4444, 
      size: 0.5, 
      transparent: true, 
      opacity: 0, // Controlled by life
      blending: THREE.AdditiveBlending,
      depthWrite: false
  });
  disposables.push(gasGeo, gasMat);
  const gasCloud = new THREE.Points(gasGeo, gasMat);
  group.add(gasCloud);
  animatables.gasCloud = gasCloud;

  // 6. Sensor Nodes - Bright Neon
  animatables.sensors = [];
  const sGeo = new THREE.SphereGeometry(0.4); // Slightly larger
  const sMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
  disposables.push(sGeo, sMat);
  
  // Place sensors along curve
  [0.2, 0.5, 0.8].forEach(t => {
      const pt = curve.getPoint(t);
      const s = new THREE.Mesh(sGeo, sMat);
      s.position.copy(pt).add(new THREE.Vector3(0, 2, 0)); // Ceiling
      group.add(s);
      
      // Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d, transparent: true, side: THREE.DoubleSide });
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      s.add(ring);
      
      animatables.sensors?.push(s as unknown as THREE.Group);
  });
};

export const animateMineVentilationScene = (animatables: SimAnimatables, time: number, simParams: any) => {
    // 1. Fan Rotation
    if (animatables.fans) {
        const speed = simParams?.fanSpeed || 1;
        animatables.fans.forEach(f => f.rotation.z -= 0.1 * speed);
    }

    // 2. Airflow (Blue)
    if (animatables.airflowParticles) {
        const curve = (animatables.airflowParticles as any).userData.curve as THREE.CatmullRomCurve3;
        const progress = animatables.airflowParticles.geometry.attributes.progress.array as Float32Array;
        const positions = animatables.airflowParticles.geometry.attributes.position.array as Float32Array;
        const speed = (simParams?.windSpeed || 2) * 0.002;

        for(let i=0; i<progress.length; i++) {
            progress[i] += speed;
            if (progress[i] > 1) progress[i] = 0;
            
            const pt = curve.getPoint(progress[i]);
            // Jitter
            positions[i*3] = pt.x + Math.sin(time * 10 + i) * 0.5;
            positions[i*3+1] = pt.y + Math.cos(time * 10 + i) * 0.5;
            positions[i*3+2] = pt.z;
        }
        animatables.airflowParticles.geometry.attributes.position.needsUpdate = true;
        animatables.airflowParticles.geometry.attributes.progress.needsUpdate = true;
    }

    // 3. Gas Diffusion (Red)
    if (animatables.gasCloud) {
        const positions = animatables.gasCloud.geometry.attributes.position.array as Float32Array;
        const life = animatables.gasCloud.geometry.attributes.life.array as Float32Array;
        const concentration = simParams?.gasConcentration || 0.5; // 0 to 1

        const mat = animatables.gasCloud.material as THREE.PointsMaterial;
        mat.opacity = concentration * 0.8; 

        // Simulate diffusion from Face (0,0,-15) towards Return (20,0,10)
        // Vector roughly (1, 0, 1) direction
        
        for(let i=0; i<life.length; i++) {
            life[i] -= 0.01;
            if (life[i] < 0) {
                life[i] = 1;
                // Respawn at face source
                positions[i*3] = (Math.random()-0.5) * 4;
                positions[i*3+1] = (Math.random()-0.5) * 4;
                positions[i*3+2] = -15 + (Math.random()-0.5) * 2;
            } else {
                // Advection (Move with wind)
                positions[i*3] += 0.1 * (simParams?.windSpeed || 1); // Move right (simplified return path)
                positions[i*3+2] += 0.05 * (simParams?.windSpeed || 1); // Move forward
                
                // Diffusion (Spread out)
                positions[i*3] += (Math.random()-0.5) * 0.1;
                positions[i*3+1] += (Math.random()-0.5) * 0.1;
                positions[i*3+2] += (Math.random()-0.5) * 0.1;
            }
        }
        animatables.gasCloud.geometry.attributes.position.needsUpdate = true;
        animatables.gasCloud.geometry.attributes.life.needsUpdate = true;
    }

    // 4. Sensor Pulse
    if (animatables.sensors) {
        animatables.sensors.forEach((s, i) => {
            const ring = s.children[0];
            const scale = 1 + Math.sin(time * 3 + i) * 0.5;
            ring.scale.setScalar(scale);
            if (simParams?.gasConcentration > 0.8 && i === 1) {
                // Middle sensor alert
                (s as any).material.color.setHex(0xff0000);
                (ring as any).material.color.setHex(0xff0000);
            } else {
                (s as any).material.color.setHex(0x00ff9d);
                (ring as any).material.color.setHex(0x00ff9d);
            }
        });
    }
};

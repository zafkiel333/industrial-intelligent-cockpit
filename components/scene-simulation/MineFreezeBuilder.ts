
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineFreezeScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment & Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const blueLight = new THREE.PointLight(0x0ea5e9, 1.5, 40);
  blueLight.position.set(0, 10, 0);
  group.add(blueLight);

  // 2. Freeze Pipes (Circle Layout)
  const pipeCount = 36;
  const pipeRadius = 8; // Radius of the freeze circle
  const pipeDepth = 30;
  
  const pipeGroup = new THREE.Group();
  const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, pipeDepth, 8);
  pipeGeo.translate(0, -pipeDepth/2, 0); // Origin at top
  const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa, 
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      roughness: 0.2
  });
  disposables.push(pipeGeo, pipeMat);

  for(let i=0; i<pipeCount; i++) {
      const angle = (i / pipeCount) * Math.PI * 2;
      const x = Math.cos(angle) * pipeRadius;
      const z = Math.sin(angle) * pipeRadius;
      
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(x, 0, z);
      pipeGroup.add(pipe);
  }
  group.add(pipeGroup);
  animatables.freezePipes = pipeGroup;

  // Distribution Ring (Header)
  const headerGeo = new THREE.TorusGeometry(pipeRadius, 0.3, 16, 64);
  headerGeo.rotateX(Math.PI / 2);
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 });
  disposables.push(headerGeo, headerMat);
  const header = new THREE.Mesh(headerGeo, headerMat);
  header.position.y = 0.5;
  group.add(header);
  animatables.freezeHeaders = header as unknown as THREE.Group;

  // 3. Volumetric Soil (Temperature Field)
  // We use points to simulate volume. Dense near pipes, sparse elsewhere.
  const pCount = 15000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pColor = new Float32Array(pCount * 3);
  const pDist = new Float32Array(pCount); // Distance to nearest pipe for optimization

  const soilRadius = 15;
  const soilDepth = 30;

  for(let i=0; i<pCount; i++) {
      // Cylindrical distribution
      const r = Math.sqrt(Math.random()) * soilRadius;
      const theta = Math.random() * Math.PI * 2;
      const y = -Math.random() * soilDepth;
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      
      pPos[i*3] = x;
      pPos[i*3+1] = y;
      pPos[i*3+2] = z;
      
      // Init color (Earth brown/grey)
      pColor[i*3] = 0.3; // R
      pColor[i*3+1] = 0.25; // G
      pColor[i*3+2] = 0.2; // B

      // Precompute min distance to pipe ring (approx distance to circle of radius 8)
      // Dist to cylinder shell: abs(r - pipeRadius)
      pDist[i] = Math.abs(r - pipeRadius);
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));
  pGeo.setAttribute('dist', new THREE.BufferAttribute(pDist, 1)); // Store for shader-like logic in JS

  const pMat = new THREE.PointsMaterial({ 
      vertexColors: true, 
      size: 0.2, 
      transparent: true,
      opacity: 0.8
  });
  disposables.push(pGeo, pMat);
  
  const soilPoints = new THREE.Points(pGeo, pMat);
  group.add(soilPoints);
  animatables.soilVolume = soilPoints;

  // 4. Shaft Excavation (Ghost Cylinder - The Target)
  const shaftGeo = new THREE.CylinderGeometry(6, 6, 30, 32, 1, true); // 12m diameter shaft
  shaftGeo.translate(0, -15, 0);
  const shaftMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
  });
  disposables.push(shaftGeo, shaftMat);
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  group.add(shaft);
  animatables.shaftExcavation = shaft;

  // 5. Sensors (Monitoring Holes)
  animatables.freezeSensors = [];
  const sensorGeo = new THREE.SphereGeometry(0.3);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  disposables.push(sensorGeo, sensorMat);
  
  // Placement: Main Plane, Interface, Outer
  const sensorLocs = [
      { r: 7, label: 'Main' }, { r: 9, label: 'Outer' }, { r: 0, label: 'Center' }
  ];
  sensorLocs.forEach(loc => {
      const sGroup = new THREE.Group();
      sGroup.position.set(loc.r, 1, 0);
      const mesh = new THREE.Mesh(sensorGeo, sensorMat);
      sGroup.add(mesh);
      // Rod down
      const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 30), 
          new THREE.MeshBasicMaterial({color: 0x94a3b8})
      );
      rod.position.y = -15;
      sGroup.add(rod);
      
      group.add(sGroup);
      animatables.freezeSensors?.push(sGroup);
  });
};

export const animateMineFreezeScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { days: number, brineTemp: number }
    const days = simData?.days || 0;
    const brineTemp = simData?.brineTemp || -10;
    
    // Thermal Diffusivity approximation
    // Radius of frozen wall grows with sqrt(time) roughly
    // R_frozen ~ k * sqrt(days) * deltaT
    const deltaT = Math.abs(brineTemp); 
    const growthRate = 0.15;
    const frozenRadius = growthRate * Math.sqrt(days) * (deltaT / 30); // How far from pipe it spreads

    // Colors
    const cFrozen = new THREE.Color(0xdbeafe); // Ice White/Blue
    const cTransition = new THREE.Color(0x3b82f6); // Deep Blue (0 deg)
    const cEarth = new THREE.Color(0x4d4035); // Warm Earth

    // Update Soil Colors
    if (animatables.soilVolume) {
        const colors = animatables.soilVolume.geometry.attributes.color.array as Float32Array;
        const dists = animatables.soilVolume.geometry.attributes.dist.array as Float32Array;
        
        for(let i=0; i<dists.length; i++) {
            const d = dists[i];
            let targetC = cEarth;

            if (d < frozenRadius) {
                // Fully frozen
                targetC = cFrozen;
            } else if (d < frozenRadius + 2) {
                // Transition Zone (0 to 15C)
                const t = (d - frozenRadius) / 2;
                targetC = cTransition.clone().lerp(cEarth, t);
            }

            colors[i*3] = targetC.r;
            colors[i*3+1] = targetC.g;
            colors[i*3+2] = targetC.b;
        }
        animatables.soilVolume.geometry.attributes.color.needsUpdate = true;
    }

    // Pulse Pipes
    if (animatables.freezePipes) {
        (animatables.freezePipes.children as THREE.Mesh[]).forEach((pipe, i) => {
            (pipe.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5 + i * 0.5) * 0.2;
        });
    }

    // Sensors Indicator
    // If center sensor is frozen (dist=8 approx), turn green
    // Pipe radius is 8. Center is 0. Distance is 8.
    // So if frozenRadius > 8, center is frozen.
    if (animatables.freezeSensors) {
        // Center Sensor
        const centerSensor = animatables.freezeSensors[2].children[0] as THREE.Mesh;
        if (frozenRadius > 7.5) {
             (centerSensor.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e); // Frozen/Safe
        } else {
             (centerSensor.material as THREE.MeshBasicMaterial).color.setHex(0xef4444); // Unfrozen
        }
    }
};

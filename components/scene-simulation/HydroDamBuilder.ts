
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroDamScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 20);
  group.add(dirLight);

  // 2. Foundation (Rock)
  const rockGeo = new THREE.BoxGeometry(60, 10, 40);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  disposables.push(rockGeo, rockMat);
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.set(0, -5, 0);
  group.add(rock);
  animatables.damFoundation = rock;

  // Grid floor on rock
  const grid = new THREE.GridHelper(60, 20, 0x475569, 0x1e293b);
  grid.position.y = 0.01;
  group.add(grid);

  // 3. Dam Body (Gravity Dam Profile)
  // Cross Section shape extruded
  const damShape = new THREE.Shape();
  // Heel at (-5, 0)
  damShape.moveTo(-5, 0);
  // Upstream face (vertical)
  damShape.lineTo(-5, 20);
  // Crest
  damShape.lineTo(-1, 20);
  // Downstream slope
  damShape.lineTo(8, 0);
  // Base
  damShape.lineTo(-5, 0);

  const damGeo = new THREE.ExtrudeGeometry(damShape, { depth: 30, bevelEnabled: false });
  damGeo.center(); // Center the mesh geometry
  
  // We need high tessellation for vertex colors to look good as gradients
  // Since ExtrudeGeometry side tessellation is low, let's remesh or use a simpler Box approximation with subdivision for the visual stress
  // Actually, let's use a subdivided Box that is deformed to look like a dam for better vertex color control
  
  const visualDamGeo = new THREE.BoxGeometry(13, 20, 30, 20, 20, 20);
  const pos = visualDamGeo.attributes.position;
  // Deform box into dam shape
  for(let i=0; i<pos.count; i++){
      const x = pos.getX(i);
      const y = pos.getY(i); // Height: -10 to 10
      const z = pos.getZ(i);
      
      // Normalized Height (0 at bottom, 1 at top)
      const h = (y + 10) / 20;
      
      // Original Box X range: -6.5 to 6.5
      // Target X range at Bottom (h=0): -5 to 8 (Width 13) -> Center 1.5
      // Target X range at Top (h=1): -5 to -1 (Width 4) -> Center -3
      
      // Interpolate center and width
      const targetWidth = 13 * (1-h) + 4 * h;
      const targetCenter = 1.5 * (1-h) + (-3) * h;
      
      // Map x from [-6.5, 6.5] to [center - w/2, center + w/2]
      const xNorm = x / 6.5; 
      const newX = targetCenter + xNorm * (targetWidth / 2);
      
      pos.setX(i, newX);
      // Lift to sit on ground (y=0 to 20)
      pos.setY(i, y + 10);
  }
  visualDamGeo.computeVertexNormals();

  // Initialize Vertex Colors
  const count = pos.count;
  const colors = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
      colors[i*3] = 0.5; colors[i*3+1] = 0.5; colors[i*3+2] = 0.5; // Grey
  }
  visualDamGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const damMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true,
      roughness: 0.5,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: 1, // Push back slightly for wireframe
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.1 });

  disposables.push(visualDamGeo, damMat, wireMat);
  const damMesh = new THREE.Mesh(visualDamGeo, damMat);
  const damWire = new THREE.Mesh(visualDamGeo, wireMat);
  
  group.add(damMesh);
  group.add(damWire);
  animatables.damStressMesh = damMesh;

  // 4. Water
  const waterGeo = new THREE.BoxGeometry(20, 1, 30);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      transmission: 0.5
  });
  disposables.push(waterGeo, waterMat);
  
  // Upstream
  const upWater = new THREE.Mesh(waterGeo, waterMat);
  upWater.position.set(-15, 8, 0); // Height dynamic
  // Scale Y to match depth
  group.add(upWater);
  animatables.damUpstreamWater = upWater;

  // Downstream (Tailwater)
  const downWater = new THREE.Mesh(waterGeo, waterMat);
  downWater.position.set(18, 2, 0);
  group.add(downWater);
  animatables.damDownstreamWater = downWater;

  // 5. Seepage Particles (Flow under/through dam)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = -5; // Heel
      pPos[i*3+1] = 0;
      pPos[i*3+2] = (Math.random()-0.5) * 28;
      pSpeed[i] = 0.05 + Math.random() * 0.05;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeed, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.2 });
  disposables.push(pGeo, pMat);
  const seepage = new THREE.Points(pGeo, pMat);
  group.add(seepage);
  animatables.damSeepageParticles = seepage;

  // 6. Sensors (Glowing Orbs)
  animatables.damSensors = [];
  const sensorGeo = new THREE.SphereGeometry(0.3);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  disposables.push(sensorGeo, sensorMat);
  
  // Plumb line (Vertical)
  for(let y=2; y<20; y+=4) {
      const s = new THREE.Mesh(sensorGeo, sensorMat);
      s.position.set(0, y, 0);
      group.add(s);
      animatables.damSensors.push(s as unknown as THREE.Group);
  }
};

export const animateHydroDamScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waterLevel: number (0-20), temp: number (-10 to 40), uplift: boolean }
    const waterLvl = simData?.waterLevel || 15;
    const temp = simData?.temp || 20; // 20 is neutral
    const uplift = simData?.uplift || false;

    // 1. Water Level Animation
    if (animatables.damUpstreamWater) {
        // Height is Y scale * 1. Base is at 0? No, Box geo height 1 centered.
        // We want top surface at waterLvl.
        // Scale = waterLvl. Pos Y = waterLvl / 2.
        animatables.damUpstreamWater.scale.y = Math.max(0.1, waterLvl);
        animatables.damUpstreamWater.position.y = waterLvl / 2;
    }
    
    // 2. Stress Field Visualization (Vertex Colors)
    if (animatables.damStressMesh) {
        const geo = animatables.damStressMesh.geometry;
        const pos = geo.attributes.position;
        const col = geo.attributes.color;
        
        const cGrey = new THREE.Color(0x64748b);
        const cBlue = new THREE.Color(0x3b82f6); // Cold/Tensile
        const cRed = new THREE.Color(0xef4444);   // Hot/Compressive
        
        for(let i=0; i<pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            
            // Stress Logic Simulation:
            // 1. Hydrostatic Load: Increases with depth (20 - y) and pushes downstream (creates tension at heel, compression at toe)
            // 2. Thermal Load: Expansion (High Temp) causes upstream movement (arching effect)
            
            let stressVal = 0.5; // Neutral
            
            // Hydrostatic Effect (Toe compression)
            // Toe is roughly at x=8, y=0. Heel is x=-5, y=0.
            const distToToe = Math.sqrt(Math.pow(x-8, 2) + Math.pow(y, 2));
            const waterLoad = (waterLvl / 20); // 0-1
            
            // Compression at toe increases with water load
            if (distToToe < 10) {
                 stressVal += waterLoad * 0.4 * (1 - distToToe/10); 
            }
            
            // Tension at heel (Uplift worsens this)
            const distToHeel = Math.sqrt(Math.pow(x+5, 2) + Math.pow(y, 2));
            if (distToHeel < 10) {
                 stressVal -= waterLoad * 0.3 * (1 - distToHeel/10);
                 if (uplift) stressVal -= 0.1; // More tension
            }

            // Thermal Effect
            // High temp = Expansion = Surface compression
            // Low temp = Contraction = Surface tension
            const tempDiff = (temp - 20) / 40; // -0.5 to 0.5
            // Surface effect (Distance from center axis)
            // Approx center axis x=0
            // const distToSurface = ... simplified to general offset
            stressVal += tempDiff * 0.2; 

            // Clamp
            stressVal = Math.max(0, Math.min(1, stressVal));
            
            // Map 0-1 to Blue-Grey-Red
            // 0=Blue, 0.5=Grey, 1=Red
            const c = new THREE.Color().copy(cGrey);
            if (stressVal > 0.5) c.lerp(cRed, (stressVal-0.5)*2);
            else c.lerp(cBlue, (0.5-stressVal)*2);
            
            col.setXYZ(i, c.r, c.g, c.b);
        }
        col.needsUpdate = true;
    }

    // 3. Seepage Particles
    if (animatables.damSeepageParticles) {
        const positions = animatables.damSeepageParticles.geometry.attributes.position.array as Float32Array;
        const speeds = animatables.damSeepageParticles.geometry.attributes.speed.array as Float32Array;
        const count = speeds.length;
        
        // Pressure head difference drives flow
        const headDiff = waterLvl - 2; // Tailwater 2m
        const flowFactor = Math.max(0, headDiff / 20);

        for(let i=0; i<count; i++) {
            const speed = speeds[i] * flowFactor * 0.5; // Reduced speed
            
            // Move X (Through dam foundation)
            positions[i*3] += speed;
            
            // Path: Start at x=-5, move to x=8
            // Arch path downwards
            const x = positions[i*3];
            // Parabolic path under dam: y = -k * (x - mid)^2
            // Heel -5, Toe 8. Mid 1.5.
            const yBase = -Math.pow((x - 1.5)/5, 2) - 1; 
            positions[i*3+1] = yBase + (Math.random()-0.5)*0.5; // Jitter

            // Reset
            if (x > 8) {
                positions[i*3] = -5 - Math.random()*2;
            }
        }
        animatables.damSeepageParticles.geometry.attributes.position.needsUpdate = true;
        
        // Opacity based on uplift (if uplift high, more seepage visible)
        (animatables.damSeepageParticles.material as THREE.PointsMaterial).opacity = uplift ? 0.8 : 0.3;
    }
    
    // 4. Sensors Pulse
    if (animatables.damSensors) {
        animatables.damSensors.forEach((s, i) => {
             const scale = 1 + Math.sin(time * 3 + i) * 0.2;
             s.scale.setScalar(scale);
        });
    }
};

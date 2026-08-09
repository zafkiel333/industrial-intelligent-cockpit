
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortSpillScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Dim/Industrial)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(-20, 40, -10);
  group.add(sun);
  
  // 2. Water Surface
  const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x064e3b, // Dark Murky Green
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  group.add(water);
  animatables.psWater = water;

  // Grid
  const grid = new THREE.GridHelper(100, 20, 0x059669, 0x022c22);
  grid.position.y = -0.4;
  group.add(grid);

  // 3. Oil Slick (Dynamic Mesh)
  // We use a flat cylinder or sphere scaled down
  const slickGeo = new THREE.CircleGeometry(1, 64);
  slickGeo.rotateX(-Math.PI / 2);
  const slickMat = new THREE.MeshBasicMaterial({ 
      color: 0x111111, // Crude Oil Black
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
  });
  disposables.push(slickGeo, slickMat);
  const slick = new THREE.Mesh(slickGeo, slickMat);
  slick.position.y = -0.45; // Just above water
  group.add(slick);
  animatables.psSlick = slick;

  // 4. Containment Booms (Initially Hidden or far)
  const boomGroup = new THREE.Group();
  // Create a U-shape of cylinders
  const boomGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
  boomGeo.rotateZ(Math.PI / 2);
  const boomMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Yellow
  disposables.push(boomGeo, boomMat);

  const numBooms = 20;
  const radius = 15;
  for(let i=0; i<numBooms; i++) {
      const angle = (i / (numBooms-1)) * Math.PI; // Semi-circle
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const segment = new THREE.Mesh(boomGeo, boomMat);
      segment.position.set(x, 0, z);
      segment.lookAt(0, 0, 0); // Point inward roughly, need adjustment
      // Adjust rotation to form chain
      segment.rotation.y = -angle;
      boomGroup.add(segment);
  }
  
  boomGroup.position.set(20, -0.4, 0); // Start offset
  boomGroup.visible = false;
  group.add(boomGroup);
  animatables.psBooms = boomGroup;

  // 5. Quay / Docks
  const quayGeo = new THREE.BoxGeometry(20, 4, 100);
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(-30, 0, 0);
  group.add(quay);

  // 6. Tanker Ship (Source)
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(8, 4, 30);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1;
  shipGroup.add(hull);
  
  // Pipes on deck
  const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 20);
  pipeGeo.rotateX(Math.PI / 2);
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  disposables.push(pipeGeo, pipeMat);
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.position.set(2, 3.5, 0);
  shipGroup.add(pipe);

  shipGroup.position.set(-18, 0, -10); // Docked
  group.add(shipGroup);
  animatables.psShips = [shipGroup];

  // 7. Vector Arrows (Wind/Current)
  animatables.psVectors = [];
  
  // Wind (Blue)
  const wDir = new THREE.Vector3(1, 0, 0);
  const wOrigin = new THREE.Vector3(-20, 10, -20);
  const wArrow = new THREE.ArrowHelper(wDir, wOrigin, 5, 0x3b82f6, 1, 1);
  group.add(wArrow);
  animatables.psVectors.push(wArrow);

  // Current (Green)
  const cDir = new THREE.Vector3(1, 0, 0);
  const cOrigin = new THREE.Vector3(-20, 8, -20);
  const cArrow = new THREE.ArrowHelper(cDir, cOrigin, 5, 0x22c55e, 1, 1);
  group.add(cArrow);
  animatables.psVectors.push(cArrow);
};

export const animatePortSpillScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { 
    //   spillAge: number, // Time elapsed
    //   volume: number, 
    //   windSpeed: number, windDir: number, 
    //   currentSpeed: number, currentDir: number,
    //   boomsDeployed: boolean
    // }
    
    const age = simData?.spillAge || 0;
    const windSpd = simData?.windSpeed || 0;
    const windDir = (simData?.windDir || 0) * Math.PI / 180;
    const currSpd = simData?.currentSpeed || 0;
    const currDir = (simData?.currentDir || 0) * Math.PI / 180;
    const boomsActive = simData?.boomsDeployed || false;

    // 1. Calculate Drift Vector
    // Drift = Current + 0.03 * Wind
    const driftX = (Math.sin(currDir) * currSpd + Math.sin(windDir) * windSpd * 0.03) * age * 0.05;
    const driftZ = (Math.cos(currDir) * currSpd + Math.cos(windDir) * windSpd * 0.03) * age * 0.05;

    // 2. Calculate Spread (Fay's formula approx: R ~ t^1.5 initially then t^0.5)
    // Simplified: Area grows with time and volume
    const volFactor = Math.sqrt(simData?.volume || 100);
    let radius = 1 + Math.pow(age, 0.6) * 0.5 * (volFactor / 10);
    
    // If booms are active, restrict spread in drift direction
    if (boomsActive) {
        radius = Math.min(radius, 15); // Boom containment radius
    }

    // 3. Update Slick
    if (animatables.psSlick) {
        animatables.psSlick.scale.set(radius, radius, 1);
        
        // Elongation in drift direction
        const stretch = 1 + (windSpd + currSpd) * 0.05;
        animatables.psSlick.scale.y *= stretch; // Y is local Z after rot
        
        // Rotate to align with drift
        const totalDriftAngle = Math.atan2(driftX, driftZ); // Approx direction
        animatables.psSlick.rotation.z = -totalDriftAngle; // Circle on XZ plane, rotated X-90. Z rot spins it.
        
        // Position
        let posX = -14 + driftX; // Start near ship
        let posZ = -10 + driftZ;
        
        // Boom Constraint
        if (boomsActive) {
            // Clamp position if it hits boom barrier at (0,0) approx
            // Visual boom is at pos (0,0) in our simplified view logic for now
            // Let's say boom group is placed dynamically ahead of drift
            if (posX > -5) posX = -5; // Hit boom line
        }

        animatables.psSlick.position.x = posX;
        animatables.psSlick.position.z = posZ;
        
        // Color weathering (Black -> Brown)
        const mat = animatables.psSlick.material as THREE.MeshBasicMaterial;
        if (age > 50) {
            mat.color.setHex(0x5c4033); // Brown emulsion
            mat.opacity = 0.7;
        } else {
            mat.color.setHex(0x111111);
            mat.opacity = 0.9;
        }
    }

    // 4. Update Vectors
    if (animatables.psVectors) {
        // Wind
        const wArrow = animatables.psVectors[0];
        wArrow.setDirection(new THREE.Vector3(Math.sin(windDir), 0, Math.cos(windDir)));
        wArrow.setLength(windSpd * 0.5, 1, 0.5);
        
        // Current
        const cArrow = animatables.psVectors[1];
        cArrow.setDirection(new THREE.Vector3(Math.sin(currDir), 0, Math.cos(currDir)));
        cArrow.setLength(currSpd * 2, 1, 0.5);
    }

    // 5. Booms
    if (animatables.psBooms) {
        animatables.psBooms.visible = boomsActive;
        if (boomsActive) {
            animatables.psBooms.position.set(-5, -0.4, -10); // Place blocking path
            // Gentle bobbing
            animatables.psBooms.position.y = -0.4 + Math.sin(time * 2) * 0.05;
        }
    }
};


import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineSlopeStabilityScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-20, 30, 20);
  group.add(dirLight);

  // 2. Open Pit Terrain (Benches)
  // Generate a curved pit wall with steps
  const width = 60;
  const depth = 40;
  const segmentsW = 64;
  const segmentsD = 40;
  
  const geometry = new THREE.PlaneGeometry(width, depth, segmentsW, segmentsD);
  const pos = geometry.attributes.position;
  const colors = [];
  const colorStable = new THREE.Color(0x334155); // Slate
  const colorRisk = new THREE.Color(0xef4444);   // Red
  
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is world Z (distance from face)
    
    // Create steep slope with benches
    // Global Slope angle approx 45 deg
    // Bench width ~2m, Bench height ~4m
    
    // Coordinate mapping: y goes from 20 (top) to -20 (bottom)
    const normalizedH = (y + 20) / 40; // 0 to 1
    
    // Step function for benches
    const steps = 6;
    const stepHeight = depth / steps;
    const benchY = Math.floor((y + 20) / stepHeight) * stepHeight - 20;
    
    // Curvature (Pit is usually circular/elliptical)
    const curve = Math.pow(x * 0.05, 2) * 5; 
    
    let zHeight = benchY * 1.0; // General slope
    
    // Add noise
    zHeight += Math.random() * 0.5;
    
    pos.setZ(i, zHeight - curve);
    
    // Initial Color
    colors.push(colorStable.r, colorStable.g, colorStable.b);
  }
  
  geometry.computeVertexNormals();
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.rotateX(-Math.PI / 2); // Lay flat

  const terrainMat = new THREE.MeshStandardMaterial({ 
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });
  
  disposables.push(geometry, terrainMat);
  const terrain = new THREE.Mesh(geometry, terrainMat);
  group.add(terrain);
  animatables.slopeTerrain = terrain;

  // Grid helper for reference
  const grid = new THREE.GridHelper(60, 60, 0x1e293b, 0x0f172a);
  grid.position.y = -22;
  group.add(grid);

  // 3. Potential Slip Plane (Visual Ghost)
  // A spherical cap intersecting the terrain
  const slipGeo = new THREE.SphereGeometry(25, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.25);
  const slipMat = new THREE.MeshBasicMaterial({ 
    color: 0xf97316, // Orange
    transparent: true, 
    opacity: 0.0, // Start hidden
    wireframe: true,
    side: THREE.DoubleSide
  });
  disposables.push(slipGeo, slipMat);
  const slipPlane = new THREE.Mesh(slipGeo, slipMat);
  slipPlane.position.set(0, 5, -10); // Positioned to cut through the slope
  slipPlane.rotation.x = Math.PI / 3;
  group.add(slipPlane);
  animatables.slipPlane = slipPlane;

  // 4. Displacement Vectors (Instanced Arrows)
  const vectorCount = 200;
  const arrowGeo = new THREE.ConeGeometry(0.3, 1, 8);
  arrowGeo.rotateX(Math.PI / 2); // Point forward
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  disposables.push(arrowGeo, arrowMat);
  
  const vectors = new THREE.InstancedMesh(arrowGeo, arrowMat, vectorCount);
  const dummy = new THREE.Object3D();
  const vectorData = []; // Store origin
  
  // Place vectors on the slope surface
  for(let i=0; i<vectorCount; i++) {
     const x = (Math.random() - 0.5) * 40;
     const y = (Math.random() - 0.5) * 30; // Height on slope
     const curve = Math.pow(x * 0.05, 2) * 5;
     
     // Snap roughly to bench geometry logic
     const steps = 6;
     const stepHeight = 40 / steps;
     const benchY = Math.floor((y + 20) / stepHeight) * stepHeight - 20;
     const z = benchY * 1.0 - curve; // Depth
     
     // Position
     // Note: In Three world, Y is Up. Our previous logic rotated X -90.
     // So Terrain Z became Y up, Y became -Z.
     // Re-mapping:
     // Terrain Y (Up) = zHeight
     // Terrain Z (Depth) = y
     
     const worldY = z;
     const worldZ = y; // Roughly
     
     dummy.position.set(x, worldY + 1, worldZ);
     // Point Out and Down
     dummy.lookAt(x, worldY - 5, worldZ + 5); 
     dummy.scale.set(0, 0, 0); // Start scale 0
     dummy.updateMatrix();
     
     vectors.setMatrixAt(i, dummy.matrix);
     vectorData.push({ 
         origin: new THREE.Vector3(x, worldY + 1, worldZ),
         dir: new THREE.Vector3(0, -1, 1).normalize(),
         active: Math.abs(x) < 10 && worldY > -10 // Only center vectors are active risk
     });
  }
  
  vectors.instanceMatrix.needsUpdate = true;
  group.add(vectors);
  animatables.displacementVectors = vectors;
  (vectors as any).userData = { data: vectorData };

  // 5. Radar Scanner (SSR)
  const radarGroup = new THREE.Group();
  radarGroup.position.set(0, -20, 25); // At pit bottom, looking up
  
  const dishGeo = new THREE.CylinderGeometry(0.5, 2, 1, 16, 1, true);
  dishGeo.rotateX(Math.PI/2);
  const dishMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true });
  disposables.push(dishGeo, dishMat);
  const dish = new THREE.Mesh(dishGeo, dishMat);
  
  const baseGeo = new THREE.BoxGeometry(2, 4, 2);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(baseGeo, baseMat);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -2;
  
  radarGroup.add(dish);
  radarGroup.add(base);
  group.add(radarGroup);
  
  animatables.radarScanner = radarGroup;

  // Scan Beam
  const beamGeo = new THREE.ConeGeometry(5, 40, 32, 1, true);
  beamGeo.rotateX(-Math.PI / 2);
  beamGeo.translate(0, 0, -20);
  const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.05, 
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
  });
  disposables.push(beamGeo, beamMat);
  const beam = new THREE.Mesh(beamGeo, beamMat);
  radarGroup.add(beam);
};

export const animateMineSlopeStabilityScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { rainfall: number (0-100), stability: number (0-100) }
    const riskFactor = 1 - (simData?.stability / 100 || 1); // 0 = Safe, 1 = Fail
    const rainIntensity = simData?.rainfall || 0;

    // 1. Radar Scan
    if (animatables.radarScanner) {
        // Pan left/right
        animatables.radarScanner.rotation.y = Math.sin(time * 0.5) * 0.5;
        animatables.radarScanner.children[0].rotation.x = Math.sin(time * 2) * 0.1; // Dish wobble
        
        // Beam pulse
        const beam = animatables.radarScanner.children[2] as THREE.Mesh;
        (beam.material as THREE.Material).opacity = 0.05 + Math.sin(time * 10) * 0.02;
    }

    // 2. Vectors (Show risk)
    if (animatables.displacementVectors) {
        const mesh = animatables.displacementVectors;
        const data = (mesh as any).userData.data;
        const dummy = new THREE.Object3D();

        for(let i=0; i<mesh.count; i++) {
            const vData = data[i];
            
            // Only active vectors grow with risk
            let scale = 0;
            if (vData.active) {
                // Scale based on risk factor + noise
                scale = riskFactor * 2 + Math.sin(time * 5 + i) * 0.2 * riskFactor;
            } else {
                // Background creep
                scale = 0.1; 
            }

            dummy.position.copy(vData.origin);
            dummy.lookAt(vData.origin.clone().add(vData.dir));
            dummy.scale.set(scale, scale, scale * 2); // Elongate
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        
        // Color Change: Green -> Red
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.color.setHSL(0.33 * (1-riskFactor), 1, 0.5); // Green to Red
    }

    // 3. Slip Plane Visibility
    if (animatables.slipPlane) {
        const mat = animatables.slipPlane.material as THREE.MeshBasicMaterial;
        if (riskFactor > 0.4) {
            mat.opacity = (riskFactor - 0.4) * 0.8 + Math.sin(time * 5) * 0.1;
        } else {
            mat.opacity = 0;
        }
    }

    // 4. Terrain Color (Heatmap)
    if (animatables.slopeTerrain && riskFactor > 0.3) {
        // We simulate heatmap by Vertex Colors
        const geo = animatables.slopeTerrain.geometry;
        const colors = geo.attributes.color;
        const pos = geo.attributes.position;
        
        const cStable = new THREE.Color(0x334155);
        const cWarn = new THREE.Color(0xf59e0b);
        const cCrit = new THREE.Color(0xef4444);
        
        const center = new THREE.Vector3(0, 0, 0); // Risk center
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            
            // Distance from "failure center" (approx x=0, y=0 in local plane space)
            const dist = Math.sqrt(x*x + y*y);
            
            let targetColor = cStable;
            
            // Risk radius expands
            const radius = riskFactor * 20; 
            
            if (dist < radius) {
                const t = 1 - (dist / radius);
                targetColor = cWarn.clone().lerp(cCrit, t * riskFactor);
            }
            
            colors.setXYZ(i, targetColor.r, targetColor.g, targetColor.b);
        }
        colors.needsUpdate = true;
    }
};

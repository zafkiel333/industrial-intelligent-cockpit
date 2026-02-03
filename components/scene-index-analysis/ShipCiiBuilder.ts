
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isShipCiiScene = (type: SceneType): boolean => {
  return type === 'ship-cii-analysis';
};

export const setupShipCiiCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);
};

export const initShipCiiScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'ship-cii-analysis') return;

  // 1. Stylized Earth Globe
  const globeGroup = new THREE.Group();
  group.add(globeGroup);
  animatables.ciiGlobe = globeGroup;

  const globeGeo = new THREE.SphereGeometry(5, 64, 64);
  const globeMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, 
    roughness: 0.8,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.2
  });
  disposables.push(globeGeo, globeMat);
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globeGroup.add(globe);

  // Wireframe Grid Overlay
  const wireGeo = new THREE.WireframeGeometry(globeGeo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x1e40af, transparent: true, opacity: 0.1 });
  disposables.push(wireGeo, wireMat);
  const wireGlobe = new THREE.LineSegments(wireGeo, wireMat);
  globeGroup.add(wireGlobe);

  // 2. Trajectory Path (Great Circle approx)
  const pathPoints = [];
  const segments = 100;
  for (let i = 0; i <= segments; i++) {
    // Generate a spiral path around the globe
    const t = i / segments;
    const phi = Math.PI / 2 - (t * Math.PI * 0.8 - Math.PI * 0.4); // Lat
    const theta = t * Math.PI * 2.5; // Long
    
    const r = 5.05; // Slightly above surface
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    
    pathPoints.push(new THREE.Vector3(x, y, z));
  }

  // Create Ribbon for Trail (Variable color based on "CII")
  // We'll simulate vertex coloring for efficiency gradient
  const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const colors = [];
  const color1 = new THREE.Color(0x22c55e); // A rating
  const color2 = new THREE.Color(0xfacc15); // C rating
  const color3 = new THREE.Color(0xef4444); // E rating
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Simulate varying efficiency along route (worse in middle)
    const efficiency = Math.sin(t * Math.PI * 3) * 0.5 + 0.5; 
    
    let c = new THREE.Color();
    if (efficiency > 0.6) c.lerpColors(color2, color3, (efficiency - 0.6) / 0.4);
    else c.lerpColors(color1, color2, efficiency / 0.6);
    
    colors.push(c.r, c.g, c.b);
  }
  
  pathGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  const pathMat = new THREE.LineBasicMaterial({ 
    vertexColors: true, 
    linewidth: 3,
    transparent: true, 
    opacity: 0.8
  });
  disposables.push(pathGeo, pathMat);
  const path = new THREE.Line(pathGeo, pathMat);
  globeGroup.add(path);
  animatables.ciiTrail = path;
  
  // Store path for ship animation
  (globeGroup as any).userData = { pathPoints };

  // 3. Ship Marker
  const shipGroup = new THREE.Group();
  globeGroup.add(shipGroup);
  animatables.ciiShip = shipGroup;

  const coneGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
  coneGeo.rotateX(Math.PI / 2); // Point forward
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(coneGeo, coneMat);
  const ship = new THREE.Mesh(coneGeo, coneMat);
  shipGroup.add(ship);

  // Glow
  const glowGeo = new THREE.SphereGeometry(0.3);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
  disposables.push(glowGeo, glowMat);
  const glow = new THREE.Mesh(glowGeo, glowMat);
  shipGroup.add(glow);
};

export const animateShipCiiScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'ship-cii-analysis') return;

  const globeGroup = animatables.ciiGlobe;
  const shipGroup = animatables.ciiShip;
  
  if (globeGroup) {
      // Slow rotation of earth
      globeGroup.rotation.y = time * 0.05;
  }

  if (shipGroup && globeGroup) {
      const pathPoints = (globeGroup as any).userData.pathPoints as THREE.Vector3[];
      // Animate ship along path
      const loopTime = 20; // seconds for full loop
      const t = (time % loopTime) / loopTime;
      
      // Interpolate position
      const idx = Math.floor(t * (pathPoints.length - 1));
      const nextIdx = Math.min(idx + 1, pathPoints.length - 1);
      const subT = (t * (pathPoints.length - 1)) - idx;
      
      const p1 = pathPoints[idx];
      const p2 = pathPoints[nextIdx];
      
      const pos = new THREE.Vector3().lerpVectors(p1, p2, subT);
      shipGroup.position.copy(pos);
      
      // Orient ship
      shipGroup.lookAt(new THREE.Vector3(0,0,0)); // Up vector aligns with radius
      // We need it to point along path, but surface normal is up
      // Quick fix: lookAt next point, then adjust up
      const lookTarget = p2.clone();
      shipGroup.lookAt(lookTarget);
  }
};


import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isDamHealthScene = (type: SceneType): boolean => {
  return type === 'dam-health-analysis';
};

export const setupDamHealthCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 2, 0);
};

export const initDamHealthScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dam-health-analysis') return;

  // 1. Dam Cross-Section (Gravity Dam Profile)
  const damShape = new THREE.Shape();
  damShape.moveTo(-2, 8); // Top Upstream
  damShape.lineTo(2, 8);  // Top Downstream
  damShape.lineTo(6, 0);  // Toe
  damShape.lineTo(-2, 0); // Heel
  damShape.lineTo(-2, 8); // Upstream Face (Vertical)

  const damGeo = new THREE.ExtrudeGeometry(damShape, { depth: 4, bevelEnabled: false });
  damGeo.translate(0, 0, -2); // Center Z
  
  // Custom Shader Material for Stress Visualization? 
  // For simplicity, standard material with Vertex Colors or Emissive trick
  const damMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, 
    roughness: 0.7,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9
  });
  
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  group.add(dam);
  animatables.damMesh = dam;

  // Wireframe Overlay for FEM look
  const wiregeo = new THREE.WireframeGeometry(damGeo);
  const wiremat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.2 });
  disposables.push(wiregeo, wiremat);
  const wire = new THREE.LineSegments(wiregeo, wiremat);
  dam.add(wire);

  // 2. Foundation
  const rockGeo = new THREE.BoxGeometry(20, 2, 10);
  rockGeo.translate(0, -1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  disposables.push(rockGeo, rockMat);
  const rock = new THREE.Mesh(rockGeo, rockMat);
  group.add(rock);

  // 3. Water (Reservoir)
  const waterGeo = new THREE.BoxGeometry(10, 6, 8);
  waterGeo.translate(-7, 3, 0);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.4,
    roughness: 0.1
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  group.add(water);
  animatables.damWater = water;

  // 4. Sensors (Glowing Nodes)
  animatables.damSensors = [];
  const sensorGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  disposables.push(sensorGeo, sensorMat);

  // Plumb line points (Vertical shaft)
  for(let i=1; i<4; i++) {
    const s = new THREE.Mesh(sensorGeo, sensorMat);
    s.position.set(0, i * 2, 0);
    group.add(s);
    animatables.damSensors.push(s as unknown as THREE.Group);
  }
  // Base pressure sensors
  for(let i=0; i<3; i++) {
    const s = new THREE.Mesh(sensorGeo, sensorMat);
    s.position.set(-1 + i*3, 0.2, 0);
    group.add(s);
    animatables.damSensors.push(s as unknown as THREE.Group);
  }
};

export const animateDamHealthScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dam-health-analysis') return;

  // Simulated Load Cycle (e.g., Seasonal Water Level)
  const loadCycle = Math.sin(time * 0.2) * 0.5 + 0.5; // 0 to 1

  // Animate Water Level
  if (animatables.damWater) {
    // Height varies from 3 to 7 (Base geo is height 6 at y=3)
    const h = 4 + loadCycle * 3; 
    animatables.damWater.scale.y = h / 6;
    animatables.damWater.position.y = h / 2;
  }

  // Animate Stress Heatmap (Emissive color on Dam)
  if (animatables.damMesh) {
    const mat = animatables.damMesh.material as THREE.MeshStandardMaterial;
    // High load = Redder
    const r = loadCycle * 0.5; 
    const b = 0.2;
    mat.emissive.setRGB(r, 0, b);
    mat.emissiveIntensity = 0.5 + loadCycle * 0.5;
  }

  // Pulse Sensors
  if (animatables.damSensors) {
    animatables.damSensors.forEach((s, i) => {
      const scale = 1 + Math.sin(time * 3 + i) * 0.3;
      s.scale.setScalar(scale);
    });
  }
};

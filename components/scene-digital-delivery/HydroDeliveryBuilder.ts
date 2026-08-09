
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-completion';
};

export const setupHydroDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(-25, 15, 25);
  camera.lookAt(0, 5, 0);
};

export const initHydroDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-completion') return;

  // 1. Digital Twin Dam (Hybrid Wireframe/Solid)
  // We want it to look like it's being scanned/digitized
  const damShape = new THREE.Shape();
  damShape.moveTo(-20, 0);
  damShape.lineTo(20, 0);
  damShape.lineTo(25, -10); // Base
  damShape.lineTo(-25, -10);
  damShape.lineTo(-20, 0);

  const extrudeSettings = { depth: 8, bevelEnabled: false };
  const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
  damGeo.rotateX(-Math.PI / 2); // Lay flat roughly
  damGeo.translate(0, 5, 0); // Lift up
  
  // Solid Material (Glassy, high tech)
  const damMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  disposables.push(damGeo, damMat);
  
  const damMesh = new THREE.Mesh(damGeo, damMat);
  group.add(damMesh);
  animatables.ddHydroDam = damMesh;

  // Wireframe Overlay (The "CAD" structure)
  const edges = new THREE.EdgesGeometry(damGeo);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4 });
  disposables.push(edges, lineMat);
  const wireframe = new THREE.LineSegments(edges, lineMat);
  group.add(wireframe);
  animatables.ddWireframeOverlay = wireframe;

  // 2. Terrain Grid (Digital Landscape)
  const gridHelper = new THREE.GridHelper(60, 60, 0x1e3a8a, 0x0f172a);
  gridHelper.position.y = -5;
  group.add(gridHelper);

  // 3. Scanning Laser Plane
  const scanGeo = new THREE.PlaneGeometry(60, 60);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0xfacc15, // Gold scanner
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanPlane);
  animatables.ddScanLaser = scanPlane;

  // Scan Line (Bright edge)
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-30, 0, 0), new THREE.Vector3(30, 0, 0)
  ]);
  const lineScanMat = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });
  disposables.push(lineGeo, lineScanMat);
  const scanLine = new THREE.Line(lineGeo, lineScanMat);
  scanPlane.add(scanLine); // Attached to plane, moves with it

  // 4. Data Markers (Floating "Docs")
  animatables.ddDocMarkers = [];
  const markerGeo = new THREE.OctahedronGeometry(0.5);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
  disposables.push(markerGeo, markerMat);

  // Random positions near the dam surface
  const positions = [
    {x: -10, y: 5, z: 4}, {x: 0, y: 2, z: 5}, {x: 10, y: 6, z: 3},
    {x: -5, y: -2, z: 6}, {x: 8, y: -3, z: 6}, {x: 0, y: 5, z: 0}
  ];

  positions.forEach(pos => {
    const markerGroup = new THREE.Group();
    markerGroup.position.set(pos.x, pos.y, pos.z);
    
    const mesh = new THREE.Mesh(markerGeo, markerMat);
    markerGroup.add(mesh);
    
    // Connecting line to "surface"
    const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), new THREE.Vector3(0, -2, 0)
    ]);
    const dropLineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });
    disposables.push(dropLineGeo, dropLineMat);
    const dropLine = new THREE.Line(dropLineGeo, dropLineMat);
    markerGroup.add(dropLine);

    group.add(markerGroup);
    animatables.ddDocMarkers?.push(markerGroup);
  });
};

export const animateHydroDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-completion') return;

  // 1. Scan Effect
  if (animatables.ddScanLaser) {
    // Move up and down
    animatables.ddScanLaser.position.y = Math.sin(time * 0.5) * 6;
    
    // Only show wireframe when scanner is close vertically? 
    // Or vary opacity based on scan height
    if (animatables.ddWireframeOverlay) {
       // Logic: if scan plane is near y, highlight.
       // Simplified: Always visible, but maybe pulse opacity
       (animatables.ddWireframeOverlay.material as THREE.LineBasicMaterial).opacity = 0.3 + Math.sin(time * 2) * 0.1;
    }
  }

  // 2. Rotate Markers
  if (animatables.ddDocMarkers) {
    animatables.ddDocMarkers.forEach((m, i) => {
      m.children[0].rotation.y = time + i;
      m.children[0].rotation.z = time * 0.5;
      // Bobbing
      m.position.y += Math.sin(time * 2 + i) * 0.005;
    });
  }

  // 3. Dam Ghosting
  if (animatables.ddHydroDam) {
    // Subtle rotation to show 3D nature
    // animatables.ddHydroDam.rotation.y = Math.sin(time * 0.1) * 0.05;
    // (animatables.ddWireframeOverlay as any).rotation.y = Math.sin(time * 0.1) * 0.05;
  }
};

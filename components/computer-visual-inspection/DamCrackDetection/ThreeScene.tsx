import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DamCrackData } from './three-types';

interface ThreeSceneProps {
  cracks: DamCrackData[];
  isScanning: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ cracks, isScanning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  // Use refs to store props for real-time access in the animation loop without useEffect dependencies
  const propsRef = useRef({ cracks, isScanning });

  useEffect(() => {
    propsRef.current = { cracks, isScanning };
  }, [cracks, isScanning]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    // 2. Initialization
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // 3. Create Dam Model (Simplified Tech Style)
    const damGeometry = new THREE.BoxGeometry(15, 10, 4);
    // Taper the top
    const positions = damGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      if (y > 0) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        positions.setX(i, x * 0.6);
        positions.setZ(i, z * 0.6);
      }
    }
    
    const damMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.8,
      wireframe: false,
    });
    const damMesh = new THREE.Mesh(damGeometry, damMaterial);
    scene.add(damMesh);

    // Add wireframe overlay
    const wireframe = new THREE.WireframeGeometry(damGeometry);
    const line = new THREE.LineSegments(wireframe);
    line.material = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    scene.add(line);

    // 4. Scanning Plane
    const scanPlaneGeo = new THREE.PlaneGeometry(16, 12);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // 5. Crack Markers Group
    const crackGroup = new THREE.Group();
    scene.add(crackGroup);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 7. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { isScanning: currentIsScanning, cracks: currentCracks } = propsRef.current;

      // Update scan plane
      if (currentIsScanning) {
        scanPlane.visible = true;
        scanPlane.position.y = Math.sin(Date.now() * 0.002) * 5;
      } else {
        scanPlane.visible = false;
      }

      // Update cracks
      // Simple logic: clear and redraw if count changes (or just keep synced)
      if (crackGroup.children.length !== currentCracks.length) {
        while(crackGroup.children.length > 0) {
          crackGroup.remove(crackGroup.children[0]);
        }
        currentCracks.forEach(crack => {
          const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({ 
            color: crack.severity === 'high' ? 0xef4444 : (crack.severity === 'medium' ? 0xf59e0b : 0x10b981) 
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(crack.position[0], crack.position[1], crack.position[2]);
          crackGroup.add(marker);
          
          // Add a glowing ring
          const ringGeo = new THREE.TorusGeometry(0.4, 0.02, 16, 100);
          const ringMat = new THREE.MeshBasicMaterial({ color: markerMat.color, transparent: true, opacity: 0.5 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(crack.position[0], crack.position[1], crack.position[2]);
          ring.lookAt(camera.position);
          crackGroup.add(ring);
        });
      }

      // Pulse effect for markers
      crackGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry.type === 'TorusGeometry') {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.005 + index) * 0.2);
          child.lookAt(camera.position);
        }
      });

      damMesh.rotation.y += 0.002;
      line.rotation.y += 0.002;
      crackGroup.rotation.y += 0.002;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full" />;
};

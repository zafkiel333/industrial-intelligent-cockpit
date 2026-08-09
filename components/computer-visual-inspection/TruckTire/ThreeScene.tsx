import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TruckTireState } from './three-types';

interface ThreeSceneProps {
  state: TruckTireState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const tireRef = useRef<THREE.Mesh | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);
  
  const propsRef = useRef({ state });

  useEffect(() => {
    propsRef.current = { state };
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(6, 4, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Tire Model
    const tireGeo = new THREE.TorusGeometry(3, 1.2, 32, 64);
    const tireMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b,
      wireframe: false,
      shininess: 10
    });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tireRef.current = tire;
    scene.add(tire);

    // Tread pattern (simplified)
    const wireframe = new THREE.Mesh(tireGeo, new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.1 }));
    tire.add(wireframe);

    // 2. Scanning Ring
    const scanGeo = new THREE.TorusGeometry(4.5, 0.05, 16, 100);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 });
    const scanRing = new THREE.Mesh(scanGeo, scanMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRingRef.current = scanRing;
    scene.add(scanRing);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x06b6d4, 100);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Rotate tire
      if (tireRef.current) {
        tireRef.current.rotation.z += currentState.speed * 0.01;
        
        // Update color based on temperature
        const avgTemp = currentState.tires.reduce((acc, t) => acc + t.temperature, 0) / currentState.tires.length;
        const heatIntensity = Math.min(1, (avgTemp - 40) / 60);
        const mat = tireRef.current.material as THREE.MeshPhongMaterial;
        mat.color.setRGB(0.1 + heatIntensity * 0.5, 0.15 - heatIntensity * 0.1, 0.2);
      }

      // Animate scan ring
      if (scanRingRef.current) {
        scanRingRef.current.position.y = Math.sin(Date.now() * 0.002) * 2;
        scanRingRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.1);
      }

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

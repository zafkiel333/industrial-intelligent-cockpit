import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TugboatEngineState } from './three-types';

interface ThreeSceneProps {
  state?: TugboatEngineState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<TugboatEngineState>(state || {
    rpm: 1500,
    vibrationIntensity: 0.25,
    fuelFlow: 85,
    exhaustTemp: 420,
    oilPressure: 0.55
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Engine Model
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // Block
    const blockGeom = new THREE.BoxGeometry(6, 3, 3);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const block = new THREE.Mesh(blockGeom, blockMat);
    engineGroup.add(block);

    // Cylinder Heads
    const headGeom = new THREE.BoxGeometry(5.5, 1, 2.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 2;
    engineGroup.add(head);

    // Flywheel
    const flyGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const flyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const flywheel = new THREE.Mesh(flyGeom, flyMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.x = 3.25;
    engineGroup.add(flywheel);

    // Turbocharger
    const turboGeom = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
    const turboMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    const turbo = new THREE.Mesh(turboGeom, turboMat);
    turbo.position.set(-2, 2.5, 1.5);
    engineGroup.add(turbo);

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { rpm, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Flywheel rotation
      flywheel.rotation.x += rpm * 0.0001;

      // Vibration effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.05);
      engineGroup.position.y = vib;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

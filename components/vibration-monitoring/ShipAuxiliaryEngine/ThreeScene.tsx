import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AuxiliaryEngineState } from './three-types';

interface ThreeSceneProps {
  state?: AuxiliaryEngineState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<AuxiliaryEngineState>(state || {
    powerOutput: 850,
    vibrationIntensity: 0.25,
    frequency: 60,
    voltage: 440,
    current: 1200
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

    // Generator Set Model
    const genSetGroup = new THREE.Group();
    scene.add(genSetGroup);

    // Base Frame
    const baseGeom = new THREE.BoxGeometry(10, 0.5, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -0.25;
    genSetGroup.add(base);

    // Engine Block
    const engineGeom = new THREE.BoxGeometry(5, 3, 3);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.set(-2, 1.5, 0);
    genSetGroup.add(engine);

    // Alternator
    const altGeom = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    const altMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const alternator = new THREE.Mesh(altGeom, altMat);
    alternator.rotation.z = Math.PI / 2;
    alternator.position.set(2.5, 1.5, 0);
    genSetGroup.add(alternator);

    // Cooling Fan
    const fanGroup = new THREE.Group();
    fanGroup.position.set(4.2, 1.5, 0);
    genSetGroup.add(fanGroup);

    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    fanHub.rotation.z = Math.PI / 2;
    fanGroup.add(fanHub);

    const bladeGeom = new THREE.BoxGeometry(0.05, 1.5, 0.4);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(bladeGeom, bladeMat);
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * Math.PI) / 3;
      b.position.y = 0.8;
      pivot.add(b);
      fanGroup.add(pivot);
    }

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { frequency, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Fan Rotation
      fanGroup.rotation.x += frequency * 0.01;

      // Vibration effect
      const vib = Math.sin(time * 120) * (vibrationIntensity * 0.03);
      genSetGroup.position.y = vib;

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

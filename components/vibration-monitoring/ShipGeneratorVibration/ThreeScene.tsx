import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeneratorState } from './three-types';

interface ThreeSceneProps {
  state?: GeneratorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<GeneratorState>(state || {
    engineSpeed: 1500,
    vibrationIntensity: 0.15,
    outputPower: 850,
    coolantTemp: 82,
    oilPressure: 0.5
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
    camera.position.set(10, 8, 12);

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

    // Generator Model
    const genGroup = new THREE.Group();
    scene.add(genGroup);

    // Base
    const baseGeom = new THREE.BoxGeometry(8, 0.5, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    genGroup.add(base);

    // Engine Block
    const engineGeom = new THREE.BoxGeometry(4, 3, 3);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.set(-1.5, 1.75, 0);
    genGroup.add(engine);

    // Alternator
    const altGeom = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    const altMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const alt = new THREE.Mesh(altGeom, altMat);
    alt.rotation.z = Math.PI / 2;
    alt.position.set(2.5, 1.75, 0);
    genGroup.add(alt);

    // Radiator
    const radGeom = new THREE.BoxGeometry(0.5, 3, 3);
    const rad = new THREE.Mesh(radGeom, baseMat);
    rad.position.set(-3.75, 1.75, 0);
    genGroup.add(rad);

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x1e293b);
    grid.position.y = -0.25;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { engineSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Vibration effect
      const vib = Math.sin(time * 60) * (vibrationIntensity * 0.05);
      engine.position.y = 1.75 + vib;
      alt.position.y = 1.75 + vib;

      // Subtle rotation of alternator (simulated)
      alt.rotation.x += engineSpeed * 0.0001;

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

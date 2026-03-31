import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CompressorState } from './three-types';

interface ThreeSceneProps {
  state?: CompressorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<CompressorState>(state || {
    rpm: 1200,
    vibrationIntensity: 0.15,
    dischargePressure: 0.8,
    suctionPressure: 0.1,
    temperature: 45
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
    scene.background = null;

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

    // Compressor Model
    const compGroup = new THREE.Group();
    scene.add(compGroup);

    // Main Body
    const bodyGeom = new THREE.BoxGeometry(6, 3, 3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    compGroup.add(body);

    // Cylinders
    const cylGeom = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    
    const cyl1 = new THREE.Mesh(cylGeom, cylMat);
    cyl1.position.set(-1.5, 2, 0);
    compGroup.add(cyl1);

    const cyl2 = new THREE.Mesh(cylGeom, cylMat);
    cyl2.position.set(1.5, 2, 0);
    compGroup.add(cyl2);

    // Pistons (moving)
    const pistonGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    
    const piston1 = new THREE.Mesh(pistonGeom, pistonMat);
    piston1.position.set(-1.5, 2, 0);
    compGroup.add(piston1);

    const piston2 = new THREE.Mesh(pistonGeom, pistonMat);
    piston2.position.set(1.5, 2, 0);
    compGroup.add(piston2);

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

      // Piston movement
      const speed = rpm * 0.005;
      piston1.position.y = 1.5 + Math.sin(time * speed) * 0.8;
      piston2.position.y = 1.5 + Math.sin(time * speed + Math.PI) * 0.8;

      // Vibration effect
      const vib = Math.sin(time * 80) * (vibrationIntensity * 0.05);
      compGroup.position.y = vib;

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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TugboatState } from './three-types';

interface ThreeSceneProps {
  state?: TugboatState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<TugboatState>(state || {
    engineSpeed: 1800,
    vibrationIntensity: 0.2,
    hullStability: 0.95,
    fuelFlow: 120,
    propellerThrust: 350
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
    camera.position.set(20, 15, 20);

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
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Tugboat Model (Simplified)
    const tugGroup = new THREE.Group();
    scene.add(tugGroup);

    // Hull
    const hullGeom = new THREE.BoxGeometry(15, 4, 6);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    tugGroup.add(hull);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(6, 3, 4);
    const cabin = new THREE.Mesh(cabinGeom, hullMat);
    cabin.position.set(-2, 3.5, 0);
    tugGroup.add(cabin);

    // Funnel
    const funnelGeom = new THREE.CylinderGeometry(0.5, 0.5, 2);
    const funnel = new THREE.Mesh(funnelGeom, hullMat);
    funnel.position.set(-3, 6, 0);
    tugGroup.add(funnel);

    // Propeller (Simplified)
    const propellerGeom = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const propellerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1 });
    const propeller = new THREE.Mesh(propellerGeom, propellerMat);
    propeller.rotation.x = Math.PI / 2;
    propeller.position.set(7.5, -1, 0);
    tugGroup.add(propeller);

    // Waves (Simulated)
    const waveGeom = new THREE.PlaneGeometry(50, 50, 32, 32);
    const waveMat = new THREE.MeshStandardMaterial({ 
      color: 0x0088ff, 
      transparent: true, 
      opacity: 0.4, 
      wireframe: true 
    });
    const waves = new THREE.Mesh(waveGeom, waveMat);
    waves.rotation.x = -Math.PI / 2;
    waves.position.y = -2;
    scene.add(waves);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { engineSpeed, vibrationIntensity, hullStability } = stateRef.current;
      const time = Date.now() * 0.001;

      // Propeller rotation
      propeller.rotation.y += engineSpeed * 0.0001;

      // Hull vibration & sway
      const vib = Math.sin(time * 50) * (vibrationIntensity * 0.05);
      const sway = Math.sin(time * 2) * (1 - hullStability) * 0.5;
      tugGroup.position.y = vib;
      tugGroup.rotation.z = sway;
      tugGroup.rotation.x = Math.sin(time * 1.5) * 0.05;

      // Wave animation
      const positions = waves.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
      }
      waves.geometry.attributes.position.needsUpdate = true;

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

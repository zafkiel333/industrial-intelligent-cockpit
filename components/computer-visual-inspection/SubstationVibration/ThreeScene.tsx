import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SubstationStatus } from './three-types';

interface ThreeSceneProps {
  status: SubstationStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<SubstationStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
    camera.position.set(10, 8, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Transformer Model
    const transformerGroup = new THREE.Group();
    scene.add(transformerGroup);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const radiatorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1, roughness: 0.1 });

    // Main Tank
    const tankGeom = new THREE.BoxGeometry(4, 4, 3);
    const tank = new THREE.Mesh(tankGeom, metalMat);
    tank.position.y = 2;
    transformerGroup.add(tank);

    // Radiators
    const radiatorGeom = new THREE.BoxGeometry(0.5, 3.5, 2.5);
    for (let i = 0; i < 2; i++) {
      const rad = new THREE.Mesh(radiatorGeom, radiatorMat);
      rad.position.set(i === 0 ? -2.3 : 2.3, 2, 0);
      transformerGroup.add(rad);
    }

    // Bushings
    const bushingGeom = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    for (let i = 0; i < 3; i++) {
      const bushing = new THREE.Mesh(bushingGeom, bushingMat);
      bushing.position.set(-1 + i, 4.5, 0.5);
      transformerGroup.add(bushing);
    }

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Vibration effect
      if (s.isOperating) {
        const amp = s.vibrationAmplitude / 1000; // Scale down for visual
        const freq = s.vibrationFrequency / 10;
        transformerGroup.position.y = Math.sin(time * freq * 10) * amp;
        transformerGroup.position.x = Math.cos(time * freq * 12) * amp * 0.5;
      } else {
        transformerGroup.position.set(0, 0, 0);
      }

      // Temperature Glow
      const tempFactor = Math.max(0, (s.transformerTemp - 40) / 60);
      tank.material.emissive.setHex(0xff0000);
      tank.material.emissiveIntensity = tempFactor * 0.5;

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

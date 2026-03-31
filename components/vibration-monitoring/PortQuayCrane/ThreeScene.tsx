import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { QuayCraneState } from './three-types';

interface ThreeSceneProps {
  state?: QuayCraneState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<QuayCraneState>(state || {
    trolleySpeed: 2.5,
    vibrationIntensity: 0.2,
    railImpact: 0.5,
    loadWeight: 45,
    trolleyPosition: 0
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
    camera.position.set(20, 15, 25);

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

    // Quay Crane Model
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    // Main Girder
    const girderGeom = new THREE.BoxGeometry(30, 1.5, 3);
    const girderMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const girder = new THREE.Mesh(girderGeom, girderMat);
    craneGroup.add(girder);

    // Rails
    const railGeom = new THREE.BoxGeometry(30, 0.2, 0.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    
    const rail1 = new THREE.Mesh(railGeom, railMat);
    rail1.position.set(0, 0.85, 1);
    craneGroup.add(rail1);

    const rail2 = new THREE.Mesh(railGeom, railMat);
    rail2.position.set(0, 0.85, -1);
    craneGroup.add(rail2);

    // Trolley
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.y = 1.2;
    craneGroup.add(trolleyGroup);

    const trolleyGeom = new THREE.BoxGeometry(3, 1, 2.5);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const trolley = new THREE.Mesh(trolleyGeom, trolleyMat);
    trolleyGroup.add(trolley);

    // Spreader
    const spreaderGeom = new THREE.BoxGeometry(4, 0.5, 2);
    const spreaderMat = new THREE.MeshStandardMaterial({ color: 0x0e7490 });
    const spreader = new THREE.Mesh(spreaderGeom, spreaderMat);
    spreader.position.y = -4;
    trolleyGroup.add(spreader);

    // Cables
    const cableGeom = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    
    const cable1 = new THREE.Mesh(cableGeom, cableMat);
    cable1.position.set(1, -2, 0.8);
    trolleyGroup.add(cable1);

    const cable2 = new THREE.Mesh(cableGeom, cableMat);
    cable2.position.set(-1, -2, 0.8);
    trolleyGroup.add(cable2);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    let currentPos = 0;
    let direction = 1;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { trolleySpeed, vibrationIntensity, railImpact } = stateRef.current;
      const time = Date.now() * 0.001;

      // Trolley Movement
      currentPos += trolleySpeed * 0.01 * direction;
      if (Math.abs(currentPos) > 12) direction *= -1;
      trolleyGroup.position.x = currentPos;

      // Vibration effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.05);
      trolleyGroup.position.y = 1.2 + vib;

      // Impact effect (visualized as a flash on rails when trolley passes certain points)
      if (Math.abs(currentPos % 5) < 0.1) {
        railMat.emissiveIntensity = 2 + railImpact;
      } else {
        railMat.emissiveIntensity = 0.5;
      }

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

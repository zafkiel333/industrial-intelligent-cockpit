import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CoolingTowerStatus } from './three-types';

interface ThreeSceneProps {
  status: CoolingTowerStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<CoolingTowerStatus>(status);

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
    camera.position.set(15, 10, 15);

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

    // Tower Model
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    const towerMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.2, 
      roughness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    
    // Main Body (Hyperboloid-ish)
    const towerGeom = new THREE.CylinderGeometry(4, 6, 12, 32, 1, true);
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 6;
    towerGroup.add(tower);

    // Fan
    const fanGroup = new THREE.Group();
    fanGroup.position.y = 12;
    towerGroup.add(fanGroup);

    const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const bladeGeom = new THREE.BoxGeometry(0.2, 0.1, 3.5);
      const blade = new THREE.Mesh(bladeGeom, fanMat);
      blade.rotation.y = (i / 4) * Math.PI * 2;
      blade.position.set(Math.sin(blade.rotation.y) * 1.75, 0, Math.cos(blade.rotation.y) * 1.75);
      fanGroup.add(blade);
    }

    // Scaling Visualization (Internal)
    const scalingGeom = new THREE.CylinderGeometry(3.5, 5.5, 10, 32);
    const scalingMat = new THREE.MeshStandardMaterial({ 
      color: 0xf59e0b, 
      transparent: true, 
      opacity: 0,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5
    });
    const scalingMesh = new THREE.Mesh(scalingGeom, scalingMat);
    scalingMesh.position.y = 6;
    towerGroup.add(scalingMesh);

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

      // Fan Rotation
      fanGroup.rotation.y += (s.fanSpeed / 1000);

      // Scaling Visual
      scalingMat.opacity = (s.scalingLevel / 100) * 0.6;
      scalingMat.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.2;
      
      // Efficiency Pulse
      if (s.efficiency < 70) {
        towerMat.emissive.setHex(0xef4444);
        towerMat.emissiveIntensity = 0.1 + Math.sin(time * 5) * 0.1;
      } else {
        towerMat.emissiveIntensity = 0;
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

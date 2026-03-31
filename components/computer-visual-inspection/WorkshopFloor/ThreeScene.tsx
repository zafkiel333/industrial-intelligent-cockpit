import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FloorStatus } from './three-types';

interface ThreeSceneProps {
  status: FloorStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<FloorStatus>(status);

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

    // Floor Model
    const floorGeom = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.5, 
      roughness: 0.8 
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x334155);
    grid.position.y = 0.01;
    scene.add(grid);

    // Scanning Line
    const scanGeom = new THREE.BoxGeometry(20, 0.1, 0.1);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
    const scanLine = new THREE.Mesh(scanGeom, scanMat);
    scanLine.position.y = 0.05;
    scene.add(scanLine);

    // Spots
    const spotGroup = new THREE.Group();
    scene.add(spotGroup);

    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    const oilMat = new THREE.MeshStandardMaterial({ 
      color: 0x111827, 
      transparent: true, 
      opacity: 0.8,
      metalness: 1,
      roughness: 0.05,
      emissive: 0x330033
    });

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Scanning Line Animation
      scanLine.position.z = Math.sin(time) * 10;

      // Update Spots
      if (spotGroup.children.length !== s.detectedSpots.length) {
        spotGroup.clear();
        s.detectedSpots.forEach(spot => {
          const geom = new THREE.CircleGeometry(spot.size, 32);
          const mesh = new THREE.Mesh(geom, spot.type === 'water' ? waterMat : oilMat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.set(spot.x, 0.02, spot.y);
          spotGroup.add(mesh);
        });
      }

      // Pulsing Spots
      spotGroup.children.forEach((mesh, i) => {
        mesh.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.05);
      });

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

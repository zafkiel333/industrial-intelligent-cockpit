import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FenderState } from './three-types';

interface ThreeSceneProps {
  state: FenderState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
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
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Dock Wall
    const wallGeometry = new THREE.BoxGeometry(20, 10, 2);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.z = -2;
    scene.add(wall);

    // Fender (Cylindrical)
    const fenderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
    const fenderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const fender = new THREE.Mesh(fenderGeometry, fenderMaterial);
    fender.rotation.z = Math.PI / 2;
    scene.add(fender);

    // Ship Hull (Simplified)
    const hullGeometry = new THREE.BoxGeometry(15, 8, 1);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.z = 3;
    scene.add(hull);

    // Pressure Heatmap (Visualized as a glowing ring)
    const ringGeometry = new THREE.TorusGeometry(1.6, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = Math.PI / 2;
    scene.add(ring);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { compression } = stateRef.current;
      
      // Compress fender (scale in Z)
      fender.scale.x = 1 - (compression * 0.5); // Using X because of rotation
      fender.position.z = -compression * 0.75;

      // Move hull
      hull.position.z = 2.5 - (compression * 1.5);

      // Update ring color based on compression
      if (compression > 0.7) {
        ringMaterial.color.setHex(0xf43f5e); // Rose
      } else if (compression > 0.4) {
        ringMaterial.color.setHex(0xf59e0b); // Amber
      } else {
        ringMaterial.color.setHex(0x06b6d4); // Cyan
      }
      ring.scale.set(1 + compression * 0.2, 1 + compression * 0.2, 1);
      ring.position.z = fender.position.z + 1.5 * fender.scale.x;

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
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

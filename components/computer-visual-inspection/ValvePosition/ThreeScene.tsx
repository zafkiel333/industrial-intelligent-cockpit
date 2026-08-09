import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ValveStatus } from './three-types';

interface ThreeSceneProps {
  status: ValveStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<ValveStatus>(status);

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
    camera.position.set(8, 6, 8);

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

    // Valve Model
    const valveGroup = new THREE.Group();
    scene.add(valveGroup);

    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x000000
    });
    
    // Main Body
    const bodyGeom = new THREE.CylinderGeometry(1, 1, 3, 32);
    const body = new THREE.Mesh(bodyGeom, metalMat);
    body.rotation.z = Math.PI / 2;
    valveGroup.add(body);

    // Flanges
    const flangeGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32);
    const flange1 = new THREE.Mesh(flangeGeom, metalMat);
    flange1.rotation.z = Math.PI / 2;
    flange1.position.x = -1.3;
    valveGroup.add(flange1);

    const flange2 = new THREE.Mesh(flangeGeom, metalMat);
    flange2.rotation.z = Math.PI / 2;
    flange2.position.x = 1.3;
    valveGroup.add(flange2);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
    const stem = new THREE.Mesh(stemGeom, metalMat);
    stem.position.y = 1;
    valveGroup.add(stem);

    // Handwheel
    const wheelGroup = new THREE.Group();
    wheelGroup.position.y = 2;
    valveGroup.add(wheelGroup);

    const wheelGeom = new THREE.TorusGeometry(1, 0.15, 16, 100);
    const wheel = new THREE.Mesh(wheelGeom, metalMat);
    wheel.rotation.x = Math.PI / 2;
    wheelGroup.add(wheel);

    // Spokes
    for (let i = 0; i < 4; i++) {
      const spokeGeom = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
      const spoke = new THREE.Mesh(spokeGeom, metalMat);
      spoke.rotation.z = Math.PI / 2;
      spoke.rotation.y = (i / 4) * Math.PI * 2;
      wheelGroup.add(spoke);
    }

    // Grid
    const grid = new THREE.GridHelper(15, 15, 0x00ffff, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = statusRef.current;

      // Valve Position Animation
      // Stem moves up/down based on opening
      const targetY = 1 + (s.openingPercentage / 100) * 0.5;
      stem.position.y += (targetY - stem.position.y) * 0.1;
      wheelGroup.position.y = stem.position.y + 1;
      
      // Wheel rotation based on opening
      wheelGroup.rotation.y = (s.openingPercentage / 100) * Math.PI * 4;

      // Status Indicator
      if (s.openingPercentage > 0 && s.openingPercentage < 100) {
        metalMat.emissive.setHex(0x3b82f6);
        metalMat.emissiveIntensity = 0.1;
      } else if (s.openingPercentage === 100) {
        metalMat.emissive.setHex(0x10b981);
        metalMat.emissiveIntensity = 0.1;
      } else {
        metalMat.emissive.setHex(0xef4444);
        metalMat.emissiveIntensity = 0.1;
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

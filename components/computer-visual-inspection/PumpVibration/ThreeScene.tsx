import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpVibrationStatus } from './three-types';

interface ThreeSceneProps {
  status: PumpVibrationStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<PumpVibrationStatus>(status);

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
    camera.position.set(12, 8, 12);

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

    // Pump Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    const pumpMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x000000
    });
    
    // Base
    const baseGeom = new THREE.BoxGeometry(6, 0.5, 4);
    const base = new THREE.Mesh(baseGeom, pumpMat);
    pumpGroup.add(base);

    // Motor
    const motorGeom = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    const motor = new THREE.Mesh(motorGeom, pumpMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-1.5, 1.5, 0);
    pumpGroup.add(motor);

    // Pump Body
    const bodyGeom = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const body = new THREE.Mesh(bodyGeom, pumpMat);
    body.rotation.z = Math.PI / 2;
    body.position.set(1.5, 1.5, 0);
    pumpGroup.add(body);

    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const shaft = new THREE.Mesh(shaftGeom, pumpMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 1.5, 0);
    pumpGroup.add(shaft);

    // Vibration Visualization (Visual Magnification)
    const vibrationGroup = new THREE.Group();
    pumpGroup.add(vibrationGroup);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -0.25;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Vibration Effect (Exaggerated for visual magnification)
      const amp = s.vibrationAmplitude * 0.05; // Magnification factor
      const freq = s.vibrationFrequency * 0.1;
      
      if (s.isAbnormal) {
        pumpGroup.position.y = Math.sin(time * freq * 10) * amp;
        pumpGroup.rotation.z = Math.sin(time * freq * 8) * (amp * 0.1);
        pumpGroup.rotation.x = Math.cos(time * freq * 12) * (amp * 0.05);
        
        // Red Pulse
        pumpMat.emissive.setHex(0xef4444);
        pumpMat.emissiveIntensity = 0.2 + Math.sin(time * 10) * 0.2;
      } else {
        pumpGroup.position.y = Math.sin(time * 2) * 0.01;
        pumpGroup.rotation.z = 0;
        pumpGroup.rotation.x = 0;
        pumpMat.emissiveIntensity = 0;
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

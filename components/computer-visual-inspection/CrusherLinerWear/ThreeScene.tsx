import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LinerWear } from './three-types';

interface ThreeSceneProps {
  linerWears: LinerWear[];
  isRotating: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ linerWears, isRotating }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ linerWears, isRotating });

  useEffect(() => {
    propsRef.current = { linerWears, isRotating };
  }, [linerWears, isRotating]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Crusher Body (Simplified Cone)
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    const outerGeo = new THREE.CylinderGeometry(5, 8, 10, 32, 1, true);
    const outerMat = new THREE.MeshPhongMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    crusherGroup.add(outer);

    // Inner Mantle
    const innerGeo = new THREE.CylinderGeometry(2, 4, 8, 32);
    const innerMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    crusherGroup.add(inner);

    // 2. Liner Wear Markers
    const wearGroup = new THREE.Group();
    crusherGroup.add(wearGroup);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 100);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { linerWears: currentWears, isRotating: currentRotating } = propsRef.current;

      if (currentRotating) {
        crusherGroup.rotation.y += 0.01;
      }

      // Update wear markers
      if (wearGroup.children.length !== currentWears.length) {
        while(wearGroup.children.length > 0) {
          wearGroup.remove(wearGroup.children[0]);
        }
        currentWears.forEach(wear => {
          const markerGeo = new THREE.SphereGeometry(0.4, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({ 
            color: wear.severity === 'high' ? 0xef4444 : 0xf59e0b,
            transparent: true,
            opacity: 0.8
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(wear.position[0], wear.position[1], wear.position[2]);
          wearGroup.add(marker);
        });
      }

      // Pulse wear markers
      wearGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.3);
        }
      });

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

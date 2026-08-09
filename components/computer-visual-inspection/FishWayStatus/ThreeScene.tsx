import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Fish } from './three-types';

interface ThreeSceneProps {
  fishList: Fish[];
  waterVelocity: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ fishList, waterVelocity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ fishList, waterVelocity });

  useEffect(() => {
    propsRef.current = { fishList, waterVelocity };
  }, [fishList, waterVelocity]);

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
    camera.position.set(0, 10, 20);
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

    // 1. Fishway Ladder (Simplified)
    const ladderGroup = new THREE.Group();
    scene.add(ladderGroup);

    const stepCount = 5;
    const stepGeo = new THREE.BoxGeometry(10, 1, 4);
    const stepMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 });

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(0, i * 1.5 - 3, i * 4 - 8);
      ladderGroup.add(step);
    }

    // 2. Water Surface
    const waterGeo = new THREE.PlaneGeometry(10, 20);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 4;
    water.position.y = 1;
    scene.add(water);

    // 3. Fish Group
    const fishGroup = new THREE.Group();
    scene.add(fishGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { fishList: currentFish } = propsRef.current;

      // Update fish
      if (fishGroup.children.length !== currentFish.length) {
        while(fishGroup.children.length > 0) {
          fishGroup.remove(fishGroup.children[0]);
        }
        currentFish.forEach(fish => {
          const fishGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
          const fishMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const fishMesh = new THREE.Mesh(fishGeo, fishMat);
          fishMesh.position.set(fish.position[0], fish.position[1], fish.position[2]);
          fishMesh.rotation.z = Math.PI / 2;
          fishGroup.add(fishMesh);
        });
      }

      // Animate fish movement
      fishGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.z += 0.05 + Math.random() * 0.02;
          child.position.x += Math.sin(Date.now() * 0.005 + i) * 0.02;
          child.position.y += Math.cos(Date.now() * 0.005 + i) * 0.01;

          if (child.position.z > 10) {
            child.position.z = -10;
          }
        }
      });

      water.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.1;

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

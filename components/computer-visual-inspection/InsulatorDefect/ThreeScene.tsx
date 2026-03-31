import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InsulatorDefect } from './three-types';

interface ThreeSceneProps {
  defects: InsulatorDefect[];
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ defects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ defects });

  useEffect(() => {
    propsRef.current = { defects };
  }, [defects]);

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
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // 1. Insulator String
    const insulatorCount = 10;
    const insulators: THREE.Mesh[] = [];
    const insulatorGroup = new THREE.Group();
    scene.add(insulatorGroup);

    for (let i = 0; i < insulatorCount; i++) {
      // Disk shape
      const diskGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
      const diskMat = new THREE.MeshPhongMaterial({ 
        color: 0x94a3b8, 
        transparent: true, 
        opacity: 0.8,
        shininess: 100
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      disk.position.y = (i - insulatorCount / 2) * 0.8;
      disk.rotation.x = Math.PI / 2;
      insulatorGroup.add(disk);
      insulators.push(disk);

      // Core
      const coreGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
      const coreMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = (i - insulatorCount / 2) * 0.8;
      insulatorGroup.add(core);
    }

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    // 3. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { defects: currentDefects } = propsRef.current;

      // Update insulator colors based on defects
      insulators.forEach((insulator, idx) => {
        const defect = currentDefects.find(d => d.index === idx);
        if (defect) {
          (insulator.material as THREE.MeshPhongMaterial).color.set(0xef4444);
          (insulator.material as THREE.MeshPhongMaterial).emissive.set(0xef4444);
          (insulator.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        } else {
          (insulator.material as THREE.MeshPhongMaterial).color.set(0x94a3b8);
          (insulator.material as THREE.MeshPhongMaterial).emissive.set(0x000000);
        }
      });

      insulatorGroup.rotation.y += 0.01;
      insulatorGroup.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

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

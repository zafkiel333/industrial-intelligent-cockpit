import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PipeHangerStatus } from './three-types';

interface ThreeSceneProps {
  status: PipeHangerStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<PipeHangerStatus>(status);

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

    // Hanger Model
    const hangerGroup = new THREE.Group();
    scene.add(hangerGroup);

    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x000000
    });
    
    // Pipe
    const pipeGeom = new THREE.CylinderGeometry(1, 1, 10, 32);
    const pipe = new THREE.Mesh(pipeGeom, metalMat);
    pipe.rotation.z = Math.PI / 2;
    hangerGroup.add(pipe);

    // Hanger Rod
    const rodGeom = new THREE.CylinderGeometry(0.1, 0.1, 5, 16);
    const rod = new THREE.Mesh(rodGeom, metalMat);
    rod.position.y = 3.5;
    hangerGroup.add(rod);

    // Spring Housing
    const springGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    const spring = new THREE.Mesh(springGeom, metalMat);
    spring.position.y = 5;
    hangerGroup.add(spring);

    // Clamp
    const clampGeom = new THREE.TorusGeometry(1.1, 0.1, 16, 100, Math.PI);
    const clamp = new THREE.Mesh(clampGeom, metalMat);
    clamp.rotation.x = Math.PI / 2;
    clamp.position.y = 1;
    hangerGroup.add(clamp);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Displacement Animation (Visual Magnification)
      const targetX = s.displacementX * 0.05;
      const targetY = s.displacementY * 0.05;
      const targetZ = s.displacementZ * 0.05;
      
      hangerGroup.position.x += (targetX - hangerGroup.position.x) * 0.1;
      hangerGroup.position.y += (targetY - hangerGroup.position.y) * 0.1;
      hangerGroup.position.z += (targetZ - hangerGroup.position.z) * 0.1;
      
      hangerGroup.rotation.z = (s.tiltAngle / 180) * Math.PI;

      // Status Indicator
      if (s.isFailed) {
        metalMat.emissive.setHex(0xef4444);
        metalMat.emissiveIntensity = 0.2 + Math.sin(time * 10) * 0.2;
      } else if (Math.abs(s.displacementX) > 5 || Math.abs(s.displacementY) > 5) {
        metalMat.emissive.setHex(0xf59e0b);
        metalMat.emissiveIntensity = 0.1 + Math.sin(time * 5) * 0.1;
      } else {
        metalMat.emissiveIntensity = 0;
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

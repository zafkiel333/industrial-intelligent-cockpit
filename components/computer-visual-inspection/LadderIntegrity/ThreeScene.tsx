import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LadderStatus } from './three-types';

interface ThreeSceneProps {
  status: LadderStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<LadderStatus>(status);

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
    camera.position.set(5, 10, 15);

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

    // Ladder Model
    const ladderGroup = new THREE.Group();
    scene.add(ladderGroup);

    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x000000
    });
    
    // Rails
    const railGeom = new THREE.CylinderGeometry(0.1, 0.1, 15, 16);
    const rail1 = new THREE.Mesh(railGeom, metalMat);
    rail1.position.x = -1.5;
    rail1.position.y = 7.5;
    ladderGroup.add(rail1);

    const rail2 = new THREE.Mesh(railGeom, metalMat);
    rail2.position.x = 1.5;
    rail2.position.y = 7.5;
    ladderGroup.add(rail2);

    // Rungs
    const rungGeom = new THREE.CylinderGeometry(0.08, 0.08, 3, 16);
    for (let i = 0; i < 15; i++) {
      const rung = new THREE.Mesh(rungGeom, metalMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.y = i * 1;
      ladderGroup.add(rung);
    }

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

      // Deformation Animation (Visual Magnification)
      const defX = s.deformationX * 0.01;
      const defY = s.deformationY * 0.01;
      
      ladderGroup.rotation.z = Math.sin(time * 2) * defX;
      ladderGroup.rotation.x = Math.cos(time * 2) * defY;

      // Status Indicator
      if (!s.isSafe) {
        metalMat.emissive.setHex(0xef4444);
        metalMat.emissiveIntensity = 0.2 + Math.sin(time * 10) * 0.2;
      } else if (s.corrosionLevel > 30) {
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

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BearingState } from './three-types';

interface ThreeSceneProps {
  state: BearingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BearingState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Bearing Housing (Lower half)
    const housingGeo = new THREE.CylinderGeometry(4.2, 4.2, 6, 32, 1, false, 0, Math.PI);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, side: THREE.DoubleSide });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.z = Math.PI / 2;
    housing.rotation.y = Math.PI / 2;
    housing.position.y = -1;
    scene.add(housing);

    // Babbitt Bearing Surface (Inside housing)
    const babbittGeo = new THREE.CylinderGeometry(4, 4, 5.8, 64, 1, true, 0, Math.PI);
    
    // Create a custom texture for contact points
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    
    const babbittMat = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0, // Silver/white babbitt metal
      metalness: 0.4,
      roughness: 0.6,
      map: texture,
      side: THREE.DoubleSide
    });
    const babbitt = new THREE.Mesh(babbittGeo, babbittMat);
    babbitt.rotation.z = Math.PI / 2;
    babbitt.rotation.y = Math.PI / 2;
    babbitt.position.y = -0.9;
    scene.add(babbitt);

    // Hollow Shaft (Journal)
    const shaftGeo = new THREE.CylinderGeometry(3.95, 3.95, 8, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.y = 0;
    scene.add(shaft);

    // Scraping Tool
    const toolGroup = new THREE.Group();
    const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }); // violet handle
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1;
    toolGroup.add(handle);
    
    const bladeGeo = new THREE.BoxGeometry(0.4, 0.5, 0.05);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0;
    toolGroup.add(blade);
    
    toolGroup.position.set(0, 2, 2);
    toolGroup.rotation.x = -Math.PI / 4;
    scene.add(toolGroup);

    let animationFrameId: number;
    let scrapeAngle = 0;

    const updateTexture = (points: number) => {
      ctx.fillStyle = '#e2e8f0'; // Base babbitt color
      ctx.fillRect(0, 0, 512, 256);
      
      // Draw contact points (red/blue spots)
      // More points = worse contact (initial state)
      // Fewer points = better contact (scraped state)
      ctx.fillStyle = 'rgba(220, 38, 38, 0.6)'; // Red lead spots
      
      // Use a seeded random approach based on points to keep spots consistent but reducing
      for (let i = 0; i < points * 5; i++) {
        const x = (Math.sin(i * 12.3) * 0.5 + 0.5) * 512;
        const y = (Math.cos(i * 45.6) * 0.5 + 0.5) * 256;
        const radius = 2 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      texture.needsUpdate = true;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      updateTexture(currentState.contactPoints);

      if (currentState.isRotating) {
        shaft.rotation.x += 0.02;
        toolGroup.visible = false;
        shaft.position.y = -0.9; // Lowered into bearing
      } else {
        shaft.position.y = THREE.MathUtils.lerp(shaft.position.y, 3, 0.1); // Lifted for scraping
        toolGroup.visible = true;
        
        if (currentState.isScraping) {
          // Scraping animation
          scrapeAngle += 0.2;
          toolGroup.position.x = Math.sin(scrapeAngle) * 2;
          toolGroup.position.z = 1.5 + Math.cos(scrapeAngle * 0.5) * 0.5;
          toolGroup.position.y = 0.5 + Math.sin(scrapeAngle * 2) * 0.1;
        } else {
          // Idle tool
          toolGroup.position.lerp(new THREE.Vector3(0, 2, 2), 0.1);
        }
      }

      // Slowly rotate scene for better view
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

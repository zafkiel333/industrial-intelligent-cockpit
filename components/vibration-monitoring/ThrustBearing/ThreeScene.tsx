import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Thrust Bearing Base - More detailed
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const baseGeo = new THREE.CylinderGeometry(16, 20, 6, 64);
    const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x020617
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    baseGroup.add(base);

    // Thrust Pads (12 pads) - More detailed
    const pads: THREE.Mesh[] = [];
    const padCount = 12;
    for (let i = 0; i < padCount; i++) {
      const angle = (i / padCount) * Math.PI * 2;
      const padGeo = new THREE.BoxGeometry(5, 1.5, 8);
      const padMat = new THREE.MeshStandardMaterial({ 
        color: 0x06b6d4, 
        emissive: 0x06b6d4, 
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(Math.cos(angle) * 11, 3.5, Math.sin(angle) * 11);
      pad.rotation.y = -angle;
      pad.rotation.x = 0.05; // Slight tilt
      baseGroup.add(pad);
      pads.push(pad);
    }

    // Rotating Collar
    const collarGroup = new THREE.Group();
    scene.add(collarGroup);

    const collarGeo = new THREE.CylinderGeometry(14, 14, 2, 64);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1, roughness: 0.1 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 5.5;
    collarGroup.add(collar);

    // Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(6, 6, 30, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 15;
    collarGroup.add(shaft);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x06b6d4, 2, 50);
    mainLight.position.set(15, 15, 15);
    scene.add(mainLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      collarGroup.rotation.y += 0.02;
      
      // Simulate load distribution fluctuation
      pads.forEach((pad, i) => {
        const intensity = 0.2 + Math.sin(time * 2 + i) * 0.6;
        (pad.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        pad.position.y = 3.5 + intensity * 0.3;
        pad.rotation.x = 0.05 + intensity * 0.05;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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

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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Fender Model
    const fenderGroup = new THREE.Group();
    scene.add(fenderGroup);

    // Wall/Dock
    const wallGeom = new THREE.BoxGeometry(2, 30, 40);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.x = -10;
    fenderGroup.add(wall);

    // Rubber Fender (Cone Fender)
    const fenderGeom = new THREE.CylinderGeometry(4, 6, 8, 32);
    const fenderMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1
    });
    const fender = new THREE.Mesh(fenderGeom, fenderMat);
    fender.rotation.z = Math.PI / 2;
    fender.position.x = -5;
    fenderGroup.add(fender);

    // Front Panel
    const panelGeom = new THREE.BoxGeometry(1, 12, 12);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const panel = new THREE.Mesh(panelGeom, panelMat);
    panel.position.x = -1;
    fenderGroup.add(panel);

    // Ship Hull (Simplified)
    const shipHullGeom = new THREE.BoxGeometry(10, 25, 30);
    const shipHullMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const shipHull = new THREE.Mesh(shipHullGeom, shipHullMat);
    shipHull.position.x = 15;
    fenderGroup.add(shipHull);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Ship movement (berthing simulation)
      const shipPos = 15 + Math.sin(time * 0.5) * 2;
      shipHull.position.x = shipPos;
      
      // Fender compression simulation
      if (shipPos < 14) {
        const compression = (14 - shipPos) * 0.5;
        fender.scale.x = 1 - compression;
        panel.position.x = -1 - compression * 4;
      } else {
        fender.scale.x = 1;
        panel.position.x = -1;
      }

      // Vibration effect on panel during "impact"
      if (shipPos < 13.5) {
        panel.position.y = Math.sin(time * 60) * 0.1;
        panel.position.z = Math.cos(time * 60) * 0.1;
      }

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

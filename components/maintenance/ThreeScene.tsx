import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MaintenanceThreeProps } from './three-types';

export const MaintenanceThreeScene: React.FC<MaintenanceThreeProps> = ({ 
  highlightZone = 'none', 
  statusColor = '#06b6d4',
  isScanning = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    // Group for the industrial object
    const group = new THREE.Group();
    scene.add(group);

    // Create a "Complex Component" using primitives
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 4, 32);
    const baseMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      shininess: 100, 
      transparent: true, 
      opacity: 0.8 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    // Highlightable parts
    const createPart = (y: number, r: number, color: number) => {
      const geo = new THREE.TorusGeometry(r, 0.1, 16, 100);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
      const part = new THREE.Mesh(geo, mat);
      part.rotation.x = Math.PI / 2;
      part.position.y = y;
      return part;
    };

    const bearing = createPart(1.5, 1.2, 0xffa500); // Amber
    const gear = createPart(0, 2.0, 0x06b6d4);    // Cyan
    const cooling = createPart(-1.5, 1.2, 0xef4444); // Red
    
    group.add(bearing, gear, cooling);

    // Scanning Plane (Laser Effect)
    const scanGeo = new THREE.PlaneGeometry(6, 6);
    const scanMat = new THREE.MeshBasicMaterial({ 
      color: statusColor, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // Grid helper for tech feel
    const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
    grid.position.y = -2.5;
    scene.add(grid);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.02;
      
      // Update scanning plane
      if (isScanning) {
        scanPlane.position.y = Math.sin(frame) * 2.5;
        scanPlane.material.opacity = (Math.sin(frame * 2) + 1) * 0.1;
      }

      // Update Highlights
      bearing.visible = highlightZone === 'bearing';
      gear.visible = highlightZone === 'gear';
      cooling.visible = highlightZone === 'cooling';
      if (bearing.visible) bearing.scale.setScalar(1 + Math.sin(frame * 5) * 0.1);

      group.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [highlightZone, statusColor, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
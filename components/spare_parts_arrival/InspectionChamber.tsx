import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrivalThreeProps } from './three-types';

export const InspectionChamber: React.FC<ArrivalThreeProps> = ({ 
  activeNode, 
  scanProgress,
  isScanning 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // --- 工业基座 ---
    const baseGeo = new THREE.CylinderGeometry(5, 5.5, 0.5, 6);
    const baseMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      emissive: 0x0ea5e9, 
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2;
    scene.add(base);

    // 辅助网格
    const grid = new THREE.GridHelper(12, 24, 0x0ea5e9, 0x1e293b);
    grid.position.y = -1.74;
    scene.add(grid);

    // --- 备件模型容器 ---
    const partGroup = new THREE.Group();
    scene.add(partGroup);

    // 创建备件主体 (模拟叶轮)
    const geometry = new THREE.TorusKnotGeometry(2.5, 0.8, 100, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.2,
      transmission: 0.3,
      thickness: 1,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    partGroup.add(mesh);

    // 线框外壳
    const wireGeo = new THREE.TorusKnotGeometry(2.52, 0.82, 100, 16);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    partGroup.add(wireMesh);

    // --- 激光扫描门 ---
    const scanPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // 扫描边框线
    const scanEdgeGeo = new THREE.EdgesGeometry(scanPlaneGeo);
    const scanEdgeMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0 });
    const scanEdge = new THREE.LineSegments(scanEdgeGeo, scanEdgeMat);
    scanPlane.add(scanEdge);

    // --- 环境光效 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 10, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      partGroup.rotation.y += 0.005;

      if (isScanning) {
        // 扫描面动画：根据进度在 -3 到 3 之间移动
        const yPos = -3 + (scanProgress / 100) * 6;
        scanPlane.position.y = yPos;
        scanPlaneMat.opacity = 0.3 + Math.sin(time * 10) * 0.1;
        scanEdgeMat.opacity = 0.8 + Math.sin(time * 15) * 0.2;
        
        // 材质变色模拟
        material.emissive.setHex(0x0ea5e9);
        material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
      } else {
        scanPlaneMat.opacity = 0;
        scanEdgeMat.opacity = 0;
        material.emissiveIntensity = 0.1;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [isScanning, scanProgress]);

  return <div ref={mountRef} className="w-full h-full" />;
};
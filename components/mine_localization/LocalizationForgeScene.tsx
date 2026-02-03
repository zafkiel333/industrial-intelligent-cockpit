
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocalizationForgeProps } from './three-types';

export const LocalizationForgeScene: React.FC<LocalizationForgeProps> = ({ 
  activeNode, 
  reconstructionProgress,
  showXRay,
  onPartClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); 
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0; // 显著提升场景亮度
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    // --- 全方位照明方案 ---
    const ambient = new THREE.AmbientLight(0xffffff, 1.8); // 强力环境光
    scene.add(ambient);

    const pointTop = new THREE.PointLight(0x0ea5e9, 20, 50); // 顶部冷光
    pointTop.position.set(5, 15, 5);
    scene.add(pointTop);

    const pointBottom = new THREE.PointLight(0xf97316, 15, 40); // 底部暖光（模拟熔炉）
    pointBottom.position.set(-5, -5, -5);
    scene.add(pointBottom);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(20, 20, 10);
    scene.add(keyLight);

    // --- 核心模型 ---
    const forgeGroup = new THREE.Group();
    scene.add(forgeGroup);

    // 材质定义
    const domesticMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      metalness: 1.0,
      roughness: 0.1,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.2,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0
    });

    const importedMat = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      emissive: 0xef4444,
      emissiveIntensity: 0.5
    });

    // 几何体生成 (根据类型)
    let geometry;
    if (activeNode.type === 'rotor') {
      geometry = new THREE.CylinderGeometry(3, 3, 10, 32);
    } else {
      geometry = new THREE.IcosahedronGeometry(4, 2);
    }

    const importedMesh = new THREE.Mesh(geometry, importedMat);
    forgeGroup.add(importedMesh);

    const domesticMesh = new THREE.Mesh(geometry, domesticMat);
    domesticMesh.scale.setScalar(1.02);
    forgeGroup.add(domesticMesh);

    // 扫描特效
    const scanLineGeo = new THREE.TorusGeometry(6, 0.05, 16, 100);
    const scanLineMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0 });
    const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
    scanLine.rotation.x = Math.PI / 2;
    scene.add(scanLine);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 重构进度视觉反馈
      domesticMat.opacity = reconstructionProgress;
      importedMat.opacity = 0.4 * (1 - reconstructionProgress);
      
      if (reconstructionProgress > 0 && reconstructionProgress < 1) {
          scanLineMat.opacity = 0.8 + Math.sin(time * 10) * 0.2;
          scanLine.position.y = Math.sin(time * 3) * 6;
      } else {
          scanLineMat.opacity = 0;
      }

      forgeGroup.rotation.y += 0.005;
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
  }, [activeNode, reconstructionProgress]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

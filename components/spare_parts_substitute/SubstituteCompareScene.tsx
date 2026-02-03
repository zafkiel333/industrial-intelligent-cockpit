import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SubstituteThreeProps } from './three-types';

export const SubstituteCompareScene: React.FC<SubstituteThreeProps> = ({ 
  originalType,
  substituteType,
  matchScore,
  isScanning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // --- 几何体工厂 ---
    const getGeometry = (type: string) => {
      switch (type) {
        case 'bearing': return new THREE.TorusGeometry(2, 0.6, 16, 100);
        case 'gear': return new THREE.CylinderGeometry(2, 2, 0.8, 12);
        case 'valve': return new THREE.SphereGeometry(1.8, 32, 32);
        case 'shaft': return new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
        default: return new THREE.BoxGeometry(2, 2, 2);
      }
    };

    // --- 容器 ---
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // 1. 原件 (左侧 - 全息感)
    const originalGeo = getGeometry(originalType);
    const originalMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const originalMesh = new THREE.Mesh(originalGeo, originalMat);
    originalMesh.position.set(-3, 0, 0);
    pivotGroup.add(originalMesh);

    // 2. 替代件 (右侧 - 实体感)
    const subGeo = getGeometry(substituteType);
    const subMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xf59e0b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.set(3, 0, 0);
    pivotGroup.add(subMesh);

    // --- 扫描激光线 ---
    const scanLineGeo = new THREE.PlaneGeometry(10, 0.05);
    const scanLineMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.2, 
      side: THREE.DoubleSide 
    });
    const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
    scanLine.rotation.x = Math.PI / 2;
    scene.add(scanLine);

    // --- 数据粒子云 ---
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount*3; i++) posArray[i] = (Math.random() - 0.5) * 15;
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x8b5cf6, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(particlesGeo, particlesMat);
    scene.add(points);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 15, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      pivotGroup.rotation.y += 0.005;
      points.rotation.y += 0.001;

      if (isScanning) {
        scanLine.visible = true;
        scanLine.position.y = Math.sin(time * 3) * 3;
        scanLineMat.opacity = 0.5 + Math.sin(time * 10) * 0.2;
        subMat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
      } else {
        scanLine.visible = false;
        subMat.emissiveIntensity = 0.1;
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
  }, [originalType, substituteType, isScanning]);

  return <div ref={mountRef} className="w-full h-full" />;
};
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LifeThreeProps } from './three-types';

export const LifeThreeScene: React.FC<LifeThreeProps> = ({ 
  wearPoints, 
  healthScore, 
  isScanning,
  partType 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);

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

    // --- 工业几何体构建 ---
    const partGroup = new THREE.Group();
    scene.add(partGroup);

    // 核心本体 (使用半透明材质模拟数字化感)
    let geometry;
    if (partType === 'turbine') {
      geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
    } else if (partType === 'valve') {
      geometry = new THREE.IcosahedronGeometry(2.5, 2);
    } else {
      geometry = new THREE.TorusGeometry(2, 0.8, 16, 100);
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1,
      transparent: true,
      opacity: 0.4,
      wireframe: false
    });
    const mainMesh = new THREE.Mesh(geometry, material);
    partGroup.add(mainMesh);

    // 线框外层
    const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    wireMesh.scale.setScalar(1.02);
    partGroup.add(wireMesh);

    // --- 磨损热力点 ---
    const wearMarkers = new THREE.Group();
    scene.add(wearMarkers);
    
    wearPoints.forEach(p => {
      const pGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const pMat = new THREE.MeshBasicMaterial({ 
        color: p.intensity > 0.7 ? 0xef4444 : 0xf59e0b,
        transparent: true,
        opacity: 0.8
      });
      const marker = new THREE.Mesh(pGeo, pMat);
      marker.position.set(...p.position);
      wearMarkers.add(marker);

      // 增加扩散环
      const rGeo = new THREE.TorusGeometry(0.3, 0.01, 8, 32);
      const rMat = new THREE.MeshBasicMaterial({ color: pMat.color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.lookAt(new THREE.Vector3(0,0,0));
      marker.add(ring);
    });

    // --- 扫描光环 ---
    const scanRingGeo = new THREE.TorusGeometry(4, 0.05, 16, 100);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (isScanning) {
        scanRingMat.opacity = 0.5 + Math.sin(time * 5) * 0.2;
        scanRing.position.y = Math.sin(time * 2) * 3;
        scanRing.scale.setScalar(1 + Math.sin(time * 4) * 0.05);
      } else {
        scanRingMat.opacity = 0;
      }

      partGroup.rotation.y += 0.005;
      wearMarkers.rotation.y += 0.005;
      
      wearMarkers.children.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.2);
      });

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
  }, [wearPoints, isScanning, partType]);

  return <div ref={mountRef} className="w-full h-full" />;
};
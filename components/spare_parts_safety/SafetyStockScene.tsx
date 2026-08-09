import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SafetyStockThreeProps } from './three-types';

export const SafetyStockScene: React.FC<SafetyStockThreeProps> = ({ 
  serviceLevel, 
  variability,
  isCalculating,
  baseColor = '#06b6d4'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isCalculating;

    // --- 工业容器模型 ---
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);

    // 外层透明玻璃罐
    const glassGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.05,
      thickness: 0.2,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    containerGroup.add(glass);

    // 刻度线
    for(let i = -3; i <= 3; i += 0.5) {
      const lineGeo = new THREE.RingGeometry(2.5, 2.6, 32);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = Math.PI/2;
      line.position.y = i;
      containerGroup.add(line);
    }

    // --- 库存水位 (动态) ---
    const waterGeo = new THREE.CylinderGeometry(2.4, 2.4, 1, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.7,
      metalness: 0.5,
      roughness: 0.1,
      emissive: baseColor,
      emissiveIntensity: 0.2
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);

    // --- 安全库存垫 (Safety Buffer Area) ---
    const bufferGeo = new THREE.TorusGeometry(2.4, 0.05, 16, 100);
    const bufferMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.8 });
    const bufferRing = new THREE.Mesh(bufferGeo, bufferMat);
    bufferRing.rotation.x = Math.PI / 2;
    scene.add(bufferRing);

    // 辅助粒子 (代表随机需求波动)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x94a3b8, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 核心算法映射：Service Level 决定安全垫高度
      // SL 越高，安全库存高度越高
      const safetyHeight = -3 + (serviceLevel - 0.8) * 20; 
      bufferRing.position.y = safetyHeight;
      
      // 水位根据波动率上下起伏
      const baseLevel = safetyHeight + 1;
      const flux = Math.sin(time * 2) * variability * 1.5;
      water.position.y = baseLevel + flux;
      water.scale.y = 2 + Math.abs(flux); // 动态伸缩

      // 颜色警报：水位低于安全垫
      if (water.position.y < bufferRing.position.y) {
        waterMat.color.setHex(0xef4444);
        waterMat.emissive.setHex(0xef4444);
        waterMat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.3;
      } else {
        waterMat.color.setHex(0x0ea5e9);
        waterMat.emissive.setHex(0x0ea5e9);
        waterMat.emissiveIntensity = 0.2;
      }

      particles.rotation.y += 0.001;
      particles.position.y = Math.sin(time * 0.5) * 0.2;

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
  }, [serviceLevel, variability, isCalculating]);

  return <div ref={mountRef} className="w-full h-full" />;
};
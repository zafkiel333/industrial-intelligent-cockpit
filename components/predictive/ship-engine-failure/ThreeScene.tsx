
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  futureTimeOffset: number; // 0 to 100 (representing hours or days into future)
  riskIntensity: number; // 0 to 1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  futureTimeOffset = 0,
  riskIntensity = 0.2
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // 渐变背景营造深度感
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 8, 25);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 8, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高级工业照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 10, 50);
    fillLight.position.set(-10, 5, 5);
    scene.add(fillLight);

    // 失效红光，随时间偏移增强
    const failureLight = new THREE.PointLight(0xef4444, 0, 30);
    failureLight.position.set(0, 5, 0);
    scene.add(failureLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: EngineFailureAnimatables = { cylinders: [], pistonGlows: [] };
    const disposables: any[] = [];

    // --- 1. 主机核心机架 (Main Frame) ---
    const blockGeo = new THREE.BoxGeometry(10, 4, 3);
    const blockMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.3 
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = 0;
    group.add(block);
    disposables.push(blockGeo, blockMat);

    // --- 2. 气缸组 (Evolving Cylinders) ---
    const cylGeo = new THREE.CylinderGeometry(0.7, 0.7, 2, 32);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    for (let i = 0; i < 6; i++) {
        const cyl = new THREE.Mesh(cylGeo, cylMat.clone());
        cyl.position.set((i - 2.5) * 1.5, 2.5, 0);
        group.add(cyl);
        animatables.cylinders?.push(cyl as any);
        disposables.push(cyl.material);
    }
    disposables.push(cylGeo, cylMat);

    // --- 3. 时间预测环 (Temporal Indicator Ring) ---
    const ringGeo = new THREE.TorusGeometry(8, 0.05, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.2 
    });
    const indicatorRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(indicatorRing);
    animatables.timeLineRing = indicatorRing as any;
    disposables.push(ringGeo, ringMat);

    // --- 4. 损伤覆盖层 (Aging Wireframe) ---
    const scanGeo = new THREE.BoxGeometry(10.2, 4.2, 3.2);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        wireframe: true, 
        transparent: true, 
        opacity: 0 
    });
    const agingLayer = new THREE.Mesh(scanGeo, scanMat);
    group.add(agingLayer);
    animatables.agingOverlay = agingLayer;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体缓慢自转
      group.rotation.y += 0.002;

      // 随时间偏移更新视觉状态
      const agingFactor = futureTimeOffset / 100;
      if (animatables.agingOverlay) {
          // 随着时间推移，红色网格显现
          (animatables.agingOverlay.material as THREE.MeshBasicMaterial).opacity = agingFactor * 0.5;
          animatables.agingOverlay.scale.setScalar(1 + Math.sin(time * 5) * 0.01 * agingFactor);
      }

      // 更新失效灯光
      failureLight.intensity = agingFactor * 50;
      failureLight.position.x = Math.sin(time) * 5;

      // 气缸“病变”抖动
      animatables.cylinders?.forEach((cyl: any, i) => {
          if (agingFactor > 0.6 && i === 2) { // 模拟3号缸先失效
              cyl.position.y = 2.5 + Math.sin(time * 50) * 0.05 * agingFactor;
              cyl.material.emissive.setHex(0xff0000);
              cyl.material.emissiveIntensity = agingFactor;
          }
      });

      // 时间环扩散
      if (animatables.timeLineRing) {
          animatables.timeLineRing.scale.setScalar(1 + Math.sin(time) * 0.05);
          animatables.timeLineRing.rotation.z += 0.01;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [futureTimeOffset]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

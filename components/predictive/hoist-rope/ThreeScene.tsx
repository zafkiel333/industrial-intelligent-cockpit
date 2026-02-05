
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RopeAnimatables, RopeViewMode } from './three-types';

interface ThreeSceneProps {
  wearIndex?: number; // 0-1
  isScanning?: boolean;
  viewMode?: RopeViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearIndex = 0.2, 
  isScanning = true,
  viewMode = 'standard'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(8, 5, 12);

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

    // --- 工业光影矩阵 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const scanLight = new THREE.PointLight(0xa855f7, 20, 50);
    scanLight.position.set(0, 0, 5);
    scene.add(scanLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: RopeAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 钢丝绳模型 (Rope Helix Structure) ---
    const ropeGroup = new THREE.Group();
    const strandCount = 6;
    const ropeRadius = 0.8;
    const strandRadius = 0.25;
    
    const strandGeo = new THREE.CylinderGeometry(strandRadius, strandRadius, 20, 32);
    const ropeMat = new THREE.MeshStandardMaterial({ 
        color: viewMode === 'magnetic' ? 0x8b5cf6 : 0x475569, 
        metalness: 1.0, 
        roughness: 0.1,
        emissive: viewMode === 'fatigue-map' ? 0xff4400 : 0x000000,
        emissiveIntensity: viewMode === 'fatigue-map' ? wearIndex : 0
    });

    for(let i=0; i<strandCount; i++) {
        const strand = new THREE.Mesh(strandGeo, ropeMat);
        const angle = (i / strandCount) * Math.PI * 2;
        strand.position.set(Math.cos(angle) * (ropeRadius - strandRadius), 0, Math.sin(angle) * (ropeRadius - strandRadius));
        strand.rotation.y = Math.PI / 6; // 模拟捻角
        ropeGroup.add(strand);
    }
    ropeGroup.rotation.z = Math.PI / 2;
    group.add(ropeGroup);
    animatables.ropeHelix = ropeGroup;
    disposables.push(strandGeo, ropeMat);

    // --- 2. 天轮局部 (Sheave Section) ---
    const sheaveGeo = new THREE.TorusGeometry(8, 1, 16, 100);
    const sheaveMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const sheave = new THREE.Mesh(sheaveGeo, sheaveMat);
    sheave.position.y = -8.5;
    sheave.rotation.x = Math.PI / 2;
    group.add(sheave);
    animatables.sheave = sheave;
    disposables.push(sheaveGeo, sheaveMat);

    // --- 3. MFL 传感器环 ---
    const sensorGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    sensorGroup.add(ring);
    group.add(sensorGroup);
    animatables.mflSensorRing = sensorGroup;
    disposables.push(ringGeo, ringMat);

    // 扫描特效波纹
    const waveGeo = new THREE.RingGeometry(1.5, 1.7, 32);
    waveGeo.rotateY(Math.PI / 2);
    const waveMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    sensorGroup.add(wave);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 绳索前进模拟
      if (animatables.ropeHelix) {
          animatables.ropeHelix.rotation.x += 0.05; // 轴向自转
      }
      
      // 扫描环脉动
      if (isScanning && sensorGroup) {
          wave.scale.setScalar(1 + Math.sin(time * 10) * 0.5);
          waveMat.opacity = 0.3 - (Math.abs(Math.sin(time * 5)) * 0.2);
          sensorGroup.position.x = Math.sin(time * 2) * 0.5; // 左右微移
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
  }, [wearIndex, isScanning, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

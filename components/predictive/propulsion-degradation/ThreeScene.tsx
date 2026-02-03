import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DegradationAnimatables } from './three-types';

interface ThreeSceneProps {
  degradationRate?: number; // 0-1 劣化程度
  velocityFactor?: number; // 劣化加速度视觉表现
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  degradationRate = 0.3, 
  velocityFactor = 0.5,
  isScanning = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 8, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    const biolumeLight = new THREE.PointLight(0x06b6d4, 15, 30);
    biolumeLight.position.set(-5, 0, 5);
    scene.add(biolumeLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: DegradationAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 推进轴 (The Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.6, 0.6, 15, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2 + degradationRate * 0.5 // 劣化越高越粗糙
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);
    animatables.shaft = shaft;
    disposables.push(shaftGeo, shaftMat);

    // --- 2. 螺旋桨 (Propeller) ---
    const propGroup = new THREE.Group();
    const hubGeo = new THREE.CylinderGeometry(0.7, 0.8, 2, 32);
    hubGeo.rotateZ(Math.PI / 2);
    const bronzeMat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(0xcd7f32).lerp(new THREE.Color(0x1a2e05), degradationRate), // 随劣化变绿变暗
        metalness: 0.8,
        roughness: 0.3 + degradationRate * 0.4
    });
    const hub = new THREE.Mesh(hubGeo, bronzeMat);
    propGroup.add(hub);

    const bladeGeo = new THREE.SphereGeometry(1, 32, 16);
    bladeGeo.scale(3.5, 1.5, 0.1);
    bladeGeo.translate(2.2, 0, 0);
    
    for(let i=0; i<4; i++) {
        const blade = new THREE.Mesh(bladeGeo, bronzeMat);
        blade.rotation.x = (i * Math.PI) / 2;
        blade.rotation.y = 0.4; // 螺距角
        propGroup.add(blade);
    }
    propGroup.position.x = 7.5;
    group.add(propGroup);
    animatables.propeller = propGroup;
    disposables.push(hubGeo, bladeGeo, bronzeMat);

    // --- 3. 生物污损点云 (Bio-fouling Simulation) ---
    const foulingCount = Math.floor(degradationRate * 1500);
    const fGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(foulingCount * 3);
    for(let i=0; i<foulingCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 5;
        fPos[i*3] = 7.5 + (Math.random()-0.5)*2;
        fPos[i*3+1] = Math.cos(angle) * radius;
        fPos[i*3+2] = Math.sin(angle) * radius;
    }
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    const fMat = new THREE.PointsMaterial({ 
        color: 0x84cc16, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.6 
    });
    const fouling = new THREE.Points(fGeo, fMat);
    propGroup.add(fouling);
    animatables.bioFoulingLayer = fouling;
    disposables.push(fGeo, fMat);

    // --- 4. 扫描环 (Diagnostic Scanner) ---
    const scanGeo = new THREE.TorusGeometry(6, 0.05, 16, 100);
    scanGeo.rotateY(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.scanningFringe = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟
      if (animatables.propeller) {
          animatables.propeller.rotation.x += 0.02;
      }

      // 扫描移动
      if (isScanning && animatables.scanningFringe) {
          animatables.scanningFringe.position.x = Math.sin(time) * 10;
          animatables.scanningFringe.material.opacity = 0.2 + Math.abs(Math.cos(time * 5)) * 0.3;
      }

      // 劣化导致的视觉抖动 (加速期特征)
      if (degradationRate > 0.6) {
          group.position.y = Math.sin(time * 40) * (degradationRate * 0.02);
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
  }, [degradationRate, velocityFactor, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
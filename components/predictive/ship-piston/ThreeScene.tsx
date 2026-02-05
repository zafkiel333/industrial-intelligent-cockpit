
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PistonAnimatables, PistonViewMode } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0-1
  thermalLoad?: number; // 0-1
  viewMode?: PistonViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2, 
  thermalLoad = 0.6,
  viewMode = 'mechanical'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(8, 10, 15);

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

    // --- 极光工业光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 15, 10);
    scene.add(topLight);

    const combustionLight = new THREE.PointLight(0xf97316, 20 * thermalLoad, 20);
    combustionLight.position.set(0, 8, 0);
    scene.add(combustionLight);

    const rimLight = new THREE.PointLight(0x0ea5e9, 10, 30);
    rimLight.position.set(-10, 0, -5);
    scene.add(rimLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: PistonAnimatables = { rings: [] };
    const disposables: any[] = [];

    // --- 1. 活塞头 (Piston Crown) ---
    const crownGeo = new THREE.CylinderGeometry(3.5, 3.5, 2.5, 64);
    const crownMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: 0xff4400,
        emissiveIntensity: viewMode === 'thermal' ? thermalLoad * 0.8 : 0
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 1.25;
    mainGroup.add(crown);
    animatables.crown = crown;
    disposables.push(crownGeo, crownMat);

    // --- 2. 活塞裙 (Piston Skirt) ---
    const skirtGeo = new THREE.CylinderGeometry(3.5, 3.4, 6, 64, 1, true);
    const skirtMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.7, 
        roughness: 0.4,
        transparent: viewMode === 'lubrication',
        opacity: viewMode === 'lubrication' ? 0.3 : 1.0
    });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = -3;
    mainGroup.add(skirt);
    disposables.push(skirtGeo, skirtMat);

    // --- 3. 活塞环组 (Piston Rings) ---
    const ringGeo = new THREE.TorusGeometry(3.55, 0.1, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 1.0,
        emissive: 0xff0000,
        emissiveIntensity: 0
    });
    
    for(let i=0; i<4; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat.clone());
        ring.position.y = 2 - i * 0.6;
        mainGroup.add(ring);
        animatables.rings?.push(ring);
        disposables.push(ring.material);
    }
    disposables.push(ringGeo, ringMat);

    // --- 4. 冷却油路 (Cooling Oil Particles) ---
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 4;
        pPos[i*3+1] = (Math.random() - 0.5) * 5;
        pPos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xf59e0b, 
        size: 0.06, 
        transparent: true, 
        opacity: viewMode === 'lubrication' ? 0.8 : 0 
    });
    const coolingOil = new THREE.Points(pGeo, pMat);
    mainGroup.add(coolingOil);
    animatables.coolingOilPoints = coolingOil;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 活塞往复运动模拟
      const speed = 2.5;
      const yOffset = Math.sin(time * speed) * 3;
      mainGroup.position.y = yOffset;

      // 环组劣化动态反馈
      animatables.rings?.forEach((r, i) => {
          if (wearLevel > 0.6 && i === 0) { // 第一道环压力最大
              (r.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
          }
      });

      // 冷却油震荡流
      if (viewMode === 'lubrication' && animatables.coolingOilPoints) {
          const positions = animatables.coolingOilPoints.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] += Math.sin(time * 15 + i) * 0.1; // 模拟Shaker效应
          }
          animatables.coolingOilPoints.geometry.attributes.position.needsUpdate = true;
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
  }, [wearLevel, thermalLoad, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

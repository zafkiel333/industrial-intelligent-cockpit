
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SlewingAnimatables } from './three-types';

interface ThreeSceneProps {
  healthScore?: number;
  rotationSpeed?: number;
  isOperating?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 90, 
  rotationSpeed = 0.02,
  isOperating = false 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x22d3ee, 20, 50);
    cyanPoint.position.set(-10, 5, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SlewingAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 回转支承大齿圈 (Slewing Ring) ---
    const ringGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(5, 0.4, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: healthScore < 75 ? 0xff0000 : 0x000000,
        emissiveIntensity: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringGroup.add(ringMesh);
    group.add(ringGroup);
    animatables.slewingRing = ringGroup;
    disposables.push(ringGeo, ringMat);

    // --- 2. 驱动小齿轮 (Driving Pinion) ---
    const pinionGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    const pinionMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const pinion = new THREE.Mesh(pinionGeo, pinionMat);
    pinion.position.set(5.5, 0, 0); // 设置在啮合点
    group.add(pinion);
    animatables.pinion = pinion;
    disposables.push(pinionGeo, pinionMat);

    // --- 3. 固定底座 (Pedestal) ---
    const baseGeo = new THREE.CylinderGeometry(6, 6.2, 1.5, 64);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1;
    group.add(base);
    disposables.push(baseGeo, baseMat);

    // --- 4. 损伤热点粒子 (Damage Particles - Acoustic Emission) ---
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 5.2;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = 0.2;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xef4444, 
        size: 0.1, 
        transparent: true, 
        opacity: healthScore < 80 ? 0.8 : 0 
    });
    const stressPoints = new THREE.Points(pGeo, pMat);
    group.add(stressPoints);
    animatables.stressPoints = stressPoints;
    disposables.push(pGeo, pMat);

    // --- 5. 扫描光圈 ---
    const scanRingGeo = new THREE.TorusGeometry(6.5, 0.02, 8, 100);
    scanRingGeo.rotateX(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanMat);
    scene.add(scanRing);
    animatables.scanningRing = scanRing;
    disposables.push(scanRingGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转动力学模拟
      if (isOperating) {
          const speed = rotationSpeed;
          if (animatables.slewingRing) animatables.slewingRing.rotation.y += speed;
          if (animatables.pinion) animatables.pinion.rotation.y -= speed * 6; // 模拟齿比
      }

      // 扫描环动画
      if (scanRing) {
          scanRing.position.y = Math.sin(time * 1.5) * 3;
          scanRing.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
      }

      // 损伤点律动
      if (stressPoints && healthScore < 80) {
          stressPoints.material.opacity = 0.4 + Math.sin(time * 10) * 0.4;
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
  }, [healthScore, rotationSpeed, isOperating]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

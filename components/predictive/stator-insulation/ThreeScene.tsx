import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StatorAnimatables } from './three-types';

interface ThreeSceneProps {
  insulationHealth?: number; // 0-1
  isScanning?: boolean;
  highlightSlot?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  insulationHealth = 0.9, 
  isScanning = true,
  highlightSlot = 14
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x22d3ee, 20, 50);
    cyanPoint.position.set(-8, 5, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: StatorAnimatables = { windingBars: new THREE.Group(), leakageGlows: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 定子铁芯 (Stator Core) ---
    const coreGeo = new THREE.CylinderGeometry(5, 5, 6, 64, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        side: THREE.DoubleSide, 
        metalness: 0.8, 
        roughness: 0.4,
        transparent: true,
        opacity: 0.7
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);
    animatables.statorCore = core;
    disposables.push(coreGeo, coreMat);

    // --- 2. 绕组棒 (Winding Bars) ---
    const slotCount = 36;
    const barGeo = new THREE.BoxGeometry(0.15, 6.2, 0.4);
    const barMatNormal = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.2 });
    const barMatWarn = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xff0000, emissiveIntensity: 0.8 });

    for(let i=0; i<slotCount; i++) {
        const angle = (i / slotCount) * Math.PI * 2;
        const radius = 4.85;
        const isTarget = i === highlightSlot;
        const bar = new THREE.Mesh(barGeo, (isTarget && insulationHealth < 0.8) ? barMatWarn : barMatNormal);
        bar.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        bar.rotation.y = -angle;
        animatables.windingBars?.add(bar);
        
        // 异常漏电云效果
        if (isTarget && insulationHealth < 0.8) {
            const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.copy(bar.position);
            animatables.leakageGlows?.add(glow);
            disposables.push(glowGeo, glowMat);
        }
    }
    group.add(animatables.windingBars!);
    group.add(animatables.leakageGlows!);
    disposables.push(barGeo, barMatNormal, barMatWarn);

    // --- 3. 极化扫描环 (Polarization Ring) ---
    const ringGeo = new THREE.TorusGeometry(5.5, 0.03, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });
    const scanner = new THREE.Mesh(ringGeo, ringMat);
    scene.add(scanner);
    animatables.scanningRing = scanner;
    disposables.push(ringGeo, ringMat);

    // --- 4. 介质响应粒子流 (Flux Particles) ---
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 4.7 + Math.random() * 0.3;
        pPos[i*3] = Math.cos(angle) * radius;
        pPos[i*3+1] = (Math.random() - 0.5) * 6;
        pPos[i*3+2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.04, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.fluxParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 扫描移动
      if (isScanning && animatables.scanningRing) {
          animatables.scanningRing.position.y = Math.sin(time * 1.2) * 4;
          animatables.scanningRing.scale.setScalar(1 + Math.sin(time * 8) * 0.02);
      }

      // 粒子流律动
      if (animatables.fluxParticles) {
          animatables.fluxParticles.rotation.y += 0.002;
          const pos = animatables.fluxParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time + i) * 0.005;
          }
          animatables.fluxParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 漏电点搏动
      if (animatables.leakageGlows) {
          animatables.leakageGlows.children.forEach(g => {
              g.scale.setScalar(1 + Math.sin(time * 15) * 0.4);
          });
      }

      group.rotation.y += 0.001;
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
  }, [insulationHealth, isScanning, highlightSlot]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
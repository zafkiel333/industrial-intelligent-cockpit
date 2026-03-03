import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BearingVibTempAnimatables } from './three-types';

interface ThreeSceneProps {
  rpm?: number;
  tempLevel?: number; // 0-1
  vibrationIntensity?: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rpm = 120, 
  tempLevel = 0.3,
  vibrationIntensity = 0.2
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===propulsion-bearing useEffect===");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

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

    // --- 工业光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    const heatLight = new THREE.PointLight(0xff4400, 10 * tempLevel, 20);
    heatLight.position.set(0, 0, 0);
    scene.add(heatLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BearingVibTempAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 轴承外圈 (Outer Race) ---
    const outerGeo = new THREE.TorusGeometry(4.5, 0.4, 32, 100);
    outerGeo.rotateX(Math.PI / 2);
    const outerMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const outerRace = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerRace);
    animatables.outerRace = outerRace;
    disposables.push(outerGeo, outerMat);

    // --- 2. 轴承内圈与主轴 (Inner Race & Shaft) ---
    const innerGroup = new THREE.Group();
    const innerGeo = new THREE.TorusGeometry(3.2, 0.35, 32, 100);
    innerGeo.rotateX(Math.PI / 2);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1, roughness: 0.1 });
    const innerRace = new THREE.Mesh(innerGeo, innerMat);
    innerGroup.add(innerRace);
    
    const shaftGeo = new THREE.CylinderGeometry(2.8, 2.8, 12, 64);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, innerMat);
    innerGroup.add(shaft);
    group.add(innerGroup);
    animatables.innerRace = innerGroup;
    disposables.push(innerGeo, innerMat, shaftGeo);

    // --- 3. 滚动体 (Rollers) ---
    const rollerGroup = new THREE.Group();
    const rollerGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.9, 16);
    rollerGeo.rotateZ(Math.PI/2);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 1, roughness: 0.05 });
    const rollerCount = 14;
    for(let i=0; i<rollerCount; i++) {
        const roller = new THREE.Mesh(rollerGeo, rollerMat);
        const angle = (i / rollerCount) * Math.PI * 2;
        roller.position.set(Math.cos(angle) * 3.85, 0, Math.sin(angle) * 3.85);
        roller.rotation.y = -angle;
        rollerGroup.add(roller);
    }
    innerGroup.add(rollerGroup);
    animatables.rollers = rollerGroup;
    disposables.push(rollerGeo, rollerMat);

    // --- 4. 热力云 (Heat Aura) ---
    const auraGeo = new THREE.TorusGeometry(4.6, 0.6, 16, 100);
    auraGeo.rotateX(Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0 
    });
    const heatAura = new THREE.Mesh(auraGeo, auraMat);
    group.add(heatAura);
    animatables.heatAura = heatAura;
    disposables.push(auraGeo, auraMat);

    // --- 5. 润滑油雾 (Oil Particles) ---
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 8;
        pPos[i*3+1] = (Math.random() - 0.5) * 2;
        pPos[i*3+2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.05, transparent: true, opacity: 0.3 });
    const oilSpray = new THREE.Points(pGeo, pMat);
    group.add(oilSpray);
    animatables.oilSpray = oilSpray;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const rotateSpeed = (rpm / 60) * 0.05;

      // 旋转动力学
      if (animatables.innerRace) {
          animatables.innerRace.rotation.x += rotateSpeed;
          // 模拟振动引起的微位移
          const vib = vibrationIntensity * 0.05;
          animatables.innerRace.position.set(
              Math.sin(time * 20) * vib,
              Math.cos(time * 25) * vib,
              Math.sin(time * 15) * vib
          );
      }

      // 热量脉动
      if (animatables.heatAura) {
          animatables.heatAura.material.opacity = (0.2 + Math.sin(time * 2) * 0.1) * tempLevel;
          animatables.heatAura.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
      }

      // 油雾流动
      if (animatables.oilSpray) {
          animatables.oilSpray.rotation.x += rotateSpeed * 0.5;
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
  }, [rpm, tempLevel, vibrationIntensity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
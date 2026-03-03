
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PulleyAnimatables } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0 to 1
  rpm?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2,
  rpm = 60
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===pulley useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    // --- 环境光照 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(-5, 10, 5);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: PulleyAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 滚筒筒体 (Pulley Shell) ---
    const shellGeo = new THREE.CylinderGeometry(2, 2, 6, 64);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.1 
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);
    animatables.pulleyShell = shell;
    disposables.push(shellGeo, shellMat);

    // --- 2. 包胶层 (Lagging Layer) ---
    // 使用稍大一点的半径覆盖筒体
    const laggingGeo = new THREE.CylinderGeometry(2.15 - (wearLevel * 0.1), 2.15 - (wearLevel * 0.1), 5.8, 64);
    laggingGeo.rotateZ(Math.PI / 2);
    const laggingMat = new THREE.MeshStandardMaterial({ 
        color: 0x111827, 
        roughness: 0.9,
        bumpScale: 0.05,
        emissive: 0xff4400,
        emissiveIntensity: wearLevel > 0.6 ? (wearLevel - 0.6) * 2 : 0
    });
    const lagging = new THREE.Mesh(laggingGeo, laggingMat);
    group.add(lagging);
    animatables.laggingLayer = lagging;
    disposables.push(laggingGeo, laggingMat);

    // --- 3. 轴承支架 (Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    group.add(shaft);
    disposables.push(shaftGeo);

    // --- 4. 表面磨损颗粒 (Friction Debris) ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        pPos[i*3] = (Math.random() - 0.5) * 6;
        pPos[i*3+1] = Math.cos(angle) * 2.2;
        pPos[i*3+2] = Math.sin(angle) * 2.2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x334155, size: 0.04, transparent: true, opacity: 0.5 });
    const debris = new THREE.Points(pGeo, pMat);
    group.add(debris);
    animatables.grooveParticles = debris;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speedFactor = (rpm / 60) * 0.1;

      // 旋转模拟
      group.rotation.x += speedFactor;

      // 磨损区域热力脉动
      if (wearLevel > 0.5) {
          lagging.material.emissiveIntensity = 0.2 + Math.sin(time * 5) * 0.2;
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
  }, [wearLevel, rpm]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

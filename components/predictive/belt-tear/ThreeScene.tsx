
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BeltTearAnimatables } from './three-types';

interface ThreeSceneProps {
  tearRisk?: number; // 0 to 1
  isXRayMode?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  tearRisk = 0.2,
  isXRayMode = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const purpleGlow = new THREE.PointLight(0x8b5cf6, 15, 30);
    purpleGlow.position.set(-5, 2, 2);
    scene.add(purpleGlow);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BeltTearAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 输送带主体 (半透明材质) ---
    const beltGeo = new THREE.BoxGeometry(15, 0.3, 4);
    const beltMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x111827, 
      metalness: 0.2, 
      roughness: 0.8,
      transparent: true,
      opacity: isXRayMode ? 0.4 : 0.9,
      transmission: isXRayMode ? 0.5 : 0
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    group.add(belt);
    animatables.beltSurface = belt;
    disposables.push(beltGeo, beltMat);

    // --- 2. 内部钢丝绳芯 (Steel Cords) ---
    const cordsGroup = new THREE.Group();
    const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 14.8, 8);
    cordGeo.rotateZ(Math.PI / 2);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 1.0 });
    
    const cordCount = 12;
    for(let i=0; i<cordCount; i++) {
        const cord = new THREE.Mesh(cordGeo, cordMat);
        cord.position.set(0, 0, (i / (cordCount-1) - 0.5) * 3.6);
        
        // 模拟断绳异常 (如果风险高)
        if (tearRisk > 0.6 && i === 6) {
           cord.scale.x = 0.1; // 模拟断裂
           const glow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
           glow.position.set(2, 0, (i / (cordCount-1) - 0.5) * 3.6);
           cordsGroup.add(glow);
        }
        cordsGroup.add(cord);
    }
    group.add(cordsGroup);
    animatables.steelCords = cordsGroup;
    disposables.push(cordGeo, cordMat);

    // --- 3. 扫描激光面 (Scanner Laser) ---
    const laserGeo = new THREE.BoxGeometry(0.1, 1, 4.2);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.y = -0.6;
    group.add(laser);
    animatables.scannerLaser = laser;
    disposables.push(laserGeo, laserMat);

    // --- 4. 诊断支架 (Chassis) ---
    const frameGeo = new THREE.BoxGeometry(1, 4, 5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);
    disposables.push(frameGeo, frameMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 激光来回扫描
      if (animatables.scannerLaser) {
          animatables.scannerLaser.position.x = Math.sin(time * 2) * 6;
      }

      // 钢丝绳芯微弱震动
      if (animatables.steelCords) {
          animatables.steelCords.position.y = Math.sin(time * 20) * 0.005;
      }

      // 异常点呼吸效果
      if (tearRisk > 0.6) {
          purpleGlow.intensity = 15 + Math.sin(time * 10) * 10;
          purpleGlow.color.setHex(0xef4444);
      } else {
          purpleGlow.color.setHex(0x8b5cf6);
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
  }, [tearRisk, isXRayMode]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

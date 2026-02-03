
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ScreenWearAnimatables } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0-1
  cloggingSeverity?: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2,
  cloggingSeverity = 0.3 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 极光工业照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    // 主聚光灯 - 模拟侧上方强光
    const mainLight = new THREE.SpotLight(0xffffff, 100);
    mainLight.position.set(10, 15, 10);
    mainLight.angle = Math.PI / 6;
    mainLight.penumbra = 0.5;
    scene.add(mainLight);

    // 辅助点光源 - 强调磨损色泽
    const wearPointLight = new THREE.PointLight(0xf97316, 20, 20);
    wearPointLight.position.set(-5, 5, 0);
    scene.add(wearPointLight);

    // 底部冷补光
    const blueFill = new THREE.PointLight(0x0ea5e9, 10, 30);
    blueFill.position.set(0, -10, 0);
    scene.add(blueFill);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ScreenWearAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 筛网几何体 (Smart Mesh) ---
    const meshGeo = new THREE.PlaneGeometry(8, 12, 40, 60);
    meshGeo.rotateX(-Math.PI / 2);
    
    // 自定义着色器模拟磨损热力图
    const meshMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    const meshSurface = new THREE.Mesh(meshGeo, meshMat);
    group.add(meshSurface);
    animatables.meshSurface = meshSurface;
    disposables.push(meshGeo, meshMat);

    // --- 2. 堵塞颗粒 (Clogging Particles) ---
    const cloggingGroup = new THREE.Group();
    const clogGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const clogMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xff0000, emissiveIntensity: 0.5 });
    
    const clogCount = Math.floor(cloggingSeverity * 200);
    for(let i=0; i<clogCount; i++) {
        const clog = new THREE.Mesh(clogGeo, clogMat);
        clog.position.set(
            (Math.random() - 0.5) * 7.5,
            0.05,
            (Math.random() - 0.5) * 11.5
        );
        cloggingGroup.add(clog);
    }
    group.add(cloggingGroup);
    animatables.cloggingNodes = cloggingGroup;
    disposables.push(clogGeo, clogMat);

    // --- 3. 动态物料流 (Flowing Particles) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 8;
        pPos[i*3+1] = Math.random() * 5 + 1;
        pPos[i*3+2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xe2e8f0, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.4 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.particleSystem = particles;
    disposables.push(pGeo, pMat);

    // --- 4. 激光扫描线 (Scanner Beam) ---
    const scanGeo = new THREE.BoxGeometry(8, 0.05, 0.5);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    group.add(scanner);
    animatables.scannerBeam = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 筛面振动模拟
      if (animatables.meshSurface) {
          const vib = 0.02;
          animatables.meshSurface.position.y = Math.sin(time * 30) * vib;
          // 根据磨损改变颜色
          (animatables.meshSurface.material as THREE.MeshStandardMaterial).color.setHSL(0.6 - wearLevel * 0.4, 0.5, 0.4);
      }

      // 颗粒下落与透筛模拟
      if (animatables.particleSystem) {
          const positions = animatables.particleSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] -= 0.15; // 重力
              if (positions[i*3+1] < -3) {
                  positions[i*3+1] = 5; // 回到顶部
              }
          }
          animatables.particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      // 扫描仪移动
      if (animatables.scannerBeam) {
          animatables.scannerBeam.position.z = Math.sin(time * 0.5) * 6;
      }

      // 堵塞点闪烁
      if (animatables.cloggingNodes) {
          animatables.cloggingNodes.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [wearLevel, cloggingSeverity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

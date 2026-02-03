
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HoistFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  riskLevel?: number; // 0-1
  isAnalyzing?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  riskLevel = 0.3,
  isAnalyzing = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // 渐变背景模拟时空隧道
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 5, 25);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    rimLight.position.set(-10, 5, -5);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: HoistFailureAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 动力总成模型 ---
    const assembly = new THREE.Group();
    group.add(assembly);
    animatables.mainAssembly = assembly;

    // 减速箱体
    const caseGeo = new THREE.BoxGeometry(4, 3, 3);
    const caseMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: riskLevel > 0.7 ? 0xff0000 : 0x000000,
        emissiveIntensity: riskLevel
    });
    const gearbox = new THREE.Mesh(caseGeo, caseMat);
    gearbox.castShadow = true;
    assembly.add(gearbox);
    disposables.push(caseGeo, caseMat);

    // 主轴
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.x = 2;
    assembly.add(shaft);
    animatables.shaft = shaft;
    disposables.push(shaftGeo, shaftMat);

    // --- 2. 时间预测环 (Time Rings) ---
    const rings = new THREE.Group();
    scene.add(rings);
    animatables.timeRings = rings;
    const ringGeo = new THREE.TorusGeometry(6, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: riskLevel > 0.6 ? 0xf43f5e : 0x0ea5e9, 
        transparent: true, 
        opacity: 0.3 
    });
    for(let i=0; i<3; i++) {
        const r = new THREE.Mesh(ringGeo, ringMat);
        r.rotation.x = Math.PI / 2;
        r.position.y = (i - 1) * 2;
        r.scale.setScalar(1 + i * 0.2);
        rings.add(r);
    }
    disposables.push(ringGeo, ringMat);

    // --- 3. 背景网格 ---
    const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟
      if (animatables.mainAssembly) {
          animatables.mainAssembly.rotation.x = Math.sin(time * 0.2) * 0.05;
      }
      if (animatables.shaft) {
          animatables.shaft.rotation.x += 0.05;
      }

      // 时间环动画
      if (animatables.timeRings) {
          animatables.timeRings.rotation.y += 0.01;
          animatables.timeRings.children.forEach((r, i) => {
              r.scale.setScalar((1 + i * 0.2) + Math.sin(time + i) * 0.05);
          });
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
  }, [riskLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

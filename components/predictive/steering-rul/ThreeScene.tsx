import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SteeringRulAnimatables } from './three-types';

interface ThreeSceneProps {
  componentHealth: Record<string, number>; // 0-100
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  componentHealth,
  isScanning = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.18 - Bug修复：创建ref保存实时值，避免依赖项变化触发useEffect重建场景
  // Bug情况：模型渲染时频繁闪烁，每次componentHealth/isScanning变化都会触发useEffect重新创建整个Three.js场景
  // Bug原因：useEffect依赖项包含componentHealth和isScanning，这两个变量反复变化导致场景被反复销毁重建，表现为模型闪烁
  const componentHealthRef = useRef<Record<string, number>>(componentHealth);
  const isScanningRef = useRef<boolean>(isScanning);

  // 仅更新ref值，不触发场景重建
  useEffect(() => {
    componentHealthRef.current = componentHealth;
    isScanningRef.current = isScanning;
  }, [componentHealth, isScanning]);

  // 场景初始化仅执行一次，剔除易变依赖项
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===steering-rul useEffect===");    

    const scene = new THREE.Scene();
    scene.background = null;
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

    // --- 高级照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SteeringRulAnimatables = { healthGlows: new Map() };
    const disposables: any[] = [];

    // 辅助函数：根据健康度获取颜色
    const getHealthColor = (score: number) => {
        const color = new THREE.Color();
        if (score > 80) color.setHex(0x0ea5e9); // 蓝色
        else if (score > 40) color.setHex(0xf59e0b); // 橙色
        else color.setHex(0xef4444); // 红色
        return color;
    };

    // --- 1. 液压泵组 (Pump Unit) ---
    const pumpGroup = new THREE.Group();
    const pumpGeo = new THREE.CylinderGeometry(1, 1, 2.5, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: getHealthColor(componentHealthRef.current.pump || 100),
        emissiveIntensity: 0.3
    });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pumpGroup.add(pump);
    pumpGroup.position.set(-6, 0, 0);
    group.add(pumpGroup);
    animatables.pumpUnit = pumpGroup;

    // --- 2. 舵柄轴 (Main Tiller) ---
    const tillerGeo = new THREE.BoxGeometry(6, 0.4, 1.2);
    const tillerMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155,
        emissive: getHealthColor(componentHealthRef.current.tiller || 100),
        emissiveIntensity: 0.2
    });
    const tiller = new THREE.Mesh(tillerGeo, tillerMat);
    tiller.position.x = 3;
    const tillerPivot = new THREE.Group();
    tillerPivot.add(tiller);
    group.add(tillerPivot);
    animatables.mainTiller = tiller;

    // --- 3. 执行油缸 (Actuators) ---
    const cylGeo = new THREE.CylinderGeometry(0.7, 0.7, 5, 32);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.6 });
    
    const leftCyl = new THREE.Mesh(cylGeo, cylMat);
    leftCyl.position.set(-3.5, 0, 1.2);
    group.add(leftCyl);

    const rightCyl = new THREE.Mesh(cylGeo, cylMat);
    rightCyl.position.set(-3.5, 0, -1.2);
    group.add(rightCyl);

    // 内部活塞 (模拟密封件健康点)
    const pistonGeo = new THREE.CylinderGeometry(0.4, 0.4, 5, 32);
    pistonGeo.rotateZ(Math.PI / 2);
    const sealColor = getHealthColor(componentHealthRef.current.seal || 100);
    const pistonMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        emissive: sealColor,
        emissiveIntensity: 0.4
    });
    const pL = new THREE.Mesh(pistonGeo, pistonMat);
    pL.position.set(-1.5, 0, 1.2);
    group.add(pL);
    animatables.pistonLeft = pL;

    const pR = new THREE.Mesh(pistonGeo, pistonMat);
    pR.position.set(-1.5, 0, -1.2);
    group.add(pR);
    animatables.pistonRight = pR;

    // --- 4. 扫描面特效 ---
    const scanGeo = new THREE.PlaneGeometry(15, 10);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.1, 
        side: THREE.DoubleSide 
    });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    scene.add(scanner);
    animatables.scanningPlane = scanner;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 2026.03.18 - 从ref读取实时值，更新材质属性（而非重建场景）
      // 更新液压泵组发光颜色
      pumpMat.emissive = getHealthColor(componentHealthRef.current.pump || 100);
      // 更新舵柄轴发光颜色
      tillerMat.emissive = getHealthColor(componentHealthRef.current.tiller || 100);
      // 更新活塞发光颜色
      pistonMat.emissive = getHealthColor(componentHealthRef.current.seal || 100);

      // 整体缓慢自转与浮动
      group.rotation.y = Math.sin(time * 0.2) * 0.1;
      group.position.y = Math.sin(time * 0.5) * 0.2;

      // 运动模拟
      if (tillerPivot) tillerPivot.rotation.y = Math.sin(time) * 0.3;
      const travel = Math.sin(time) * 1.5;
      if (pL) pL.position.x = -1.5 + travel;
      if (pR) pR.position.x = -1.5 - travel;

      // 泵组旋转
      if (pumpGroup) pumpGroup.rotation.y += 0.05;

      // 扫描动画（读取实时isScanning值）
      if (isScanningRef.current && scanner) {
          scanner.position.y = Math.sin(time * 1.5) * 5;
          scanner.visible = true;
      } else if (scanner) {
          scanner.visible = false;
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
      renderer.dispose();
      // 额外清理材质和几何体，避免内存泄漏
      pumpMat.dispose();
      pumpGeo.dispose();
      tillerMat.dispose();
      tillerGeo.dispose();
      cylMat.dispose();
      cylGeo.dispose();
      pistonMat.dispose();
      pistonGeo.dispose();
      scanMat.dispose();
      scanGeo.dispose();
    };
  }, []); // 剔除componentHealth和isScanning依赖，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WinchAnimatables } from './three-types';

interface ThreeSceneProps {
  healthScore: number;
  isOperating: boolean;
  loadLevel: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 90, 
  isOperating = true,
  loadLevel = 0.5
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // 2026.03.18 bug修复：使用ref保存实时props值，避免依赖项变化触发useEffect重建3D场景
  // bug情况：模型频繁闪烁；原因：useEffect依赖项(healthScore/isOperating/loadLevel)反复变化，导致useEffect频繁执行，销毁并重建3D场景
  const healthScoreRef = useRef<number>(healthScore);
  const isOperatingRef = useRef<boolean>(isOperating);
  const loadLevelRef = useRef<number>(loadLevel);

  // 同步props到ref，仅更新值不重建场景
  useEffect(() => {
    healthScoreRef.current = healthScore;
    isOperatingRef.current = isOperating;
    loadLevelRef.current = loadLevel;
  }, [healthScore, isOperating, loadLevel]);

  // 核心3D场景初始化逻辑：依赖数组置空，仅执行一次
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===winch-health useEffect===");

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

    // --- 灯光系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    cyanLight.position.set(-10, 5, 5);
    scene.add(cyanLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: WinchAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 主卷筒 (Drum) ---
    const drumGroup = new THREE.Group();
    const drumGeo = new THREE.CylinderGeometry(3, 3, 6, 64);
    drumGeo.rotateZ(Math.PI / 2);
    // 初始化卷筒材质（后续在动画中动态更新）
    const drumMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drumGroup.add(drum);
    group.add(drumGroup);
    animatables.mainDrum = drumGroup;

    // --- 2. 钢丝绳层 (Rope Layers) ---
    const ropeGeo = new THREE.CylinderGeometry(3.1, 3.1, 5.8, 64, 1, true);
    ropeGeo.rotateZ(Math.PI / 2);
    const ropeMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    drumGroup.add(rope);

    // --- 3. 电机单元 (Motor) ---
    const motorGeo = new THREE.BoxGeometry(3, 3, 3);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(-5, 0, 0);
    group.add(motor);
    animatables.motorUnit = motor;

    // --- 4. 制动器 (Brake System) ---
    const brakeGroup = new THREE.Group();
    const discGeo = new THREE.TorusGeometry(3.2, 0.1, 16, 100);
    discGeo.rotateY(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    disc.position.x = 3.5;
    brakeGroup.add(disc);
    group.add(brakeGroup);
    animatables.brakeUnit = brakeGroup;

    // --- 5. 扫描环 (Scanner) ---
    const scanGeo = new THREE.TorusGeometry(5, 0.02, 16, 100);
    scanGeo.rotateY(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.scanningGlow = scanner;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      // 获取实时的props值（从ref中读取）
      const currentHealth = healthScoreRef.current;
      const currentIsOperating = isOperatingRef.current;
      const currentLoadLevel = loadLevelRef.current;

      // 2026.03.18 动态更新卷筒发光材质（跟随healthScore变化）
      drumMat.emissive.setHex(currentHealth < 70 ? 0xff4400 : 0x000000);
      drumMat.emissiveIntensity = (100 - currentHealth) / 100;
      drumMat.needsUpdate = true; // 标记材质需要更新

      if (currentIsOperating) {
        const speed = 0.02 * (1 + currentLoadLevel);
        if (animatables.mainDrum) animatables.mainDrum.rotation.x += speed;
        if (animatables.scanningGlow) {
          animatables.scanningGlow.position.x = Math.sin(time * 2) * 6;
          animatables.scanningGlow.scale.setScalar(1 + Math.sin(time * 5) * 0.05);
        }
      }

      // 异常抖动模拟（使用实时healthScore）
      if (currentHealth < 80) {
        group.position.y = Math.sin(time * 60) * (0.01 * (100 - currentHealth) / 100);
      } else {
        group.position.y = 0; // 健康值恢复时重置位置
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
  }, []); // 依赖数组置空，仅初始化一次3D场景

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
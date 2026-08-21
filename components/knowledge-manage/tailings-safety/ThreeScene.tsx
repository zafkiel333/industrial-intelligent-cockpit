import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTailingsScene, animateTailingsScene } from './TailingsSafetyBuilder';
import { TailingsAnimatables, DamSafetyState } from './three-types';

interface ThreeSceneProps {
  state: DamSafetyState;
  waterLevel: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state, waterLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 1. 用Ref保存实时变化的props值（避免触发useEffect重建场景）
  const stateRef = useRef<DamSafetyState>(state);
  const waterLevelRef = useRef<number>(waterLevel);
  // 2. 用Ref保存动画循环相关实例，避免重复创建
  const animationRef = useRef<{
    animationId: number | null;
    time: number;
    animatables: TailingsAnimatables;
  }>({
    animationId: null,
    time: 0,
    animatables: {},
  });

  // 2026.03.05 - Bug修复：动画效果无效
  // Bug原因：useEffect依赖state/waterLevel导致3D场景反复重建，动画循环被重置；props值无实时性保障，动画无法响应变化
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // ========== 3D场景初始化（仅执行1次） ==========
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：运维知识管理三维视窗统一使用浅色工业蓝灰背景
    scene.fog = new THREE.FogExp2(0xe8f1f6, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 50);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 清空旧Canvas（避免多实例）
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 灯光配置
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 30, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x22d3ee, 5, 40);
    spotLight.position.set(-20, 20, 10);
    scene.add(spotLight);

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controls.maxPolarAngle = Math.PI / 2;

    const group = new THREE.Group();
    scene.add(group);

    const animatables: TailingsAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    initTailingsScene(group, animatables, disposables);

    // 初始化动画状态（存入Ref，避免重建丢失）
    animationRef.current = {
      animationId: null,
      time: 0,
      animatables,
    };

    // ========== 动画循环（持续运行，读取实时props） ==========
    const animate = () => {
      // 持续请求动画帧，保证循环不中断
      animationRef.current.animationId = requestAnimationFrame(animate);
      // 累加时间（连续递增，动画不重置）
      animationRef.current.time += 0.02;
      
      controls.update();
      // 读取Ref中最新的state/waterLevel，响应props变化
      animateTailingsScene(
        animatables,
        stateRef.current,
        waterLevelRef.current,
        animationRef.current.time
      );
      renderer.render(scene, camera);
    };
    animate();

    // ========== 窗口自适应 + 清理逻辑 ==========
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // 取消动画循环（避免内存泄漏）
      if (animationRef.current.animationId) {
        cancelAnimationFrame(animationRef.current.animationId);
      }
      // 清理DOM和渲染资源
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
    // 依赖项仅保留mountRef（场景仅初始化1次，不再因state/waterLevel重建）
  }, [mountRef]);

  // 3. 同步props到Ref（保证动画循环能读取最新值，且不触发场景重建）
  useEffect(() => {
    stateRef.current = state;
    waterLevelRef.current = waterLevel;
  }, [state, waterLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
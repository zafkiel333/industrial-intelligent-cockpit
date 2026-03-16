import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initDustScene, animateDustScene } from './DustSuppressionBuilder';
import { DustAnimatables, SprayStrategy } from './three-types';

interface ThreeSceneProps {
  strategy: SprayStrategy;
  windSpeed: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ strategy, windSpeed }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.05 修复bug：3D模型因useEffect依赖项频繁变化导致反复触发渲染，出现模型闪烁问题
  // bug原因：原代码useEffect依赖数组包含strategy和windSpeed，这两个变量频繁变化会触发useEffect反复执行，
  // 导致场景、渲染逻辑被重复创建和销毁，最终引发模型闪烁
  // 修复方案：通过ref保存实时的strategy和windSpeed值，剔除原useEffect的依赖项，保证场景只初始化一次，同时能读取最新的变量值
  const strategyRef = useRef<SprayStrategy>(strategy);
  const windSpeedRef = useRef<number>(windSpeed);

  // 单独维护ref值更新，保证能获取到最新的props值
  useEffect(() => {
    strategyRef.current = strategy;
    windSpeedRef.current = windSpeed;
  }, [strategy, windSpeed]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827); // Slate 900
    scene.fog = new THREE.FogExp2(0x111827, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    blueLight.position.set(-10, 10, 0);
    scene.add(blueLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    const group = new THREE.Group();
    scene.add(group);

    const animatables: DustAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initDustScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      // 使用ref.current获取最新的strategy和windSpeed值
      animateDustScene(animatables, strategyRef.current, windSpeedRef.current, time);
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, []); // 剔除strategy和windSpeed依赖，保证场景只初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
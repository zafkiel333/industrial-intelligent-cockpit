import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initScraperScene, animateScraperScene } from './ScraperChainBuilder';
import { ScraperAnimatables, ScraperSimState } from './three-types';

interface ThreeSceneProps {
  state: ScraperSimState;
  tension: { left: number, right: number };
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state, tension }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.05 - Bug修复：
  // Bug情况：3D模型渲染时出现频繁闪烁，useEffect被反复触发导致场景重复初始化、渲染器重复创建/销毁
  // 原因：useEffect依赖项state（ScraperSimState类型）和tension（对象类型）为引用类型，父组件渲染时即使内容未变，也会生成新引用，触发useEffect重新执行
  // 修复方案：通过useRef保存state和tension的实时值，剔除useEffect中易变的引用类型依赖项，动画循环中读取ref.current获取最新值
  
  // 用ref保存实时的state和tension值，避免依赖项引用变化触发useEffect
  const stateRef = useRef<ScraperSimState>(state);
  const tensionRef = useRef<{ left: number, right: number }>(tension);

  // 仅更新ref值，不触发场景重建（依赖项为原始props，无渲染副作用）
  useEffect(() => {
    stateRef.current = state;
    tensionRef.current = tension;
  }, [state, tension]);

  // 核心场景初始化逻辑：依赖项为空数组，仅组件挂载时执行一次
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c); 
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20); // Elevated rear view
    camera.lookAt(0, 0, 5);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const orangeSpot = new THREE.SpotLight(0xf97316, 5, 40, 0.5);
    orangeSpot.position.set(0, 10, 15);
    orangeSpot.target.position.set(0, 0, 8);
    scene.add(orangeSpot);
    scene.add(orangeSpot.target);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 5);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ScraperAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initScraperScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      // 读取ref中的最新值，替代直接使用props的state/tension
      animateScraperScene(animatables, stateRef.current, tensionRef.current, time);
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
  }, []); // 剔除易变的state/tension依赖项，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
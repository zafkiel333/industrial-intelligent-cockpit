import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initSedimentScene, animateSedimentScene } from './SedimentationBuilder';
import { SedimentAnimatables, SedimentSimState } from './three-types';

interface ThreeSceneProps {
  state: SedimentSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.05 bug修复：因state作为useEffect依赖项反复变化导致useEffect频繁触发，3D模型初始化重复执行引发闪烁
  // 解决方案：通过ref保存最新state值，使动画循环能读取实时state，同时移除原useEffect的state依赖避免重复初始化
  const stateRef = useRef<SedimentSimState>(state);

  // 仅用于更新state最新值，避免直接将state放入渲染逻辑的useEffect依赖
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1917); // Stone 900
    scene.fog = new THREE.FogExp2(0x1c1917, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const goldLight = new THREE.PointLight(0xd97706, 2, 40); // Silt color
    goldLight.position.set(0, 10, -10);
    scene.add(goldLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SedimentAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initSedimentScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      // 使用ref保存的最新state值，避免依赖项触发重复渲染
      animateSedimentScene(animatables, stateRef.current, time);
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
  }, []); // 2026.03.05 移除state依赖，避免因state频繁变化触发重复初始化导致模型闪烁

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initSeepageScene, animateSeepageScene } from './DamSeepageBuilder';
import { SeepageAnimatables, SeepageSimState } from './three-types';

interface ThreeSceneProps {
  state: SeepageSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 核心修复：新增标记ref，确保自动刷新仅执行一次
  const autoRefreshedRef = useRef(false); // 初始为未执行

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：运维知识管理三维视窗统一使用浅色工业蓝灰背景
    scene.fog = new THREE.FogExp2(0xe8f1f6, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 30, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 50, 20);
    scene.add(dirLight);

    const heatLight = new THREE.PointLight(0xff4400, 0, 30);
    heatLight.position.set(5, -5, 10);
    scene.add(heatLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SeepageAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initSeepageScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();
      
      if (state === 'LEAK_DETECT') {
          heatLight.intensity = 5 + Math.sin(time*10)*2;
      } else {
          heatLight.intensity = 0;
      }

      animateSeepageScene(animatables, state, time);
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

    // 修复：仅在未执行过自动刷新时触发
    const autoRefreshTimer = setTimeout(() => {
      // 判断是否已执行过，避免重复触发
      if (autoRefreshedRef.current) return;
      
      console.log('模型初始化完成，触发唯一一次自动刷新');
      autoRefreshedRef.current = true; // 标记为已执行
      setRefreshTrigger(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(autoRefreshTimer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [state, refreshTrigger]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
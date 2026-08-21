import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTransformerScene, animateTransformerScene } from './TransformerBuilder';
import { TransformerAnimatables, MaintenancePhase } from './three-types';

interface ThreeSceneProps {
  phase: MaintenancePhase;
  isHeatmapMode: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ phase, isHeatmapMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 修复点1：使用requestAnimationFrame延迟获取DOM尺寸，确保布局完成
    const getValidSize = () => {
      return new Promise<{ width: number; height: number }>((resolve) => {
        requestAnimationFrame(() => {
          if (mountRef.current) {
            const width = mountRef.current.clientWidth || 800; // 兜底默认值
            const height = mountRef.current.clientHeight || 600;
            resolve({ width, height });
          } else {
            resolve({ width: 800, height: 600 });
          }
        });
      });
    };

    const initScene = async () => {
      const { width, height } = await getValidSize();
      if (!mountRef.current) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：模拟维修三维视窗统一使用浅色工业蓝灰背景
      scene.fog = new THREE.FogExp2(0xe8f1f6, 0.02);

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(12, 10, 12);
      camera.lookAt(0, 4, 0);
      // 修复点2：强制更新相机投影矩阵，确保lookAt生效
      camera.updateProjectionMatrix();

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      
      // 清空挂载节点，避免多canvas
      const existingCanvas = mountRef.current.querySelector('canvas');
      if (existingCanvas) {
        mountRef.current.removeChild(existingCanvas);
      }
      mountRef.current.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(10, 20, 10);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const spotLight = new THREE.SpotLight(0x8b5cf6, 10);
      spotLight.position.set(-10, 10, -5);
      spotLight.lookAt(0, 0, 0);
      scene.add(spotLight);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 3, 0);
      // 修复点3：初始化后立即更新控件，同步target状态
      controls.update();

      // Group
      const group = new THREE.Group();
      scene.add(group);

      // Init Scene
      const animatables: TransformerAnimatables = {};
      const disposables: { dispose: () => void }[] = [];
      initTransformerScene(group, animatables, disposables);

      // Grid
      const grid = new THREE.GridHelper(30, 30, 0x312e81, 0x1e1b4b);
      scene.add(grid);

      // Animation Loop
      let animationId: number;
      let time = 0;
      
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        time += 0.02;
        
        controls.update();
        animateTransformerScene(animatables, phase, time, isHeatmapMode);
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        if (w === 0 || h === 0) return; // 过滤无效尺寸
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        // 修复点4：resize时强制渲染一次，确保尺寸变更立即生效
        renderer.render(scene, camera);
      };
      window.addEventListener('resize', handleResize);
      // 修复点5：初始化后主动触发一次resize，校准尺寸和相机参数
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        disposables.forEach(d => d.dispose());
        renderer.dispose();
        // 额外优化：清空场景和组，避免残留
        group.clear();
        scene.clear();
      };
    };

    initScene();
  }, [phase, isHeatmapMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initFloodScene, animateFloodScene } from './FloodDischargeBuilder';
import { FloodAnimatables, FloodSimState } from './three-types';

interface ThreeSceneProps {
  state: FloodSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  // 2026-08-21：仿真状态只更新动画，不因状态切换重建整个 WebGL 场景。
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const initialWidth = Math.max(mount.clientWidth, 1);
    const initialHeight = Math.max(mount.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：运维知识管理三维视窗统一使用浅色工业蓝灰背景
    scene.fog = new THREE.FogExp2(0xe8f1f6, 0.02);

    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);
    camera.lookAt(5, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mount.querySelector('canvas');
    if (existingCanvas) {
      mount.removeChild(existingCanvas);
    }
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-10, 20, 10);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(5, 5, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FloodAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initFloodScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateFloodScene(animatables, stateRef.current, time);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width < 2 || height < 2) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    // 2026-08-21：直接监听微应用内的三维容器，适配主平台挂载后的宽高变化。
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initGateHoistScene, animateGateScene } from './GateHoistBuilder';
import { GateAnimatables, GateSimState } from './three-types';

interface ThreeSceneProps {
  state: GateSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  // 2026-08-21：业务状态只驱动场景动画，不应因此销毁并重建 WebGL 画布。
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const initialWidth = Math.max(mount.clientWidth, 1);
    const initialHeight = Math.max(mount.clientHeight, 1);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：模拟维修三维视窗统一使用浅色工业蓝灰背景
    scene.fog = new THREE.FogExp2(0xe8f1f6, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 1000);
    camera.position.set(15, 10, 20); // Side/Top view
    camera.lookAt(0, -2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 5, 20);
    blueLight.position.set(-5, 5, 5);
    scene.add(blueLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -2, 0);

    // Group
    const group = new THREE.Group();
    scene.add(group);

    // Init Builder
    const animatables: GateAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initGateHoistScene(group, animatables, disposables);

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    grid.position.y = -6.4;
    scene.add(grid);

    // Animation Loop
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateGateScene(animatables, stateRef.current, time);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      // 主平台嵌入容器初始化时可能短暂为 0，等待下一次 ResizeObserver 通知。
      if (width < 2 || height < 2) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    // 2026-08-21：主平台侧边栏、内标签页与微应用容器的尺寸变化不会触发 window.resize，
    // 因此必须观察 Three.js 自己的挂载容器，避免画布停留在首次的窄宽度。
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

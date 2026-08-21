
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initMarineShaftScene, animateMarineShaftScene } from './MarineShaftBuilder';
import { ShaftAnimatables, ShaftMaintenancePhase } from './three-types';

interface ThreeSceneProps {
  phase: ShaftMaintenancePhase;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ phase }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f1f6); // 2026-08-21：模拟维修三维视窗统一使用浅色工业蓝灰背景
    scene.fog = new THREE.FogExp2(0xe8f1f6, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const tealLight = new THREE.PointLight(0x14b8a6, 5, 20); // Teal accent
    tealLight.position.set(0, 5, 0);
    scene.add(tealLight);

    const redLight = new THREE.PointLight(0xef4444, 0, 20); // Alarm light
    redLight.position.set(0, 2, 4);
    scene.add(redLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ShaftAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initMarineShaftScene(group, animatables, disposables);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x1e3a8a, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateMarineShaftScene(animatables, phase, time);
      
      // Alarm light logic
      if (phase === 'FAULT_VIB') {
          redLight.intensity = 2 + Math.sin(time * 10) * 2;
      } else {
          redLight.intensity = 0;
      }

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
  }, [phase]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

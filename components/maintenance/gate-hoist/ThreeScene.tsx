
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

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===maintence gate-hoist useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate 900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20); // Side/Top view
    camera.lookAt(0, -2, 0);

    // Renderer
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
      animateGateScene(animatables, state, time);
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
  }, [state]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

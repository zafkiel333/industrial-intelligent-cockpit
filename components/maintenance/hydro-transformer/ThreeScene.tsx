
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

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // Industrial dark blue/purple background
    scene.background = new THREE.Color(0x0f0a1e); 
    scene.fog = new THREE.FogExp2(0x0f0a1e, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 4, 0);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x8b5cf6, 10); // Purple accent
    spotLight.position.set(-10, 10, -5);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);

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
  }, [phase, isHeatmapMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

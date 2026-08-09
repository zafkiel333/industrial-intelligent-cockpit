
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initGroundPressureScene, animateGroundPressureScene } from './GroundPressureBuilder';
import { GroundPressureAnimatables, PressureSimState } from './three-types';

interface ThreeSceneProps {
  state: PressureSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pitch black for underground
    scene.fog = new THREE.FogExp2(0x000000, 0.05); // Heavy fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 15); // Looking down the tunnel
    camera.lookAt(0, 0, -10);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Miner's Lamp effect
    const headLight = new THREE.SpotLight(0xffffff, 2, 40, 0.5, 0.5);
    headLight.position.copy(camera.position);
    headLight.target.position.set(0, 0, -20);
    scene.add(headLight);
    scene.add(headLight.target);

    // Tunnel lights
    for(let z=0; z>-40; z-=10) {
        const pl = new THREE.PointLight(0xffaa00, 0.5, 10);
        pl.position.set(0, 3, z);
        scene.add(pl);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, -10);
    // Limit movement to feel like inside tunnel
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    const group = new THREE.Group();
    scene.add(group);

    const animatables: GroundPressureAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initGroundPressureScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateGroundPressureScene(animatables, state, time);

      // Camera Shake during BURST
      if (state === 'BURST_EVENT') {
          const shake = 0.1;
          camera.position.x += (Math.random() - 0.5) * shake;
          camera.position.y += (Math.random() - 0.5) * shake;
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
  }, [state]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

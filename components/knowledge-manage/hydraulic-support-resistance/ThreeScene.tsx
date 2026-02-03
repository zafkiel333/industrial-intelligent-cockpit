
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initResistanceScene, animateResistanceScene } from './ResistanceBuilder';
import { ResistanceAnimatables, MiningState } from './three-types';

interface ThreeSceneProps {
  state: MiningState;
  pressureData: number[]; // Array of pressure values for the visible supports
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state, pressureData }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a09); // Dark Coal/Stone
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Warning Light (Red)
    const redLight = new THREE.PointLight(0xef4444, 0, 20);
    redLight.position.set(0, 8, 0);
    scene.add(redLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ResistanceAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initResistanceScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      
      // Update Lights based on state
      if (state === 'WEIGHTING') {
          redLight.intensity = 2 + Math.sin(time * 10) * 1.5;
      } else {
          redLight.intensity = 0;
      }

      animateResistanceScene(animatables, state, pressureData, time);
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
  }, [state, pressureData]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

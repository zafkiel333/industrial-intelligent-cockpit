
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initFloodDrillScene, animateFloodDrill } from './FloodEmergencyBuilder';
import { FloodDrillAnimatables, DrillPhase } from './three-types';

interface ThreeSceneProps {
  phase: DrillPhase;
  progress: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ phase, progress }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Stormy dark blue
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(-20, 50, -20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Lightning Flash Light
    const flashLight = new THREE.PointLight(0xa5f3fc, 0, 100);
    flashLight.position.set(0, 40, 0);
    scene.add(flashLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FloodDrillAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initFloodDrillScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateFloodDrill(animatables, phase, progress, time);
      
      // Random Lightning
      if (Math.random() > 0.98 && phase !== 'IDLE') {
          flashLight.intensity = 5;
      } else {
          flashLight.intensity *= 0.8;
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
  }, [phase, progress]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

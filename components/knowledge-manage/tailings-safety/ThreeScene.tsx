
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTailingsScene, animateTailingsScene } from './TailingsSafetyBuilder';
import { TailingsAnimatables, DamSafetyState } from './three-types';

interface ThreeSceneProps {
  state: DamSafetyState;
  waterLevel: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state, waterLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a09); // Stone 950
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Side view to see cross section clearly
    camera.position.set(0, 15, 50);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 30, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x22d3ee, 5, 40);
    spotLight.position.set(-20, 20, 10);
    scene.add(spotLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controls.maxPolarAngle = Math.PI / 2; // Don't go below ground

    const group = new THREE.Group();
    scene.add(group);

    const animatables: TailingsAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initTailingsScene(group, animatables, disposables);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateTailingsScene(animatables, state, waterLevel, time);
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
  }, [state, waterLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

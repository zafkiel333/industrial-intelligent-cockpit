
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initCrusherScene, animateCrusherScene } from './MiningCrusherBuilder';
import { CrusherAnimatables, CrusherSimState } from './three-types';

interface ThreeSceneProps {
  state: CrusherSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1917); // Stone-900 warm dark
    scene.fog = new THREE.FogExp2(0x1c1917, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const orangeLight = new THREE.PointLight(0xf59e0b, 3, 20); // Warning Amber
    orangeLight.position.set(-5, 5, 5);
    scene.add(orangeLight);
    
    // Laser Light for NDT
    const laserSpot = new THREE.SpotLight(0xff0000, 0);
    laserSpot.position.set(5, 5, 0);
    scene.add(laserSpot);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CrusherAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initCrusherScene(group, animatables, disposables);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x44403c, 0x292524);
    scene.add(grid);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateCrusherScene(animatables, state, time);

      // Dynamic Lights based on state
      if (state === 'NDT_SCAN') {
          laserSpot.intensity = 5;
          laserSpot.position.x = Math.sin(time)*5;
          laserSpot.lookAt(0, 3, 0);
      } else {
          laserSpot.intensity = 0;
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

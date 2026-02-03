
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initMineHoistRopeScene, animateRopeScene } from './MineHoistRopeBuilder';
import { RopeAnimatables, RopeSimState } from './three-types';

interface ThreeSceneProps {
  state: RopeSimState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a09); // Stone 950 (Dark Earth)
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 8, 20);
    camera.lookAt(0, 4, 0);

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

    const spotLight = new THREE.SpotLight(0xf59e0b, 5); // Industrial Yellow
    spotLight.position.set(5, 15, 0);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4, 0);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: RopeAnimatables = {};
    const disposables: { dispose: () => void }[] = [];
    
    initMineHoistRopeScene(group, animatables, disposables);

    // Shaft Walls (Grid)
    const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1c1917);
    grid.position.y = -8;
    scene.add(grid);

    // Vertical shaft lines
    const shaftGeo = new THREE.BufferGeometry();
    const vertices = [];
    vertices.push(-6, 12, -2, -6, -15, -2);
    vertices.push(-2, 12, -2, -2, -15, -2);
    vertices.push(-6, 12, 2, -6, -15, 2);
    vertices.push(-2, 12, 2, -2, -15, 2);
    shaftGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const shaftLines = new THREE.LineSegments(shaftGeo, new THREE.LineBasicMaterial({color: 0x334155, opacity: 0.3, transparent: true}));
    scene.add(shaftLines);

    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      animateRopeScene(animatables, state, time);
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

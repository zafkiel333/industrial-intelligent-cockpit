import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StackerState } from './three-types';

interface ThreeSceneProps {
  state?: StackerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<StackerState>(state || {
    rotationSpeed: 30,
    vibrationIntensity: 0.25,
    motorLoad: 70,
    bearingTemp: 45,
    stackingRate: 1200
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log("======portstacker vibration======");

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);

    // 1. 清理容器中已存在的canvas元素（核心修改）
    const existingCanvases = containerRef.current.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      containerRef.current!.removeChild(canvas);
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 2. 此时容器已无旧canvas，添加新canvas
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Stacker Model
    const stackerGroup = new THREE.Group();
    scene.add(stackerGroup);

    // Base
    const baseGeom = new THREE.BoxGeometry(10, 2, 10);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    stackerGroup.add(base);

    // Boom
    const boomGroup = new THREE.Group();
    boomGroup.position.y = 2;
    stackerGroup.add(boomGroup);

    const boomGeom = new THREE.BoxGeometry(20, 1, 2);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.x = 10;
    boomGroup.add(boom);

    // Conveyor on boom
    const beltGeom = new THREE.BoxGeometry(19, 0.2, 1.8);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.set(10, 0.6, 0);
    boomGroup.add(belt);

    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { rotationSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Rotation
      boomGroup.rotation.y = time * (rotationSpeed * 0.01);
      
      // Vibration
      const vib = Math.sin(time * 150) * (vibrationIntensity * 0.03);
      boomGroup.position.y = 2 + vib;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      scene.clear();
      // 额外：组件卸载时清理canvas（可选增强）
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll('canvas');
        canvases.forEach(canvas => containerRef.current!.removeChild(canvas));
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
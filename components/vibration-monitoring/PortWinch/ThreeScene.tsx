import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WindlassState } from './three-types';

interface ThreeSceneProps {
  state: WindlassState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 50;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.5 });
    const cube = new THREE.Mesh(geometry, material); scene.add(cube);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x06b6d4, 1); pointLight.position.set(10, 10, 10); scene.add(pointLight);
    const animate = () => { requestAnimationFrame(animate); cube.rotation.x += 0.01; cube.rotation.y += 0.01; cube.position.y = Math.sin(Date.now() * 0.01) * 0.5; controls.update(); renderer.render(scene, camera); };
    animate();
    const handleResize = () => { if (!containerRef.current) return; camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); renderer.dispose(); };
  }, []);
  return <div ref={containerRef} className="w-full h-full" />;
};

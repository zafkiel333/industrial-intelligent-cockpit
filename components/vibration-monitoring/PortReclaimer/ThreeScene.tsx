import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ReclaimerState } from './three-types';

interface ThreeSceneProps {
  state?: ReclaimerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ReclaimerState>(state || {
    wheelSpeed: 5,
    vibrationIntensity: 0.15,
    motorTemp: 45,
    reclaimRate: 1500,
    boomAngle: 10
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Reclaimer Model (Enhanced Sci-Fi Style)
    const reclaimerGroup = new THREE.Group();
    scene.add(reclaimerGroup);

    // Base - Rotating Platform
    const baseGeom = new THREE.CylinderGeometry(4, 4.5, 1.5, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    reclaimerGroup.add(base);

    // Main Tower
    const towerGeom = new THREE.BoxGeometry(3, 10, 3);
    const tower = new THREE.Mesh(towerGeom, baseMat);
    tower.position.y = 5.5;
    reclaimerGroup.add(tower);

    // Boom Structure
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 9, 0);
    reclaimerGroup.add(boomGroup);

    const boomMainGeom = new THREE.BoxGeometry(18, 1.2, 2);
    const boomMain = new THREE.Mesh(boomMainGeom, baseMat);
    boomMain.position.x = 9;
    boomGroup.add(boomMain);

    // Bucket Wheel
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(18, 0, 0);
    boomGroup.add(wheelGroup);

    const wheelGeom = new THREE.CylinderGeometry(2.5, 2.5, 1, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheelGroup.add(wheel);

    // Buckets
    const bucketGeom = new THREE.BoxGeometry(0.8, 1, 1.2);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
    for (let i = 0; i < 8; i++) {
      const bucket = new THREE.Mesh(bucketGeom, bucketMat);
      const angle = (i / 8) * Math.PI * 2;
      bucket.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0);
      bucket.rotation.z = angle;
      wheelGroup.add(bucket);
    }

    const grid = new THREE.GridHelper(50, 25, 0x00ffff, 0x1e293b);
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { wheelSpeed, vibrationIntensity, boomAngle } = stateRef.current;
      const time = Date.now() * 0.001;

      // Reclaimer Rotation
      reclaimerGroup.rotation.y = Math.sin(time * 0.1) * 0.4;
      
      // Bucket Wheel Rotation
      wheelGroup.rotation.z += wheelSpeed * 0.01;

      // Boom Angle
      boomGroup.rotation.z = THREE.MathUtils.degToRad(boomAngle);

      // Vibration effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.05);
      wheelGroup.position.y = vib;
      wheelGroup.position.z = vib;

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

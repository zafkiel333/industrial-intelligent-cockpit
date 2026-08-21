import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CraneState } from './three-types';

interface ThreeSceneProps {
  state?: CraneState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<CraneState>(state || {
    hoistSpeed: 15,
    vibrationIntensity: 0.15,
    loadWeight: 25,
    boomAngle: 45,
    slewingSpeed: 0.5
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Crane Model
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    // Base
    const baseGeom = new THREE.CylinderGeometry(2, 2.2, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    craneGroup.add(base);

    // Slewing Platform
    const platformGroup = new THREE.Group();
    platformGroup.position.y = 1;
    craneGroup.add(platformGroup);

    const platformGeom = new THREE.BoxGeometry(3, 1.5, 3);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platformGroup.add(platform);

    // Boom
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 0.5, 0);
    platformGroup.add(boomGroup);

    const boomGeom = new THREE.BoxGeometry(0.8, 12, 0.8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x0e7490 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.y = 6;
    boomGroup.add(boom);

    // Hook
    const hookGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const hook = new THREE.Mesh(hookGeom, hookMat);
    hook.position.set(0, 11, 1.5);
    boomGroup.add(hook);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { slewingSpeed, boomAngle, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Slewing
      platformGroup.rotation.y += slewingSpeed * 0.01;

      // Boom Angle
      boomGroup.rotation.x = THREE.MathUtils.degToRad(90 - boomAngle);

      // Vibration effect
      const vib = Math.sin(time * 50) * (vibrationIntensity * 0.05);
      boom.position.x = vib;

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
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

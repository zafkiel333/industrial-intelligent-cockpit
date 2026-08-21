import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UnloaderState } from './three-types';

interface ThreeSceneProps {
  state?: UnloaderState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<UnloaderState>(state || {
    hoistSpeed: 1.5,
    trolleyPosition: 0.5,
    vibrationIntensity: 0.3,
    grabLoad: 25,
    windSpeed: 5
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
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 2.0);
    directionalLight.position.set(20, 40, 20);
    scene.add(directionalLight);

    const neonPinkLight = new THREE.PointLight(0xff00ff, 1.5, 100);
    neonPinkLight.position.set(-20, 20, -20);
    scene.add(neonPinkLight);

    const neonGreenLight = new THREE.PointLight(0x39ff14, 1.2, 100);
    neonGreenLight.position.set(20, 10, -20);
    scene.add(neonGreenLight);

    // Unloader Model (Simplified)
    const unloaderGroup = new THREE.Group();
    scene.add(unloaderGroup);

    // Main Gantry
    const gantryGeom = new THREE.BoxGeometry(2, 15, 2);
    const gantryMat = new THREE.MeshStandardMaterial({ 
      color: 0xbc13fe, // Neon Purple
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0xbc13fe,
      emissiveIntensity: 0.3
    });
    const leg1 = new THREE.Mesh(gantryGeom, gantryMat);
    leg1.position.set(-5, 7.5, 0);
    unloaderGroup.add(leg1);

    const leg2 = new THREE.Mesh(gantryGeom, gantryMat);
    leg2.position.set(5, 7.5, 0);
    unloaderGroup.add(leg2);

    // Boom
    const boomGeom = new THREE.BoxGeometry(25, 1.5, 2);
    const boomMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff, // Neon Blue
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00ffff,
      emissiveIntensity: 0.4
    });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.set(5, 15, 0);
    unloaderGroup.add(boom);

    // Trolley
    const trolleyGeom = new THREE.BoxGeometry(2, 1, 2);
    const trolleyMat = new THREE.MeshStandardMaterial({ 
      color: 0x39ff14, // Neon Green
      emissive: 0x39ff14, 
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.1
    });
    const trolley = new THREE.Mesh(trolleyGeom, trolleyMat);
    trolley.position.set(0, 14.2, 0);
    unloaderGroup.add(trolley);

    // Grab
    const grabGroup = new THREE.Group();
    trolley.add(grabGroup);

    const cableGeom = new THREE.CylinderGeometry(0.05, 0.05, 10);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Neon Yellow
    const cable = new THREE.Mesh(cableGeom, cableMat);
    cable.position.y = -5;
    grabGroup.add(cable);

    const grabGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const grabMat = new THREE.MeshStandardMaterial({ 
      color: 0xff10f0, // Neon Pink
      emissive: 0xff10f0,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.2
    });
    const grab = new THREE.Mesh(grabGeom, grabMat);
    grab.position.y = -10;
    grabGroup.add(grab);

    // Grid
    const grid = new THREE.GridHelper(100, 20, 0x00ffff, 0xff00ff);
    grid.position.y = 0;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { hoistSpeed, trolleyPosition, vibrationIntensity, windSpeed } = stateRef.current;
      const time = Date.now() * 0.001;

      // Trolley movement
      trolley.position.x = THREE.MathUtils.lerp(-5, 15, trolleyPosition);

      // Hoist movement (simulated)
      const hoistOffset = Math.sin(time * hoistSpeed) * 2;
      grab.position.y = -10 + hoistOffset;
      cable.scale.y = (10 - hoistOffset) / 10;
      cable.position.y = -(10 - hoistOffset) / 2;

      // Vibration
      const vib = Math.sin(time * 40) * (vibrationIntensity * 0.1);
      boom.position.y = 15 + vib;
      trolley.position.y = 14.2 + vib;

      // Wind sway
      const sway = Math.sin(time * 2) * (windSpeed * 0.02);
      grabGroup.rotation.z = sway;

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

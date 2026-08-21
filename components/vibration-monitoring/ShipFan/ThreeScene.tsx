import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShipFanState } from './three-types';

interface ThreeSceneProps {
  state?: ShipFanState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ShipFanState>(state || {
    fanSpeed: 1200,
    vibrationIntensity: 0.12,
    motorTemp: 42,
    airFlow: 8500,
    pressure: 1200
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Requirement: Clear other canvas before adding new one
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

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

    // Ship Ventilator Model (Sci-Fi / Industrial Style)
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    // Fan Housing (Casing)
    const casingGeom = new THREE.CylinderGeometry(3, 3, 2, 32, 1, true);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const casing = new THREE.Mesh(casingGeom, casingMat);
    casing.rotation.x = Math.PI / 2;
    fanGroup.add(casing);

    // Motor Housing
    const motorGeom = new THREE.CylinderGeometry(1, 1, 3, 16);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.position.z = -1.5;
    motor.rotation.x = Math.PI / 2;
    fanGroup.add(motor);

    // Fan Blades (Impeller)
    const bladeGroup = new THREE.Group();
    fanGroup.add(bladeGroup);

    const bladeGeom = new THREE.BoxGeometry(0.1, 2.5, 0.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.z = (i / 8) * Math.PI * 2;
      blade.position.y = 1.25 * Math.sin(blade.rotation.z);
      blade.position.x = 1.25 * Math.cos(blade.rotation.z);
      bladeGroup.add(blade);
    }

    const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x1e293b);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -3;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { fanSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Fan Rotation
      bladeGroup.rotation.z += fanSpeed * 0.0001;
      
      // Vibration effect
      const vib = Math.sin(time * 150) * (vibrationIntensity * 0.05);
      fanGroup.position.x = vib;
      fanGroup.position.y = vib;

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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OilPumpState } from './three-types';

interface ThreeSceneProps {
  state?: OilPumpState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<OilPumpState>(state || {
    pumpSpeed: 2950,
    vibrationIntensity: 0.12,
    flowRate: 450,
    dischargePressure: 1.2,
    bearingTemp: 45
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
    camera.position.set(8, 6, 8);

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
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Pump Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Motor
    const motorGeom = new THREE.CylinderGeometry(1, 1, 3, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-2, 1, 0);
    pumpGroup.add(motor);

    // Coupling
    const couplingGeom = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
    const couplingMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const coupling = new THREE.Mesh(couplingGeom, couplingMat);
    coupling.rotation.z = Math.PI / 2;
    coupling.position.set(0, 1, 0);
    pumpGroup.add(coupling);

    // Pump Casing
    const pumpGeom = new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.9 });
    const pump = new THREE.Mesh(pumpGeom, pumpMat);
    pump.position.set(2, 1, 0);
    pump.rotation.z = -Math.PI / 2;
    pumpGroup.add(pump);

    // Pipes
    const pipeGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    
    const inletPipe = new THREE.Mesh(pipeGeom, pipeMat);
    inletPipe.position.set(2, 1, 2.5);
    inletPipe.rotation.x = Math.PI / 2;
    pumpGroup.add(inletPipe);

    const outletPipe = new THREE.Mesh(pipeGeom, pipeMat);
    outletPipe.position.set(2, 3, 0);
    pumpGroup.add(outletPipe);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { pumpSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Vibration effect
      const vib = Math.sin(time * 80) * (vibrationIntensity * 0.04);
      pumpGroup.position.y = vib;

      // Subtle rotation of motor shaft (simulated)
      motor.rotation.x += pumpSpeed * 0.0001;

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

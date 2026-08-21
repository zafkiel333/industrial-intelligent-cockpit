import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CompressorState } from './three-types';

export const ThreeScene: React.FC<{ state: CompressorState }> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.01);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x06b6d4, 2);
    mainLight.position.set(20, 30, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    // --- Reciprocating Compressor Model (Procedural) ---
    const compressorGroup = new THREE.Group();
    scene.add(compressorGroup);

    // 1. Base Frame
    const baseGeo = new THREE.BoxGeometry(12, 1.5, 6);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const base = new THREE.Mesh(baseGeo, techMat);
    base.position.y = 0.75;
    compressorGroup.add(base);

    // 2. Crankcase
    const crankcaseGeo = new THREE.BoxGeometry(6, 4, 4);
    const crankcase = new THREE.Mesh(crankcaseGeo, techMat);
    crankcase.position.y = 3.5;
    compressorGroup.add(crankcase);

    // 3. Cylinders (V-Type)
    const cylinderGroup = new THREE.Group();
    cylinderGroup.position.y = 5.5;
    compressorGroup.add(cylinderGroup);

    const cylGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    
    const cyl1 = new THREE.Mesh(cylGeo, cylMat);
    cyl1.rotation.z = Math.PI / 6;
    cyl1.position.set(-1.5, 1, 0);
    cylinderGroup.add(cyl1);

    const cyl2 = new THREE.Mesh(cylGeo, cylMat);
    cyl2.rotation.z = -Math.PI / 6;
    cyl2.position.set(1.5, 1, 0);
    cylinderGroup.add(cyl2);

    // 4. Pistons (Animated)
    const pistonGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x075985 });
    
    const piston1 = new THREE.Mesh(pistonGeo, pistonMat);
    piston1.rotation.z = Math.PI / 6;
    cylinderGroup.add(piston1);

    const piston2 = new THREE.Mesh(pistonGeo, pistonMat);
    piston2.rotation.z = -Math.PI / 6;
    cylinderGroup.add(piston2);

    // 5. Motor (Drive)
    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
    const motor = new THREE.Mesh(motorGeo, techMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-5, 3.5, 0);
    compressorGroup.add(motor);

    // 6. Flywheel
    const flywheelGeo = new THREE.TorusGeometry(2, 0.3, 16, 32);
    const flywheel = new THREE.Mesh(flywheelGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 }));
    flywheel.rotation.y = Math.PI / 2;
    flywheel.position.set(-3, 3.5, 0);
    compressorGroup.add(flywheel);

    // 7. Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity } = stateRef.current;

      // Rotation Speed
      const rotationSpeed = (rpm / 60) * Math.PI * 2;
      flywheel.rotation.x += rotationSpeed * 0.016;

      // Piston Movement
      const pistonOffset = Math.sin(time * (rpm / 10)) * 1.2;
      piston1.position.set(-1.5 + Math.sin(Math.PI/6) * pistonOffset, 1 + Math.cos(Math.PI/6) * pistonOffset, 0);
      piston2.position.set(1.5 - Math.sin(Math.PI/6) * pistonOffset, 1 + Math.cos(Math.PI/6) * pistonOffset, 0);

      // Vibration Effect
      const vib = Math.sin(time * 150) * (vibrationIntensity * 0.05);
      compressorGroup.position.y = vib;
      compressorGroup.position.x = Math.cos(time * 160) * (vibrationIntensity * 0.02);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

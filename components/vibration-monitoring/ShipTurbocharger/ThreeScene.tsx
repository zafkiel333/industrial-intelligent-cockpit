import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TurbochargerState } from './three-types';

export const ThreeScene: React.FC<{ state: TurbochargerState }> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);

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
    mainLight.position.set(20, 20, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const redLight = new THREE.PointLight(0xef4444, 2, 50);
    redLight.position.set(-10, 5, 0);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50);
    blueLight.position.set(10, 5, 0);
    scene.add(blueLight);

    // --- Turbocharger Model (Procedural) ---
    const turboGroup = new THREE.Group();
    scene.add(turboGroup);

    // 1. Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    turboGroup.add(shaft);

    // 2. Turbine Wheel (Hot Side)
    const turbineGroup = new THREE.Group();
    turbineGroup.position.x = -4;
    turboGroup.add(turbineGroup);

    const turbineCoreGeo = new THREE.CylinderGeometry(1.5, 2.5, 2, 16);
    const hotMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 1, roughness: 0.3 });
    const turbineCore = new THREE.Mesh(turbineCoreGeo, hotMat);
    turbineCore.rotation.z = Math.PI / 2;
    turbineGroup.add(turbineCore);

    // Turbine Blades
    const bladeGeo = new THREE.BoxGeometry(0.1, 2, 1.5);
    for (let i = 0; i < 12; i++) {
      const blade = new THREE.Mesh(bladeGeo, hotMat);
      const angle = (i / 12) * Math.PI * 2;
      blade.position.set(0, Math.cos(angle) * 2, Math.sin(angle) * 2);
      blade.rotation.x = angle + 0.5;
      blade.rotation.z = Math.PI / 2;
      turbineGroup.add(blade);
    }

    // 3. Compressor Wheel (Cold Side)
    const compressorGroup = new THREE.Group();
    compressorGroup.position.x = 4;
    turboGroup.add(compressorGroup);

    const compCoreGeo = new THREE.CylinderGeometry(1.5, 2.5, 2, 16);
    const coldMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 1, roughness: 0.1 });
    const compCore = new THREE.Mesh(compCoreGeo, coldMat);
    compCore.rotation.z = Math.PI / 2;
    compressorGroup.add(compCore);

    // Compressor Blades
    for (let i = 0; i < 12; i++) {
      const blade = new THREE.Mesh(bladeGeo, coldMat);
      const angle = (i / 12) * Math.PI * 2;
      blade.position.set(0, Math.cos(angle) * 2, Math.sin(angle) * 2);
      blade.rotation.x = angle - 0.5;
      blade.rotation.z = Math.PI / 2;
      compressorGroup.add(blade);
    }

    // 4. Housing (Transparent/Cutaway)
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.3,
      metalness: 0.5,
      roughness: 0.1
    });

    const turbineHousingGeo = new THREE.TorusGeometry(3.5, 1.2, 16, 32);
    const turbineHousing = new THREE.Mesh(turbineHousingGeo, housingMat);
    turbineHousing.position.x = -4;
    turbineHousing.rotation.y = Math.PI / 2;
    turboGroup.add(turbineHousing);

    const compHousingGeo = new THREE.TorusGeometry(3.5, 1.2, 16, 32);
    const compHousing = new THREE.Mesh(compHousingGeo, housingMat);
    compHousing.position.x = 4;
    compHousing.rotation.y = Math.PI / 2;
    turboGroup.add(compHousing);

    // Bearing Housing (Center)
    const bearingGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
    const bearingBody = new THREE.Mesh(bearingGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    bearingBody.rotation.z = Math.PI / 2;
    turboGroup.add(bearingBody);

    // 5. Grid Helper
    const grid = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity } = stateRef.current;

      // High Speed Rotation
      const rotationSpeed = (rpm / 60) * Math.PI * 2;
      turbineGroup.rotation.x += rotationSpeed * 0.016;
      compressorGroup.rotation.x += rotationSpeed * 0.016;
      shaft.rotation.x += rotationSpeed * 0.016;

      // Vibration Effect (High Frequency)
      const vib = Math.sin(time * 200) * (vibrationIntensity * 0.02);
      turboGroup.position.y = vib;
      turboGroup.position.z = Math.cos(time * 210) * (vibrationIntensity * 0.01);

      // Light Pulsing
      redLight.intensity = 1.5 + Math.sin(time * 10) * 0.5;
      blueLight.intensity = 1.5 + Math.cos(time * 10) * 0.5;

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

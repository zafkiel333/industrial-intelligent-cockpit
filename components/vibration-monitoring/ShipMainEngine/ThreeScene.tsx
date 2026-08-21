import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MainEngineState } from './three-types';

export const ThreeScene: React.FC<{ state: MainEngineState }> = ({ state }) => {
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
    scene.fog = new THREE.FogExp2(0x315268, 0.01);

    const camera = new THREE.PerspectiveCamera(
      50,
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

    const spotLight = new THREE.SpotLight(0x06b6d4, 3);
    spotLight.position.set(20, 30, 20);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.castShadow = true;
    scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 100);
    blueLight.position.set(-15, 10, -15);
    scene.add(blueLight);

    // --- Ship Main Engine Model (Procedural) ---
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // 1. Engine Block (Main Body)
    const blockGeo = new THREE.BoxGeometry(12, 8, 6);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const block = new THREE.Mesh(blockGeo, techMat);
    block.position.y = 4;
    engineGroup.add(block);

    // 2. Cylinder Heads
    const headGeo = new THREE.BoxGeometry(1.8, 1.5, 5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1 });
    for (let i = 0; i < 6; i++) {
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(-4.5 + i * 1.8, 8.75, 0);
      engineGroup.add(head);
      
      // Spark Plugs / Injectors (Emissive)
      const plugGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
      const plugMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2 });
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(-4.5 + i * 1.8, 9.5, 0);
      engineGroup.add(plug);
    }

    // 3. Crankshaft & Pistons (Internal View - Simplified)
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 11, 16);
    const shaft = new THREE.Mesh(shaftGeo, headMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.y = 2;
    engineGroup.add(shaft);

    const pistons: THREE.Group[] = [];
    for (let i = 0; i < 6; i++) {
      const pistonGroup = new THREE.Group();
      pistonGroup.position.set(-4.5 + i * 1.8, 2, 0);
      engineGroup.add(pistonGroup);

      const rodGeo = new THREE.CylinderGeometry(0.15, 0.15, 4);
      const rod = new THREE.Mesh(rodGeo, headMat);
      rod.position.y = 2;
      pistonGroup.add(rod);

      const pistonHeadGeo = new THREE.CylinderGeometry(0.7, 0.7, 1);
      const pistonHead = new THREE.Mesh(pistonHeadGeo, headMat);
      pistonHead.position.y = 4;
      pistonGroup.add(pistonHead);

      pistons.push(pistonGroup);
    }

    // 4. Flywheel
    const flywheelGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const flywheel = new THREE.Mesh(flywheelGeo, headMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(6.5, 2, 0);
    engineGroup.add(flywheel);

    // Flywheel Detail (Teeth)
    const teethGeo = new THREE.BoxGeometry(0.2, 0.2, 1.2);
    for (let i = 0; i < 36; i++) {
      const tooth = new THREE.Mesh(teethGeo, headMat);
      const angle = (i / 36) * Math.PI * 2;
      tooth.position.set(6.5, 2 + Math.cos(angle) * 3, Math.sin(angle) * 3);
      tooth.rotation.x = angle;
      engineGroup.add(tooth);
    }

    // 5. Turbocharger (Detail)
    const turboGroup = new THREE.Group();
    turboGroup.position.set(-2, 6, 3.5);
    engineGroup.add(turboGroup);

    const turboBodyGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 32);
    const turboBody = new THREE.Mesh(turboBodyGeo, techMat);
    turboGroup.add(turboBody);

    const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 4);
    const pipe = new THREE.Mesh(pipeGeo, techMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.z = -2;
    turboGroup.add(pipe);

    // 6. Base Rails
    const railGeo = new THREE.BoxGeometry(16, 1, 1);
    const rail1 = new THREE.Mesh(railGeo, techMat);
    rail1.position.set(0, 0.5, 2.5);
    engineGroup.add(rail1);
    const rail2 = rail1.clone();
    rail2.position.z = -2.5;
    engineGroup.add(rail2);

    // 7. Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity } = stateRef.current;

      // Crankshaft Rotation
      const rotationSpeed = (rpm / 60) * Math.PI * 2;
      shaft.rotation.x += rotationSpeed * 0.016;
      flywheel.rotation.x += rotationSpeed * 0.016;

      // Piston Movement
      pistons.forEach((p, i) => {
        const offset = (i / 6) * Math.PI * 2;
        const phase = time * rotationSpeed * 0.1 + offset;
        p.position.y = 2 + Math.sin(phase) * 1.5;
      });

      // Vibration Effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.02);
      engineGroup.position.y = vib;
      engineGroup.position.x = Math.cos(time * 110) * (vibrationIntensity * 0.01);

      // Turbo Glow
      blueLight.intensity = 1 + Math.sin(time * 5) * 0.5;

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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeneratorState } from './three-types';

export const ThreeScene: React.FC<{ state: GeneratorState }> = ({ state }) => {
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
    camera.position.set(25, 15, 25);

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

    // --- Ship Generator Set Model (Procedural) ---
    const genSetGroup = new THREE.Group();
    scene.add(genSetGroup);

    // 1. Common Base Frame
    const baseGeo = new THREE.BoxGeometry(18, 1.5, 8);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const base = new THREE.Mesh(baseGeo, techMat);
    base.position.y = 0.75;
    genSetGroup.add(base);

    // 2. Diesel Engine (Prime Mover)
    const engineGroup = new THREE.Group();
    engineGroup.position.set(-4, 4, 0);
    genSetGroup.add(engineGroup);

    const engineBlockGeo = new THREE.BoxGeometry(8, 5, 5);
    const engineBlock = new THREE.Mesh(engineBlockGeo, techMat);
    engineGroup.add(engineBlock);

    // Exhaust Manifold
    const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 6);
    const pipe = new THREE.Mesh(pipeGeo, techMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.y = 3;
    engineGroup.add(pipe);

    // 3. Alternator (Generator)
    const alternatorGroup = new THREE.Group();
    alternatorGroup.position.set(5, 4, 0);
    genSetGroup.add(alternatorGroup);

    const altBodyGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32);
    const altMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1 });
    const altBody = new THREE.Mesh(altBodyGeo, altMat);
    altBody.rotation.z = Math.PI / 2;
    alternatorGroup.add(altBody);

    // Cooling Fins on Alternator
    const finGeo = new THREE.BoxGeometry(0.1, 0.5, 6);
    for (let i = 0; i < 12; i++) {
      const fin = new THREE.Mesh(finGeo, techMat);
      const angle = (i / 12) * Math.PI * 2;
      fin.position.set(0, Math.cos(angle) * 2.6, Math.sin(angle) * 2.6);
      fin.rotation.x = angle;
      fin.rotation.z = Math.PI / 2;
      alternatorGroup.add(fin);
    }

    // 4. Coupling
    const couplingGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
    const coupling = new THREE.Mesh(couplingGeo, altMat);
    coupling.rotation.z = Math.PI / 2;
    coupling.position.set(0.5, 4, 0);
    genSetGroup.add(coupling);

    // 5. Control Cabinet
    const cabinetGeo = new THREE.BoxGeometry(2, 6, 4);
    const cabinet = new THREE.Mesh(cabinetGeo, techMat);
    cabinet.position.set(10, 4.5, 0);
    genSetGroup.add(cabinet);

    // Control Panel Screen (Emissive)
    const screenGeo = new THREE.PlaneGeometry(0.1, 2, 3);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(11.05, 5, 0);
    screen.rotation.y = Math.PI / 2;
    genSetGroup.add(screen);

    // 6. Grid Helper
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
      altBody.rotation.x += rotationSpeed * 0.016;
      coupling.rotation.x += rotationSpeed * 0.016;

      // Vibration Effect
      const vib = Math.sin(time * 120) * (vibrationIntensity * 0.04);
      genSetGroup.position.y = vib;
      genSetGroup.position.z = Math.cos(time * 130) * (vibrationIntensity * 0.02);

      // Screen Pulse
      screenMat.emissiveIntensity = 1.5 + Math.sin(time * 5) * 0.5;

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

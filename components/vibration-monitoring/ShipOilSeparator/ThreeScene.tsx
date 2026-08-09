import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OilSeparatorState } from './three-types';

export const ThreeScene: React.FC<{ state: OilSeparatorState }> = ({ state }) => {
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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(12, 10, 12);

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
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    // --- Oil Separator Model (Procedural) ---
    const separatorGroup = new THREE.Group();
    scene.add(separatorGroup);

    // 1. Base / Frame
    const baseGeo = new THREE.CylinderGeometry(3, 3.5, 1, 32);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const base = new THREE.Mesh(baseGeo, techMat);
    base.position.y = 0.5;
    separatorGroup.add(base);

    // 2. Main Housing
    const housingGeo = new THREE.CylinderGeometry(2.5, 3, 5, 32);
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.9, 
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.y = 3.5;
    separatorGroup.add(housing);

    // 3. Spinning Bowl (Internal)
    const bowlGroup = new THREE.Group();
    bowlGroup.position.y = 3.5;
    separatorGroup.add(bowlGroup);

    const bowlGeo = new THREE.CylinderGeometry(2, 1.5, 4, 16);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x075985, emissiveIntensity: 0.5 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowlGroup.add(bowl);

    // Bowl Detail (Vertical lines)
    for (let i = 0; i < 8; i++) {
      const lineGeo = new THREE.BoxGeometry(0.1, 4, 0.1);
      const line = new THREE.Mesh(lineGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }));
      const angle = (i / 8) * Math.PI * 2;
      line.position.set(Math.cos(angle) * 2.05, 0, Math.sin(angle) * 2.05);
      bowlGroup.add(line);
    }

    // 4. Drive Motor (Bottom)
    const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 2, 16);
    const motor = new THREE.Mesh(motorGeo, techMat);
    motor.position.y = 1.5;
    separatorGroup.add(motor);

    // 5. Pipes (Inlet/Outlet)
    const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
    const inletPipe = new THREE.Mesh(pipeGeo, techMat);
    inletPipe.rotation.z = Math.PI / 2;
    inletPipe.position.set(-3, 5, 0);
    separatorGroup.add(inletPipe);

    const outletPipe = inletPipe.clone();
    outletPipe.position.set(3, 2, 0);
    separatorGroup.add(outletPipe);

    // 6. Grid Helper
    const grid = new THREE.GridHelper(20, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity } = stateRef.current;

      // Bowl Rotation
      const rotationSpeed = (rpm / 60) * Math.PI * 2;
      bowlGroup.rotation.y += rotationSpeed * 0.016;

      // Vibration Effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.05);
      separatorGroup.position.x = vib;
      separatorGroup.position.z = Math.cos(time * 110) * (vibrationIntensity * 0.03);

      // Glow Pulse
      bowlMat.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;

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

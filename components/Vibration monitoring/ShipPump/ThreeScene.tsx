import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpState } from './three-types';

export const ThreeScene: React.FC<{ state: PumpState }> = ({ state }) => {
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

    const mainLight = new THREE.DirectionalLight(0x10b981, 2);
    mainLight.position.set(20, 30, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2, 50);
    emeraldLight.position.set(-10, 5, -10);
    scene.add(emeraldLight);

    // --- Pump Set Model (Procedural) ---
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // 1. Base Plate
    const baseGeo = new THREE.BoxGeometry(12, 1, 5);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const base = new THREE.Mesh(baseGeo, techMat);
    base.position.y = 0.5;
    pumpGroup.add(base);

    // 2. Motor
    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
    const motor = new THREE.Mesh(motorGeo, techMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-3, 2.5, 0);
    pumpGroup.add(motor);

    // Motor Fins
    for (let i = 0; i < 8; i++) {
      const finGeo = new THREE.BoxGeometry(0.1, 0.5, 4);
      const fin = new THREE.Mesh(finGeo, techMat);
      const angle = (i / 8) * Math.PI * 2;
      fin.position.set(-3, 2.5 + Math.cos(angle) * 1.5, Math.sin(angle) * 1.5);
      fin.rotation.x = angle;
      pumpGroup.add(fin);
    }

    // 3. Pump Casing (Centrifugal)
    const casingGeo = new THREE.TorusGeometry(1.8, 0.8, 16, 32);
    const casing = new THREE.Mesh(casingGeo, techMat);
    casing.rotation.y = Math.PI / 2;
    casing.position.set(3, 2.5, 0);
    pumpGroup.add(casing);

    const outletGeo = new THREE.CylinderGeometry(0.6, 0.6, 2, 16);
    const outlet = new THREE.Mesh(outletGeo, techMat);
    outlet.position.set(3, 4.5, 0);
    pumpGroup.add(outlet);

    const inletGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const inlet = new THREE.Mesh(inletGeo, techMat);
    inlet.rotation.z = Math.PI / 2;
    inlet.position.set(5, 2.5, 0);
    pumpGroup.add(inlet);

    // 4. Coupling
    const couplingGeo = new THREE.CylinderGeometry(0.6, 0.6, 1, 16);
    const coupling = new THREE.Mesh(couplingGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 1 }));
    coupling.rotation.z = Math.PI / 2;
    coupling.position.set(0, 2.5, 0);
    pumpGroup.add(coupling);

    // 5. Shaft (Animated)
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 }));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 2.5, 0);
    pumpGroup.add(shaft);

    // 6. Fluid Particles (Flow Visualization)
    const particleCount = 50;
    const particles = new THREE.Group();
    scene.add(particles);

    const pGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    
    const pData: { mesh: THREE.Mesh, speed: number, phase: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      particles.add(p);
      pData.push({
        mesh: p,
        speed: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 7. Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x10b981, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity, flowRate } = stateRef.current;

      // Rotation
      const rotSpeed = (rpm / 60) * Math.PI * 2;
      shaft.rotation.x += rotSpeed * 0.016;
      coupling.rotation.x += rotSpeed * 0.016;

      // Particles Flow
      pData.forEach((p, i) => {
        const t = (time * flowRate * 0.5 + p.phase) % 1;
        // Flow from inlet to outlet
        if (t < 0.4) { // Inlet
          p.mesh.position.set(5 - t * 5, 2.5, Math.sin(t * 20 + i) * 0.2);
        } else if (t < 0.7) { // Casing
          const angle = (t - 0.4) * Math.PI * 4;
          p.mesh.position.set(3 + Math.cos(angle) * 1.5, 2.5 + Math.sin(angle) * 1.5, 0);
        } else { // Outlet
          p.mesh.position.set(3, 2.5 + (t - 0.7) * 8, Math.cos(t * 20 + i) * 0.2);
        }
        p.mesh.visible = flowRate > 0;
      });

      // Vibration Effect
      const vib = Math.sin(time * 140) * (vibrationIntensity * 0.06);
      pumpGroup.position.y = vib;
      pumpGroup.position.x = Math.cos(time * 150) * (vibrationIntensity * 0.02);

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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef({
    speed: 1480, // RPM
    vibration: 0.85, // mm/s
    flow: 450, // m3/h
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(60, 40, 60);
    camera.lookAt(0, 0, 0);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x06b6d4, 1);
    directionalLight.position.set(20, 50, 30);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight.position.set(-20, 20, -20);
    scene.add(pointLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    // --- Mine Drainage Pump Group Model ---
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Motor (Cylindrical)
    const motorGeometry = new THREE.CylinderGeometry(6, 6, 15, 32);
    const motorMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const motor = new THREE.Mesh(motorGeometry, motorMaterial);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -15;
    pumpGroup.add(motor);

    // Coupling
    const couplingGeometry = new THREE.CylinderGeometry(3, 3, 4, 16);
    const couplingMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const coupling = new THREE.Mesh(couplingGeometry, couplingMaterial);
    coupling.rotation.z = Math.PI / 2;
    coupling.position.x = -5;
    pumpGroup.add(coupling);

    // Pump Casing (Multi-stage centrifugal pump)
    const pumpCasingGroup = new THREE.Group();
    pumpCasingGroup.position.x = 8;
    pumpGroup.add(pumpCasingGroup);

    const stageCount = 5;
    const stageWidth = 3;
    for (let i = 0; i < stageCount; i++) {
      const stageGeometry = new THREE.CylinderGeometry(7, 7, stageWidth, 32);
      const stageMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.05
      });
      const stage = new THREE.Mesh(stageGeometry, stageMaterial);
      stage.rotation.z = Math.PI / 2;
      stage.position.x = i * stageWidth;
      pumpCasingGroup.add(stage);
    }

    // Suction Pipe
    const suctionPipeGeometry = new THREE.CylinderGeometry(4, 4, 15, 32);
    const suctionPipeMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const suctionPipe = new THREE.Mesh(suctionPipeGeometry, suctionPipeMaterial);
    suctionPipe.position.set(25, -10, 0);
    pumpGroup.add(suctionPipe);

    // Discharge Pipe
    const dischargePipeGeometry = new THREE.CylinderGeometry(3, 3, 20, 32);
    const dischargePipeMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const dischargePipe = new THREE.Mesh(dischargePipeGeometry, dischargePipeMaterial);
    dischargePipe.position.set(10, 15, 0);
    pumpGroup.add(dischargePipe);

    // Water Flow Visualization (Simulated with particles inside discharge pipe)
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 10 + (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 1] = Math.random() * 20 + 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      particleVelocities[i] = Math.random() * 0.5 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ 
      color: 0x0ea5e9, 
      size: 0.2, 
      transparent: true, 
      opacity: 0.8 
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    pumpGroup.add(particles);

    // Animation Loop
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Subtle vibration of the whole group
      const shake = Math.sin(time * 80) * (vibration / 50);
      pumpGroup.position.y = shake;

      // Coupling rotation
      coupling.rotation.x += (speed / 60) * 0.1;

      // Water flow motion
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i];
        if (positions[i * 3 + 1] > 25) {
          positions[i * 3 + 1] = 5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative" />;
};

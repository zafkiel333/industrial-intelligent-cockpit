import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HopperState } from './three-types';

export const ThreeScene: React.FC<{ state: HopperState }> = ({ state }) => {
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
    scene.fog = new THREE.FogExp2(0x020617, 0.01);

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

    const amberLight = new THREE.PointLight(0xf59e0b, 2, 50);
    amberLight.position.set(-10, 5, -10);
    scene.add(amberLight);

    // --- Hopper Model (Procedural) ---
    const hopperGroup = new THREE.Group();
    scene.add(hopperGroup);

    // 1. Hopper Body (Conical)
    const hopperGeo = new THREE.CylinderGeometry(5, 1.5, 8, 32, 1, true);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide,
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const hopper = new THREE.Mesh(hopperGeo, techMat);
    hopper.position.y = 8;
    hopperGroup.add(hopper);

    // Top Rim
    const rimGeo = new THREE.TorusGeometry(5, 0.2, 16, 64);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 12;
    hopperGroup.add(rim);

    // 2. Support Structure
    const legGeo = new THREE.BoxGeometry(0.5, 12, 0.5);
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeo, techMat);
      const angle = (i / 4) * Math.PI * 2;
      leg.position.set(Math.cos(angle) * 4.5, 6, Math.sin(angle) * 4.5);
      hopperGroup.add(leg);
    }

    // 3. Discharge Gate (Bottom)
    const gateGroup = new THREE.Group();
    gateGroup.position.y = 4;
    hopperGroup.add(gateGroup);

    const gateGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const gate = new THREE.Mesh(gateGeo, new THREE.MeshStandardMaterial({ color: 0x0ea5e9 }));
    gateGroup.add(gate);

    // 4. Material (Particles)
    const particleCount = 300;
    const particlesGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 8;
      posArr[i * 3 + 1] = 4 + Math.random() * 8;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({ 
      color: 0xfacc15, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.7 
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    hopperGroup.add(particleSystem);

    // 5. Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { vibrationIntensity, flowRate, materialLevel } = stateRef.current;

      // Particle Movement (Flow)
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Simple gravity-like flow
        positions[i * 3 + 1] -= flowRate * 0.01 + 0.02;
        
        // Conical constraint
        const h = positions[i * 3 + 1] - 4; // height from bottom
        const maxR = 1.5 + (h / 8) * 3.5;
        const currentR = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
        
        if (currentR > maxR) {
          const factor = maxR / currentR;
          positions[i * 3] *= factor;
          positions[i * 3 + 2] *= factor;
        }

        if (positions[i * 3 + 1] < 4) {
          positions[i * 3 + 1] = 4 + (materialLevel / 100) * 8;
          positions[i * 3] = (Math.random() - 0.5) * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Vibration Effect
      const vib = Math.sin(time * 90) * (vibrationIntensity * 0.08);
      hopperGroup.position.y = vib;
      hopperGroup.position.x = Math.cos(time * 100) * (vibrationIntensity * 0.04);

      // Gate Opening
      gateGroup.scale.x = 1 - (stateRef.current.gateOpening / 100) * 0.8;

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

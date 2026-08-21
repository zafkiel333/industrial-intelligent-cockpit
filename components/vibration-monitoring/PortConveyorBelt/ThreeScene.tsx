import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConveyorBeltState } from './three-types';

export const ThreeScene: React.FC<{ state: ConveyorBeltState }> = ({ state }) => {
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
    camera.position.set(30, 20, 30);

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
    mainLight.position.set(50, 50, 50);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 100);
    blueLight.position.set(-20, 10, -20);
    scene.add(blueLight);

    // --- Conveyor Belt Model (Procedural) ---
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // 1. Frame Structure
    const frameGeo = new THREE.BoxGeometry(60, 1, 4);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const frame = new THREE.Mesh(frameGeo, techMat);
    frame.position.y = 5;
    conveyorGroup.add(frame);

    // Legs
    const legGeo = new THREE.BoxGeometry(1, 5, 1);
    for (let i = -25; i <= 25; i += 10) {
      const leg1 = new THREE.Mesh(legGeo, techMat);
      leg1.position.set(i, 2.5, 1.5);
      conveyorGroup.add(leg1);
      const leg2 = leg1.clone();
      leg2.position.z = -1.5;
      conveyorGroup.add(leg2);
    }

    // 2. Rollers (Idlers)
    const rollerGeo = new THREE.CylinderGeometry(0.4, 0.4, 3.8, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1 });
    const rollers: THREE.Mesh[] = [];
    for (let i = -28; i <= 28; i += 2) {
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(i, 5.6, 0);
      conveyorGroup.add(roller);
      rollers.push(roller);
    }

    // 3. Belt (Loop)
    const beltGeo = new THREE.BoxGeometry(60, 0.2, 3.5);
    const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.9,
      metalness: 0.1
    });
    const beltTop = new THREE.Mesh(beltGeo, beltMat);
    beltTop.position.y = 6.1;
    conveyorGroup.add(beltTop);

    const beltBottom = beltTop.clone();
    beltBottom.position.y = 4.4;
    conveyorGroup.add(beltBottom);

    // 4. Drive Motor
    const motorGroup = new THREE.Group();
    motorGroup.position.set(32, 5, 0);
    conveyorGroup.add(motorGroup);

    const motorBodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x075985 });
    const motorBody = new THREE.Mesh(motorBodyGeo, motorMat);
    motorBody.rotation.z = Math.PI / 2;
    motorGroup.add(motorBody);

    // 5. Material (Particles)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 60;
      posArr[i * 3 + 1] = 6.3 + Math.random() * 0.5;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.2, transparent: true, opacity: 0.8 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    conveyorGroup.add(particleSystem);

    // 6. Grid Helper
    const grid = new THREE.GridHelper(100, 50, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { beltSpeed, vibrationIntensity } = stateRef.current;

      // Roller Rotation
      rollers.forEach(r => {
        r.rotation.y += beltSpeed * 0.005;
      });

      // Particle Movement
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += beltSpeed * 0.002;
        if (positions[i * 3] > 30) {
          positions[i * 3] = -30;
          positions[i * 3 + 1] = 6.3 + Math.random() * 0.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Vibration Effect
      const vib = Math.sin(time * 80) * (vibrationIntensity * 0.03);
      conveyorGroup.position.y = vib;
      conveyorGroup.position.x = Math.cos(time * 90) * (vibrationIntensity * 0.01);

      // Motor Glow
      blueLight.intensity = 1 + Math.sin(time * 4) * 0.5;

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

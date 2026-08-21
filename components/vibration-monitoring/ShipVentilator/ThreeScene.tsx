import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VentilatorState } from './three-types';

export const ThreeScene: React.FC<{ state: VentilatorState }> = ({ state }) => {
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
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 8, 15);

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

    // --- Ventilator Model (Procedural) ---
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    // 1. Cylindrical Housing
    const housingGeo = new THREE.CylinderGeometry(4, 4, 6, 32, 1, true);
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide,
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.4
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.x = Math.PI / 2;
    fanGroup.add(housing);

    // Housing Rings
    const ringGeo = new THREE.TorusGeometry(4, 0.1, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    ring1.rotation.y = Math.PI / 2;
    ring1.position.z = 3;
    fanGroup.add(ring1);
    const ring2 = ring1.clone();
    ring2.position.z = -3;
    fanGroup.add(ring2);

    // 2. Impeller (Blades)
    const impellerGroup = new THREE.Group();
    fanGroup.add(impellerGroup);

    const hubGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    impellerGroup.add(hub);

    const bladeGeo = new THREE.BoxGeometry(0.1, 3.2, 1.2);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      const angle = (i / 8) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
      blade.rotation.z = angle;
      blade.rotation.y = 0.4;
      impellerGroup.add(blade);
    }

    // 3. Motor (Behind Impeller)
    const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 16);
    const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    motor.rotation.x = Math.PI / 2;
    motor.position.z = -2;
    fanGroup.add(motor);

    // 4. Airflow Particles
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 6;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({ 
      color: 0x06b6d4, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    fanGroup.add(particleSystem);

    // 5. Grid Helper
    const grid = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    grid.position.y = -6;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { rpm, vibrationIntensity } = stateRef.current;

      // Blade Rotation
      const rotationSpeed = (rpm / 60) * Math.PI * 2;
      impellerGroup.rotation.z += rotationSpeed * 0.016;

      // Particle Movement (Wind)
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += rotationSpeed * 0.005;
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -5;
          positions[i * 3] = (Math.random() - 0.5) * 6;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Vibration Effect
      const vib = Math.sin(time * 60) * (vibrationIntensity * 0.06);
      fanGroup.position.y = vib;
      fanGroup.position.x = Math.cos(time * 70) * (vibrationIntensity * 0.03);

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

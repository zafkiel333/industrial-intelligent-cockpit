import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeSceneProps {
  state?: {
    screwSpeed: number;
    vibrationIntensity: number;
    motorTemp: number;
    materialFlow: number;
    torque: number;
  };
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef(state || {
    screwSpeed: 60,
    vibrationIntensity: 0.12,
    motorTemp: 40,
    materialFlow: 120,
    torque: 15
  });

  useEffect(() => {
    if (state) stateRef.current = state;
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
    camera.position.set(12, 8, 12);

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
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.castShadow = true;
    scene.add(spotLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // --- Screw Conveyor Model ---
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // 1. Housing (Trough)
    const housingGroup = new THREE.Group();
    conveyorGroup.add(housingGroup);

    const troughGeo = new THREE.CylinderGeometry(1.5, 1.5, 15, 32, 1, true, 0, Math.PI);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide, 
      metalness: 0.9, 
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    });
    const trough = new THREE.Mesh(troughGeo, techMat);
    trough.rotation.z = Math.PI / 2;
    trough.rotation.x = Math.PI;
    housingGroup.add(trough);

    // Transparent Glass Section
    const glassGeo = new THREE.CylinderGeometry(1.51, 1.51, 4, 32, 1, true, 0, Math.PI);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.2,
      transmission: 0.5,
      roughness: 0,
      metalness: 0,
      side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.z = Math.PI / 2;
    glass.rotation.x = Math.PI;
    glass.position.x = 0;
    housingGroup.add(glass);

    // Housing Rings / Brackets
    const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1 });
    for (let i = -7; i <= 7; i += 3.5) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = i;
      housingGroup.add(ring);
    }

    // 2. Screw Shaft & Spiral Blade
    const screwGroup = new THREE.Group();
    conveyorGroup.add(screwGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 16, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 1, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    screwGroup.add(shaft);

    // Spiral Blade (Tube along spiral path)
    const spiralPoints = [];
    const turns = 12;
    const radius = 1.2;
    const length = 15;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const angle = t * Math.PI * 2 * turns;
      spiralPoints.push(new THREE.Vector3((t - 0.5) * length, Math.cos(angle) * radius, Math.sin(angle) * radius));
    }
    const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
    const spiralGeo = new THREE.TubeGeometry(spiralCurve, 200, 0.05, 8, false);
    const spiralMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4, 
      emissive: 0x06b6d4, 
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const spiral = new THREE.Mesh(spiralGeo, spiralMat);
    screwGroup.add(spiral);

    // Blade Planes (The actual screw surface)
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * turns;
      const x = (t - 0.5) * length;
      const planeGeo = new THREE.PlaneGeometry(0.15, radius - 0.3);
      const plane = new THREE.Mesh(planeGeo, spiralMat);
      plane.position.set(x, Math.cos(angle) * (radius/2 + 0.15), Math.sin(angle) * (radius/2 + 0.15));
      plane.rotation.x = angle;
      plane.rotation.y = Math.PI / 2;
      plane.rotation.z = 0.4; // Pitch
      screwGroup.add(plane);
    }

    // 3. Motor Unit
    const motorGroup = new THREE.Group();
    motorGroup.position.x = -8.5;
    conveyorGroup.add(motorGroup);

    const motorBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const motorBody = new THREE.Mesh(motorBodyGeo, motorMat);
    motorBody.rotation.z = Math.PI / 2;
    motorGroup.add(motorBody);

    // Cooling Fins
    const finGeo = new THREE.BoxGeometry(0.05, 0.3, 2);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    for (let i = 0; i < 12; i++) {
      const fin = new THREE.Mesh(finGeo, finMat);
      const angle = (i / 12) * Math.PI * 2;
      fin.position.set(0, Math.cos(angle) * 0.9, Math.sin(angle) * 0.9);
      fin.rotation.x = angle;
      motorGroup.add(fin);
    }

    // Gearbox
    const gearboxGeo = new THREE.BoxGeometry(1.2, 1.5, 1.5);
    const gearbox = new THREE.Mesh(gearboxGeo, motorMat);
    gearbox.position.x = 1.5;
    motorGroup.add(gearbox);

    // 4. Particles
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    const velArr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 15;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      velArr[i] = Math.random() * 0.05 + 0.02;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.15, transparent: true, opacity: 0.8 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { screwSpeed, vibrationIntensity } = stateRef.current;

      // Rotation
      screwGroup.rotation.x += screwSpeed * 0.002;

      // Vibration
      const vib = Math.sin(time * 60) * (vibrationIntensity * 0.05);
      conveyorGroup.position.y = vib;
      conveyorGroup.position.z = vib;

      // Particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += screwSpeed * 0.001;
        if (positions[i * 3] > 7.5) positions[i * 3] = -7.5;
        
        // Spiral motion
        const pAngle = time * 3 + i;
        positions[i * 3 + 1] = Math.sin(pAngle) * 0.8;
        positions[i * 3 + 2] = Math.cos(pAngle) * 0.8;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Pulsing Lights
      spiralMat.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.3;

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

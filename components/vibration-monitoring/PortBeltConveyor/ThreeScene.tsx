import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeltConveyorState } from './three-types';

interface ThreeSceneProps {
  state?: BeltConveyorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<BeltConveyorState>(state || {
    beltSpeed: 3.5,
    vibrationIntensity: 0.1,
    motorTemp: 42,
    beltTension: 15,
    loadWeight: 800
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Belt Conveyor Model
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // Frame
    const frameGeom = new THREE.BoxGeometry(12, 0.2, 4.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.y = -0.6;
    conveyorGroup.add(frame);

    // Rollers (Main)
    const rollerGeom = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1 });
    
    const roller1 = new THREE.Mesh(rollerGeom, rollerMat);
    roller1.rotation.z = Math.PI / 2;
    roller1.position.x = -5.5;
    conveyorGroup.add(roller1);

    const roller2 = new THREE.Mesh(rollerGeom, rollerMat);
    roller2.rotation.z = Math.PI / 2;
    roller2.position.x = 5.5;
    conveyorGroup.add(roller2);

    // Motor
    const motorGeom = new THREE.BoxGeometry(1.5, 1.5, 2);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.position.set(-6.5, 0, 2.5);
    conveyorGroup.add(motor);

    // Belt (Loop)
    const beltPath = new THREE.Shape();
    beltPath.moveTo(-5.5, 0.6);
    beltPath.lineTo(5.5, 0.6);
    beltPath.absarc(5.5, 0, 0.6, Math.PI / 2, -Math.PI / 2, true);
    beltPath.lineTo(-5.5, -0.6);
    beltPath.absarc(-5.5, 0, 0.6, -Math.PI / 2, Math.PI / 2, true);

    const extrudeSettings = { depth: 3.8, bevelEnabled: false };
    const beltGeom = new THREE.ExtrudeGeometry(beltPath, extrudeSettings);
    const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      transparent: true, 
      opacity: 0.9,
      wireframe: false
    });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.z = -1.9;
    conveyorGroup.add(belt);

    // Idlers (Support rollers)
    const idlerGeom = new THREE.CylinderGeometry(0.2, 0.2, 3.8, 16);
    const idlerMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const idlers: THREE.Mesh[] = [];
    for (let i = -4.5; i <= 4.5; i += 1.5) {
      const idler = new THREE.Mesh(idlerGeom, idlerMat);
      idler.rotation.z = Math.PI / 2;
      idler.position.set(i, 0.4, 0);
      conveyorGroup.add(idler);
      idlers.push(idler);
    }

    // Material on belt (Particles)
    const particleCount = 40;
    const particles: THREE.Mesh[] = [];
    const partGeom = new THREE.BoxGeometry(0.3, 0.2, 0.3);
    const partMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(partGeom, partMat);
      p.position.set(Math.random() * 11 - 5.5, 0.7, Math.random() * 3 - 1.5);
      conveyorGroup.add(p);
      particles.push(p);
    }

    const grid = new THREE.GridHelper(30, 15, 0x00ffff, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { beltSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Roller & Idler Rotation
      roller1.rotation.y += beltSpeed * 0.05;
      roller2.rotation.y += beltSpeed * 0.05;
      idlers.forEach(idler => idler.rotation.y += beltSpeed * 0.1);

      // Particle Movement
      particles.forEach(p => {
        p.position.x += beltSpeed * 0.01;
        if (p.position.x > 5.5) {
          p.position.x = -5.5;
          p.position.z = Math.random() * 3 - 1.5;
        }
        // Slight bounce
        p.position.y = 0.7 + Math.sin(time * 10 + p.position.x) * 0.02;
      });

      // Vibration effect
      const vib = Math.sin(time * 150) * (vibrationIntensity * 0.05);
      conveyorGroup.position.y = vib;
      conveyorGroup.rotation.x = vib * 0.1;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

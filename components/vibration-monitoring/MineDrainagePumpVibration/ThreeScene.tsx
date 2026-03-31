import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    vibration: 0.5,
    speed: 1,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Pump Group Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Motor
    const motorGeom = new THREE.CylinderGeometry(4, 4, 10, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -6;
    pumpGroup.add(motor);

    // Coupling
    const couplingGeom = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const couplingMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const coupling = new THREE.Mesh(couplingGeom, couplingMat);
    coupling.rotation.z = Math.PI / 2;
    pumpGroup.add(coupling);

    // Pump
    const pumpGeom = new THREE.CylinderGeometry(5, 5, 6, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.3 });
    const pump = new THREE.Mesh(pumpGeom, pumpMat);
    pump.rotation.z = Math.PI / 2;
    pump.position.x = 4;
    pumpGroup.add(pump);

    // Pipes
    const pipeGeom = new THREE.CylinderGeometry(2, 2, 10, 32);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const pipeIn = new THREE.Mesh(pipeGeom, pipeMat);
    pipeIn.position.set(4, 8, 0);
    pumpGroup.add(pipeIn);

    const pipeOut = new THREE.Mesh(pipeGeom, pipeMat);
    pipeOut.rotation.z = Math.PI / 2;
    pipeOut.position.set(12, 0, 0);
    pumpGroup.add(pipeOut);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration } = dataRef.current;

      // Vibration
      const vib = Math.sin(time * 50) * (vibration / 20);
      pumpGroup.position.y = vib;

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    vibration: 0.4,
    rpm: 120,
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
    camera.position.set(40, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Ship Engine Model (V-type or Inline)
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // Engine Block
    const blockGeom = new THREE.BoxGeometry(20, 10, 8);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const block = new THREE.Mesh(blockGeom, blockMat);
    engineGroup.add(block);

    // Cylinders
    const cylGeom = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const pistons: THREE.Mesh[] = [];
    for(let i = 0; i < 6; i++) {
      const cyl = new THREE.Mesh(cylGeom, cylMat);
      cyl.position.set(-7.5 + i * 3, 6, 0);
      engineGroup.add(cyl);
      pistons.push(cyl);
    }

    // Crankshaft (Simplified)
    const shaftGeom = new THREE.CylinderGeometry(1, 1, 22, 32);
    const shaft = new THREE.Mesh(shaftGeom, blockMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.y = -4;
    engineGroup.add(shaft);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration, rpm } = dataRef.current;

      // Vibration
      const vib = Math.sin(time * 40) * (vibration / 15);
      engineGroup.position.y = vib;

      // Piston Movement
      pistons.forEach((p, i) => {
        p.position.y = 6 + Math.sin(time * (rpm / 60) * 5 + i) * 1.5;
      });

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

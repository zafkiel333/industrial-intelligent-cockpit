import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    rpm: 100,
    vibration: 0.5,
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Propeller Model
    const propellerGroup = new THREE.Group();
    scene.add(propellerGroup);

    // Hub
    const hubGeom = new THREE.SphereGeometry(2, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    propellerGroup.add(hub);

    // Blades
    const bladeGeom = new THREE.BoxGeometry(1, 12, 0.2);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    for(let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 6;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (i * Math.PI * 2) / 4;
      bladePivot.add(blade);
      propellerGroup.add(bladePivot);
    }

    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(1, 1, 20, 32);
    const shaft = new THREE.Mesh(shaftGeom, hubMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -10;
    propellerGroup.add(shaft);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { rpm, vibration } = dataRef.current;

      // Rotation
      propellerGroup.rotation.z += (rpm / 60) * 0.1;

      // Vibration (Hull)
      const vib = Math.sin(time * 60) * (vibration / 20);
      propellerGroup.position.y = vib;

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

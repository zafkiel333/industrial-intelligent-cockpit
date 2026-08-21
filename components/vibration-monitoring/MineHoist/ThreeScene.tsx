import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(150, 100, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Hoist Group
    const hoistGroup = new THREE.Group();
    scene.add(hoistGroup);

    // Drum
    const drumGeom = new THREE.CylinderGeometry(40, 40, 80, 32);
    drumGeom.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.1
    });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    hoistGroup.add(drum);

    const drumWire = new THREE.WireframeGeometry(drumGeom);
    const drumWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const drumWireMesh = new THREE.LineSegments(drumWire, drumWireMat);
    hoistGroup.add(drumWireMesh);

    // Main Shaft
    const shaftGeom = new THREE.CylinderGeometry(8, 8, 120, 32);
    shaftGeom.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    hoistGroup.add(shaft);

    // Cables
    const cableGroup = new THREE.Group();
    scene.add(cableGroup);
    const cableGeom = new THREE.CylinderGeometry(1, 1, 200, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    
    const cable1 = new THREE.Mesh(cableGeom, cableMat);
    cable1.position.set(-20, -100, 40);
    cableGroup.add(cable1);

    const cable2 = new THREE.Mesh(cableGeom, cableMat);
    cable2.position.set(20, -100, 40);
    cableGroup.add(cable2);

    // Cage
    const cageGroup = new THREE.Group();
    scene.add(cageGroup);
    const cageGeom = new THREE.BoxGeometry(30, 50, 30);
    const cageMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.4,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5
    });
    const cage = new THREE.Mesh(cageGeom, cageMat);
    cageGroup.add(cage);

    const cageWire = new THREE.WireframeGeometry(cageGeom);
    const cageWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9 });
    const cageWireMesh = new THREE.LineSegments(cageWire, cageWireMat);
    cageGroup.add(cageWireMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 300);
    pointLight.position.set(50, 100, 50);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Drum Rotation
      const speed = Math.sin(time * 0.5) * 2 + 3;
      drum.rotation.x += speed * 0.02;

      // Cage Movement
      const cagePos = Math.sin(time * 0.5) * 80 - 120;
      cageGroup.position.y = cagePos;
      cageGroup.position.z = 40;

      // Cable scaling
      cable1.scale.y = (Math.abs(cagePos) + 40) / 100;
      cable1.position.y = cagePos / 2 + 20;
      cable2.scale.y = (Math.abs(cagePos) + 40) / 100;
      cable2.position.y = cagePos / 2 + 20;

      // Vibration
      hoistGroup.position.y = Math.sin(time * 50) * 0.2;

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

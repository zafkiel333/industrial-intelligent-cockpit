import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    vibration: 0.3,
    rpm: 15,
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
    camera.position.set(50, 40, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Wind Turbine Model
    const turbineGroup = new THREE.Group();
    scene.add(turbineGroup);

    // Tower
    const towerGeom = new THREE.CylinderGeometry(1.5, 3, 40, 32);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = -20;
    turbineGroup.add(tower);

    // Nacelle
    const nacelleGroup = new THREE.Group();
    const nacelleGeom = new THREE.BoxGeometry(4, 4, 8);
    const nacelle = new THREE.Mesh(nacelleGeom, towerMat);
    nacelleGroup.add(nacelle);
    turbineGroup.add(nacelleGroup);

    // Rotor Hub
    const hubGroup = new THREE.Group();
    const hubGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const hub = new THREE.Mesh(hubGeom, towerMat);
    hubGroup.add(hub);
    hubGroup.position.z = 4.5;
    nacelleGroup.add(hubGroup);

    // Blades
    const bladeGeom = new THREE.BoxGeometry(1, 20, 0.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for(let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 10;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (i * Math.PI * 2) / 3;
      bladePivot.add(blade);
      hubGroup.add(bladePivot);
    }

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
      const vib = Math.sin(time * 10) * (vibration / 5);
      nacelleGroup.position.x = vib;

      // Rotation
      hubGroup.rotation.z += (rpm / 60) * 0.1;

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

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

    // Turbine Group
    const turbineGroup = new THREE.Group();
    scene.add(turbineGroup);

    // Main Shaft
    const shaftGeom = new THREE.CylinderGeometry(5, 5, 150, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    turbineGroup.add(shaft);

    // Runner
    const runnerGroup = new THREE.Group();
    turbineGroup.add(runnerGroup);

    const runnerGeom = new THREE.CylinderGeometry(20, 30, 40, 32);
    const runnerMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.2
    });
    const runner = new THREE.Mesh(runnerGeom, runnerMat);
    runnerGroup.add(runner);

    // Blades
    const bladeGeom = new THREE.BoxGeometry(40, 2, 20);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(Math.cos(i * Math.PI / 4) * 30, 0, Math.sin(i * Math.PI / 4) * 30);
      blade.rotation.y = i * Math.PI / 4;
      blade.rotation.x = Math.PI / 6;
      runnerGroup.add(blade);
    }

    // Outer Casing (Wireframe)
    const casingGeom = new THREE.TorusGeometry(60, 20, 16, 100);
    casingGeom.rotateX(Math.PI / 2);
    const casingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.2,
      wireframe: true 
    });
    const casing = new THREE.Mesh(casingGeom, casingMat);
    scene.add(casing);

    // Flow Lines
    const flowLines: THREE.Line[] = [];
    const flowCount = 20;
    for (let i = 0; i < flowCount; i++) {
      const curve = new THREE.EllipseCurve(0, 0, 60, 60, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(geometry, material);
      line.rotation.x = Math.PI / 2;
      line.position.y = (Math.random() - 0.5) * 40;
      scene.add(line);
      flowLines.push(line);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 300);
    pointLight.position.set(50, 100, 50);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Rotation
      const speed = Math.sin(time * 0.2) * 2 + 3;
      runnerGroup.rotation.y += speed * 0.02;

      // Vibration
      turbineGroup.position.x = Math.sin(time * 60) * 0.2;
      turbineGroup.position.z = Math.cos(time * 60) * 0.2;

      // Flow animation
      flowLines.forEach((line, i) => {
        line.rotation.z += 0.01 * (i % 2 === 0 ? 1 : -1);
        (line.material as any).opacity = 0.2 + Math.sin(time + i) * 0.1;
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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

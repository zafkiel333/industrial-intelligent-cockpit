import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

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

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(30, 40, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Draft Tube - Solid with wireframe overlay
    const tubeGroup = new THREE.Group();
    scene.add(tubeGroup);

    const tubeGeo = new THREE.CylinderGeometry(10, 20, 40, 64, 1, true);
    const tubeMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      emissive: 0x020617
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tubeGroup.add(tube);

    const tubeWire = new THREE.Mesh(
      tubeGeo,
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.1 })
    );
    tubeGroup.add(tubeWire);

    // Vortex Visualization - Helical Particles with dynamic radius
    const particleCount = 2000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const phaseArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      phaseArray[i] = Math.random() * Math.PI * 2;
    }

    const particlesMat = new THREE.PointsMaterial({
      size: 0.3,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x3b82f6, 2, 100);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Update vortex particles
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const y = (i / particleCount) * 40 - 20;
        // Helical path that expands downwards
        const angle = time * 4 + y * 0.4 + phaseArray[i];
        const radius = (y + 20) * 0.25 + 2 + Math.sin(time * 2 + y * 0.1) * 1.5;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Tube pulsation effect
      const pulse = 1 + Math.sin(time * 5) * 0.02;
      tubeGroup.scale.set(pulse, 1, pulse);
      tubeGroup.position.x = Math.sin(time * 10) * 0.2;

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

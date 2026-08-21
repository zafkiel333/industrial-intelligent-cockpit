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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Jaw Crusher Body
    const bodyGeom = new THREE.BoxGeometry(20, 25, 20);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2, wireframe: true });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    scene.add(body);

    // Swing Jaw
    const jawGeom = new THREE.BoxGeometry(18, 22, 2);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const jaw = new THREE.Mesh(jawGeom, jawMat);
    jaw.position.set(0, 0, 8);
    scene.add(jaw);

    // Particles (Crushed Ore)
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * 15;
      positions[i*3+1] = 10;
      positions[i*3+2] = (Math.random() - 0.5) * 10;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.5, color: 0x94a3b8 });
    const particleSystem = new THREE.Points(particles, particleMat);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Jaw motion
      const swing = Math.sin(time * 5) * 2;
      jaw.rotation.x = swing * 0.1;
      jaw.position.z = 8 + swing * 0.5;
      
      // Vibration
      body.position.y = Math.sin(time * 50) * 0.1;
      
      // Particle fall
      const pos = particles.attributes.position.array as Float32Array;
      for(let i = 0; i < particleCount; i++) {
        pos[i*3+1] -= 0.2;
        if(pos[i*3+1] < -12) {
          pos[i*3+1] = 10;
        }
      }
      particles.attributes.position.needsUpdate = true;

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

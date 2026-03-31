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
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(150, 150, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Crusher Group
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    // Outer Casing (Mantle)
    const mantleGeom = new THREE.CylinderGeometry(40, 80, 100, 32, 1, true);
    const mantleMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const mantle = new THREE.Mesh(mantleGeom, mantleMat);
    scene.add(mantle);

    // Inner Cone (Head)
    const headGroup = new THREE.Group();
    crusherGroup.add(headGroup);

    const headGeom = new THREE.CylinderGeometry(10, 50, 90, 32);
    const headMat = new THREE.MeshStandardMaterial({ 
      color: 0xf59e0b, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeom, headMat);
    headGroup.add(head);

    // Material Particles
    const particlesCount = 100;
    const particlesGeom = new THREE.SphereGeometry(2, 8, 8);
    const particlesMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const particles: THREE.Mesh[] = [];

    for (let i = 0; i < particlesCount; i++) {
      const p = new THREE.Mesh(particlesGeom, particlesMat);
      p.position.set(
        (Math.random() - 0.5) * 80,
        50 + Math.random() * 50,
        (Math.random() - 0.5) * 80
      );
      scene.add(p);
      particles.push(p);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2, 300);
    pointLight.position.set(50, 100, 50);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Eccentric Rotation
      headGroup.rotation.y += 0.05;
      headGroup.position.x = Math.sin(time * 5) * 5;
      headGroup.position.z = Math.cos(time * 5) * 5;
      headGroup.rotation.z = Math.sin(time * 5) * 0.1;

      // Particles animation
      particles.forEach((p, i) => {
        p.position.y -= 1.5;
        if (p.position.y < -50) {
          p.position.y = 50 + Math.random() * 50;
          p.position.x = (Math.random() - 0.5) * 60;
          p.position.z = (Math.random() - 0.5) * 60;
        }
        // Interaction with head
        const dist = Math.sqrt(p.position.x ** 2 + p.position.z ** 2);
        if (p.position.y < 40 && p.position.y > -40 && dist < 45) {
          p.position.x *= 1.05;
          p.position.z *= 1.05;
        }
      });

      // Vibration
      crusherGroup.position.y = Math.sin(time * 80) * 0.3;

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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 1,
    mode: 'generating', // generating, pumping, transitioning
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(60, 40, 80);

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
    const shaftGeom = new THREE.CylinderGeometry(2, 2, 60, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    turbineGroup.add(shaft);

    // Turbine Blades
    const bladeGroup = new THREE.Group();
    turbineGroup.add(bladeGroup);
    const bladeGeom = new THREE.BoxGeometry(15, 1, 8);
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.2
    });
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(10, 0, 0);
      const pivot = new THREE.Group();
      pivot.rotation.y = (i / 8) * Math.PI * 2;
      pivot.add(blade);
      bladeGroup.add(pivot);
    }

    // Outer Casing (Wireframe)
    const casingGeom = new THREE.CylinderGeometry(25, 25, 40, 32, 1, true);
    const casingWire = new THREE.WireframeGeometry(casingGeom);
    const casingMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2 });
    const casing = new THREE.LineSegments(casingWire, casingMat);
    scene.add(casing);

    // Water Flow Particles
    const particleCount = 200;
    const particles = new THREE.Group();
    scene.add(particles);
    const pGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 50
      );
      particles.add(p);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 100);
    pointLight.position.set(30, 30, 30);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { speed, mode } = dataRef.current;

      // Rotate Turbine
      const rotationSpeed = mode === 'generating' ? speed : -speed;
      bladeGroup.rotation.y += rotationSpeed * 0.05;

      // Animate Particles
      particles.children.forEach((p, i) => {
        const mesh = p as THREE.Mesh;
        if (mode === 'generating') {
          mesh.position.y -= 0.5;
          if (mesh.position.y < -30) mesh.position.y = 30;
        } else {
          mesh.position.y += 0.5;
          if (mesh.position.y > 30) mesh.position.y = -30;
        }
        mesh.position.x = Math.sin(time + i) * 20;
        mesh.position.z = Math.cos(time + i) * 20;
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

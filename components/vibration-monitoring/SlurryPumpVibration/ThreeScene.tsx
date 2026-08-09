import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 1200,
    vibration: 1.5,
    density: 1.4,
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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Slurry Pump Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Casing (Volute)
    const voluteGeom = new THREE.TorusGeometry(10, 4, 16, 100);
    const voluteMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.6
    });
    const volute = new THREE.Mesh(voluteGeom, voluteMat);
    volute.rotation.x = Math.PI / 2;
    pumpGroup.add(volute);

    // Impeller
    const impellerGroup = new THREE.Group();
    const hubGeom = new THREE.CylinderGeometry(2, 2, 4, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    impellerGroup.add(hub);

    const bladeGeom = new THREE.BoxGeometry(8, 0.5, 3);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for(let i = 0; i < 5; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.y = (i / 5) * Math.PI * 2;
      blade.position.set(Math.cos(blade.rotation.y) * 4, 0, Math.sin(blade.rotation.y) * 4);
      impellerGroup.add(blade);
    }
    impellerGroup.rotation.x = Math.PI / 2;
    pumpGroup.add(impellerGroup);

    // Slurry Particles
    const particleCount = 300;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    
    for(let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8 + 2;
      positions[i*3] = Math.cos(angle) * radius;
      positions[i*3+1] = (Math.random() - 0.5) * 4;
      positions[i*3+2] = Math.sin(angle) * radius;
      velocities[i] = Math.random() * 0.1 + 0.05;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ 
      color: 0x92400e, // Slurry color (brownish)
      size: 0.4,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    pumpGroup.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Rotation
      impellerGroup.rotation.y += (speed / 60) * 0.05;

      // Vibration
      const vib = Math.sin(time * 50) * (vibration / 20);
      pumpGroup.position.y = vib;

      // Particle Flow
      const pos = particlesGeom.attributes.position.array as Float32Array;
      for(let i = 0; i < particleCount; i++) {
        const x = pos[i*3];
        const z = pos[i*3+2];
        const angle = Math.atan2(z, x) + 0.1;
        const radius = Math.sqrt(x*x + z*z) + 0.05;
        
        if(radius > 12) {
          const newAngle = Math.random() * Math.PI * 2;
          pos[i*3] = Math.cos(newAngle) * 2;
          pos[i*3+2] = Math.sin(newAngle) * 2;
        } else {
          pos[i*3] = Math.cos(angle) * radius;
          pos[i*3+2] = Math.sin(angle) * radius;
        }
      }
      particlesGeom.attributes.position.needsUpdate = true;

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

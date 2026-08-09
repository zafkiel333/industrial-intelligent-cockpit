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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(40, 40, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Volute Casing - Solid with wireframe overlay
    const voluteGroup = new THREE.Group();
    scene.add(voluteGroup);

    const voluteGeo = new THREE.TorusGeometry(20, 8, 32, 100, Math.PI * 1.5);
    const voluteMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.6,
      emissive: 0x020617
    });
    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.rotation.x = Math.PI / 2;
    voluteGroup.add(volute);

    const voluteWire = new THREE.Mesh(
      voluteGeo,
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.1 })
    );
    voluteWire.rotation.x = Math.PI / 2;
    voluteGroup.add(voluteWire);

    // Impeller (Central)
    const impellerGroup = new THREE.Group();
    scene.add(impellerGroup);

    const hubGeo = new THREE.CylinderGeometry(4, 6, 8, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    impellerGroup.add(hub);

    for (let i = 0; i < 6; i++) {
      const bladeGeo = new THREE.BoxGeometry(12, 6, 0.5);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.1 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      const angle = (i / 6) * Math.PI * 2;
      blade.rotation.y = angle;
      blade.rotation.z = 0.3;
      blade.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6);
      impellerGroup.add(blade);
    }

    // Flow Particles - More dynamic and following the spiral
    const particleCount = 3000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const speedArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 1.5;
      const radius = 12 + Math.random() * 12;
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 12;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
      speedArray[i] = 0.02 + Math.random() * 0.03;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x06b6d4, 2, 100);
    mainLight.position.set(0, 30, 0);
    scene.add(mainLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      impellerGroup.rotation.y += 0.05;
      
      // Particle animation - following spiral flow
      const pos = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = pos[i3];
        const z = pos[i3 + 2];
        const angle = Math.atan2(z, x) + speedArray[i];
        const radius = Math.sqrt(x * x + z * z);
        
        pos[i3] = Math.cos(angle) * radius;
        pos[i3 + 2] = Math.sin(angle) * radius;
        pos[i3 + 1] += Math.sin(time + i) * 0.05;
        
        // Reset particles that go beyond the spiral
        if (angle > Math.PI * 1.5) {
          const newAngle = Math.random() * 0.1;
          const newRadius = 12 + Math.random() * 12;
          pos[i3] = Math.cos(newAngle) * newRadius;
          pos[i3 + 2] = Math.sin(newAngle) * newRadius;
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;

      // Volute vibration effect
      voluteGroup.position.y = Math.sin(time * 10) * 0.3;

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

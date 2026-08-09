import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CbmThreeProps } from './three-types';

export const CbmThreeScene: React.FC<CbmThreeProps> = ({ 
  status, 
  stability,
  pulseSpeed 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Deep digital void fog
    scene.fog = new THREE.FogExp2(0x020205, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;

    // --- Scene Objects ---

    const group = new THREE.Group();
    scene.add(group);

    // 1. Core Sphere (The Sensor Node)
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff, 
      flatShading: true,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner Glow
    const glowGeo = new THREE.SphereGeometry(1, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // 2. Data Rings (Orbitals)
    const ringCount = 3;
    const rings: THREE.Mesh[] = [];
    
    for (let i = 0; i < ringCount; i++) {
        const radius = 2.5 + i * 1.2;
        const tube = 0.05;
        const geo = new THREE.TorusGeometry(radius, tube, 16, 100);
        const mat = new THREE.MeshBasicMaterial({ 
            color: 0x0ea5e9, 
            transparent: true, 
            opacity: 0.6 - (i * 0.15) 
        });
        const ring = new THREE.Mesh(geo, mat);
        // Random initial rotation
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        group.add(ring);
        rings.push(ring);
        
        // Add particles on ring
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(10 * 3);
        // Simple particles, animation handled in loop
        // (Skipping complex particle setup for brevity, relying on ring movement)
    }

    // 3. Scan Plane
    const planeGeo = new THREE.PlaneGeometry(12, 12);
    const planeMat = new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.05,
        blending: THREE.AdditiveBlending 
    });
    const scanPlane = new THREE.Mesh(planeGeo, planeMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xef4444, 0, 20); // Alarm light
    redLight.position.set(-5, -5, 5);
    scene.add(redLight);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01 * pulseSpeed;

      // Color State Logic
      let baseColor = new THREE.Color(0x0ea5e9); // Blue
      let coreColor = new THREE.Color(0x8b5cf6); // Purple
      
      if (status === 'critical') {
          baseColor.setHex(0xef4444);
          coreColor.setHex(0xff0000);
          redLight.intensity = Math.sin(time * 10) * 2 + 2;
      } else if (status === 'warning') {
          baseColor.setHex(0xf59e0b);
          coreColor.setHex(0xf97316);
          redLight.intensity = 0;
      } else if (status === 'optimal') {
          baseColor.setHex(0x10b981);
          coreColor.setHex(0x34d399);
          redLight.intensity = 0;
      } else {
          redLight.intensity = 0;
      }

      glowMat.color.lerp(coreColor, 0.1);
      
      // Ring Animation (Chaos vs Order)
      rings.forEach((ring, i) => {
          (ring.material as THREE.MeshBasicMaterial).color.lerp(baseColor, 0.1);
          
          // Chaos factor: 1 - stability. 
          // If stability is 1 (optimal), chaos is 0.
          const chaos = (1 - stability) * 0.5;
          
          // Base rotation
          ring.rotation.z += 0.005 * (i % 2 === 0 ? 1 : -1);
          
          // Wobble based on chaos
          ring.rotation.x += Math.sin(time * (i + 1)) * chaos;
          ring.rotation.y += Math.cos(time * (i + 1)) * chaos;
      });

      // Core Pulse
      const scale = 1 + Math.sin(time * 2) * 0.05 * (2 - stability); // Pulse harder when unstable
      core.scale.setScalar(scale);
      
      // Scan Plane
      if (status === 'calibrating') {
          scanPlane.visible = true;
          scanPlane.position.y = Math.sin(time * 5) * 4;
          scanPlane.material.opacity = 0.1 + Math.sin(time * 10) * 0.05;
      } else {
          scanPlane.visible = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [status, stability, pulseSpeed]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

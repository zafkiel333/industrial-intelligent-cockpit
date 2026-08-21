import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      logarithmicDepthBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // ========== 核心修改：清理容器中已存在的 Canvas 元素 ==========
    // 移除容器内所有 canvas 标签，避免重复渲染
    containerRef.current.querySelectorAll('canvas').forEach(canvas => {
      canvas.remove();
    });
    // =============================================================

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- GEOMETRY ---

    // Main Housing (Outer ring) - More detailed
    const housingGroup = new THREE.Group();
    scene.add(housingGroup);

    const outerRingGeo = new THREE.CylinderGeometry(13, 13, 12, 64, 1, true);
    const outerRingMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      clearcoat: 1
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    housingGroup.add(outerRing);

    // Bearing Pads (The segments that actually guide the shaft)
    const padCount = 12;
    const padRadius = 9.2;
    const pads: THREE.Mesh[] = [];
    
    const padMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x475569, 
      metalness: 1, 
      roughness: 0.1,
      emissive: 0x0f172a,
      clearcoat: 1
    });

    for (let i = 0; i < padCount; i++) {
      const angle = (i / padCount) * Math.PI * 2;
      const padGeo = new THREE.BoxGeometry(3.5, 10, 1.2);
      const pad = new THREE.Mesh(padGeo, padMat.clone());
      pad.position.set(Math.cos(angle) * padRadius, 0, Math.sin(angle) * padRadius);
      pad.rotation.y = angle + Math.PI / 2;
      housingGroup.add(pad);
      pads.push(pad);

      // Add sensor details to each pad
      const sensorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
      const sensorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const sensor = new THREE.Mesh(sensorGeo, sensorMat);
      sensor.position.set(Math.cos(angle) * (padRadius + 0.8), 4, Math.sin(angle) * (padRadius + 0.8));
      sensor.rotation.x = Math.PI / 2;
      sensor.rotation.z = angle;
      housingGroup.add(sensor);
    }

    // Inner Shaft - High fidelity
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(8, 8, 20, 64);
    const shaftMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, 
      metalness: 1, 
      roughness: 0.05,
      clearcoat: 1,
      reflectivity: 1
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaftGroup.add(shaft);

    // Shaft Detail (Grooves and highlights)
    for (let i = 0; i < 6; i++) {
      const grooveGeo = new THREE.TorusGeometry(8.05, 0.03, 16, 100);
      const grooveMat = new THREE.MeshBasicMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const groove = new THREE.Mesh(grooveGeo, grooveMat);
      groove.rotation.x = Math.PI / 2;
      groove.position.y = -8 + i * 3.2;
      shaftGroup.add(groove);
    }

    // Oil Film Visualization (Glowing ring between shaft and pads)
    const oilFilmGeo = new THREE.CylinderGeometry(8.5, 8.5, 10, 64, 1, true);
    const oilFilmMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const oilFilm = new THREE.Mesh(oilFilmGeo, oilFilmMat);
    scene.add(oilFilm);

    // Oil Flow (Particles) - More dynamic
    const particleCount = 1500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8.2 + Math.random() * 0.8;
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 12;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
      velArray[i] = 0.01 + Math.random() * 0.03;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x06b6d4, 10, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x3b82f6, 5, 100);
    light2.position.set(-20, -20, 20);
    scene.add(light2);

    // --- ANIMATION ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Rotate shaft
      shaftGroup.rotation.y += 0.015;
      
      // Simulate vibration (orbiting displacement)
      const vibX = Math.sin(time * 4) * 0.15;
      const vibZ = Math.cos(time * 4) * 0.15;
      shaftGroup.position.set(vibX, 0, vibZ);
      
      // Update oil film position and scale based on vibration
      oilFilm.position.set(vibX * 0.5, 0, vibZ * 0.5);
      oilFilm.scale.set(1 + Math.sin(time * 2) * 0.01, 1, 1 + Math.cos(time * 2) * 0.01);

      // Pulse pads based on proximity to shaft (vibration)
      pads.forEach((pad, i) => {
        const angle = (i / padCount) * Math.PI * 2;
        const padX = Math.cos(angle) * padRadius;
        const padZ = Math.sin(angle) * padRadius;
        const dist = Math.sqrt(Math.pow(vibX - padX, 2) + Math.pow(vibZ - padZ, 2));
        
        const intensity = Math.max(0, 1 - (dist - 8) / 2);
        const mat = pad.material as THREE.MeshPhysicalMaterial;
        if (intensity > 0.9) {
          mat.emissive.setHex(0x06b6d4);
          mat.emissiveIntensity = (intensity - 0.9) * 10;
        } else {
          mat.emissive.setHex(0x0f172a);
          mat.emissiveIntensity = 0.1;
        }
      });

      // Animate particles
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];
        const angle = Math.atan2(z, x) + velArray[i];
        const radius = Math.sqrt(x * x + z * z);
        
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 2] = Math.sin(angle) * radius;
        positions[i3 + 1] += 0.03;
        
        if (positions[i3 + 1] > 6) positions[i3 + 1] = -6;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

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
      // 额外优化：卸载时清理 Canvas，避免内存泄漏
      if (containerRef.current) {
        containerRef.current.querySelectorAll('canvas').forEach(canvas => canvas.remove());
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
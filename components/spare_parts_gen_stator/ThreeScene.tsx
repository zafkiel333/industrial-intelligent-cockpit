
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GenStatorThreeProps } from './three-types';

export const GenStatorThreeScene: React.FC<GenStatorThreeProps> = ({ 
  parts, 
  activePartId, 
  rpm, 
  viewMode,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05020a, 0.03); // Deep purple-black fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);

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
    controls.autoRotate = false;

    // --- Generator Construction ---
    const generatorGroup = new THREE.Group();
    scene.add(generatorGroup);

    // 1. Stator Frame & Core (Static)
    const statorGroup = new THREE.Group();
    generatorGroup.add(statorGroup);

    // Stator Core (Laminated Steel)
    const coreGeo = new THREE.CylinderGeometry(5, 5, 4, 64, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.6, 
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    statorGroup.add(core);

    // Stator Windings (Copper Bars) - Abstracted as a ring of vertical bars
    const windingCount = 36;
    const windingMeshes: THREE.Mesh[] = [];
    
    for(let i=0; i<windingCount; i++) {
        const angle = (i / windingCount) * Math.PI * 2;
        const x = Math.cos(angle) * 4.8;
        const z = Math.sin(angle) * 4.8;
        
        const barGeo = new THREE.BoxGeometry(0.2, 5, 0.4);
        
        // Color logic based on view mode
        let color = 0xd97706; // Copper default
        let emissive = 0x000000;
        
        if (viewMode === 'thermal') {
            // Simulate heat map
            const temp = 50 + Math.sin(i * 0.5) * 30; // Mock temp distribution
            color = temp > 70 ? 0xef4444 : (temp > 60 ? 0xf59e0b : 0x10b981);
            emissive = color;
        }

        const barMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            metalness: 0.8, 
            roughness: 0.3,
            emissive: emissive,
            emissiveIntensity: viewMode === 'thermal' ? 0.5 : 0
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(x, 0, z);
        bar.rotation.y = -angle;
        bar.userData = { id: `stator-bar-${i}`, type: 'stator-bar' };
        
        statorGroup.add(bar);
        windingMeshes.push(bar);

        // Upper & Lower Overhangs (End windings)
        const curveGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI/12);
        const curveTop = new THREE.Mesh(curveGeo, barMat);
        curveTop.position.set(x, 2.5, z);
        curveTop.rotation.z = Math.PI/2;
        curveTop.rotation.y = -angle + Math.PI/6; // Tilt
        statorGroup.add(curveTop);
    }

    // 2. Rotor (Rotating)
    const rotorGroup = new THREE.Group();
    generatorGroup.add(rotorGroup);

    // Rotor Spider/Shaft
    const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 7, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    rotorGroup.add(shaft);

    // Rotor Poles (Salient Poles)
    const poleCount = 12;
    for(let i=0; i<poleCount; i++) {
        const angle = (i / poleCount) * Math.PI * 2;
        const dist = 2.5;
        
        const poleGeo = new THREE.BoxGeometry(1.5, 3.8, 0.8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        
        pole.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        pole.rotation.y = -angle + Math.PI/2;
        rotorGroup.add(pole);

        // Field Winding around pole
        const coilGeo = new THREE.BoxGeometry(1.6, 3.0, 0.9);
        const coilMat = new THREE.MeshStandardMaterial({ color: 0xb45309, wireframe: true }); // Copper wireframe look
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.position.copy(pole.position);
        coil.rotation.copy(pole.rotation);
        rotorGroup.add(coil);
    }

    // Slip Rings (Top)
    const slipRingGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 64);
    const slipRingMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, metalness: 1, roughness: 0.1 });
    const ring1 = new THREE.Mesh(slipRingGeo, slipRingMat);
    ring1.rotation.x = Math.PI/2;
    ring1.position.y = 3;
    rotorGroup.add(ring1);
    const ring2 = ring1.clone();
    ring2.position.y = 3.3;
    rotorGroup.add(ring2);

    // 3. Air Gap Visualization (Scanning Ring)
    const gapGeo = new THREE.CylinderGeometry(4.9, 4.9, 0.2, 64, 1, true);
    const gapMat = new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: viewMode === 'airgap' ? 0.3 : 0, 
        side: THREE.DoubleSide,
        wireframe: true
    });
    const airGapRing = new THREE.Mesh(gapGeo, gapMat);
    generatorGroup.add(airGapRing);

    // 4. Flux Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 1.5; // Between rotor and stator
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 4;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xa855f7, size: 0.05, transparent: true, opacity: 0.5 });
    const fluxParticles = new THREE.Points(pGeo, pMat);
    scene.add(fluxParticles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    
    // Core Glow
    const pointLight = new THREE.PointLight(0xd97706, 2, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([...windingMeshes, ...rotorGroup.children]);
        if (intersects.length > 0) {
            // Simplified interaction logic
            onPartSelect('selected-part');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate Rotor
      const rotSpeed = (rpm / 60) * 0.1 * (viewMode === 'airgap' ? 0.1 : 1); // Slow down for inspection
      rotorGroup.rotation.y -= rotSpeed;
      fluxParticles.rotation.y -= rotSpeed * 1.5;

      // Animate Air Gap Ring
      if (viewMode === 'airgap') {
          airGapRing.position.y = Math.sin(time) * 1.8;
          airGapRing.scale.x = 1 + Math.sin(time * 10) * 0.01; // Visualize vibration/gap change
          airGapRing.scale.z = 1 + Math.cos(time * 10) * 0.01;
      }

      // Highlight active part
      windingMeshes.forEach((mesh, idx) => {
          if (viewMode === 'thermal') {
             // Keep thermal colors
          } else {
             // Default pulse for active
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 
                activePartId === mesh.userData.id ? 0.8 + Math.sin(time * 5) * 0.2 : 0;
          }
      });

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
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, activePartId, rpm, viewMode, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

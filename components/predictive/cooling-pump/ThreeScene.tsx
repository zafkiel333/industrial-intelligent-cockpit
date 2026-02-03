
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CoolingPumpAnimatables, PumpViewMode } from './three-types';

interface ThreeSceneProps {
  rpm?: number;
  flowRate?: number; // 0-1
  cavitationLevel?: number; // 0-1
  viewMode?: PumpViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rpm = 1450, 
  flowRate = 0.8,
  cavitationLevel = 0.1,
  viewMode = 'standard'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 40;
    controls.minDistance = 5;

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 15, 30);
    cyanPoint.position.set(-5, 2, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CoolingPumpAnimatables = {};
    const disposables: any[] = [];

    // --- 1. Volute Casing (蜗壳) ---
    // Use a LatheGeometry with varying radius to simulate volute shape roughly
    const volutePoints = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        volutePoints.push(new THREE.Vector2(2 + t * 2, (Math.sin(t * Math.PI) - 0.5) * 1.5));
    }
    const voluteGeo = new THREE.LatheGeometry(volutePoints, 32, 0, Math.PI * 1.8); // Open slightly for discharge
    const voluteMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x334155, 
        metalness: 0.7, 
        roughness: 0.2,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.3 : 1.0,
        transmission: viewMode === 'xray' ? 0.5 : 0
    });
    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.rotation.x = Math.PI / 2;
    group.add(volute);
    animatables.volute = volute;
    disposables.push(voluteGeo, voluteMat);

    // Discharge Nozzle
    const disGeo = new THREE.CylinderGeometry(1, 1.2, 4, 32);
    const disMesh = new THREE.Mesh(disGeo, voluteMat);
    disMesh.position.set(3, 3, 0);
    disMesh.rotation.z = -Math.PI / 4;
    group.add(disMesh);
    animatables.dischargePipe = disMesh;
    disposables.push(disGeo);

    // Suction Nozzle (Axial)
    const sucGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    sucGeo.rotateX(Math.PI / 2);
    const sucMesh = new THREE.Mesh(sucGeo, voluteMat);
    sucMesh.position.z = 2;
    group.add(sucMesh);
    animatables.suctionPipe = sucMesh;
    disposables.push(sucGeo);

    // --- 2. Impeller (叶轮) ---
    const impellerGroup = new THREE.Group();
    // Hub
    const hubGeo = new THREE.CylinderGeometry(0.5, 1.5, 1, 32);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ 
        color: 0xf59e0b, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: viewMode === 'thermal' ? 0xff4400 : 0x000000,
        emissiveIntensity: viewMode === 'thermal' ? 0.5 : 0
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    impellerGroup.add(hub);

    // Blades
    const bladeGeo = new THREE.BoxGeometry(0.1, 1.5, 0.8);
    for(let i=0; i<6; i++) {
        const blade = new THREE.Mesh(bladeGeo, hubMat);
        const angle = (i / 6) * Math.PI * 2;
        blade.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
        blade.rotation.z = angle + 0.5; // Curved effect
        impellerGroup.add(blade);
    }
    group.add(impellerGroup);
    animatables.impeller = impellerGroup;
    disposables.push(hubGeo, bladeGeo, hubMat);

    // --- 3. Fluid Particles (Flow) ---
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        // Initialize at suction
        pPos[i*3] = (Math.random() - 0.5) * 1.0;
        pPos[i*3+1] = (Math.random() - 0.5) * 1.0;
        pPos[i*3+2] = 5 + Math.random() * 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x22d3ee, 
        size: 0.1, 
        transparent: true, 
        opacity: 0.6 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.flowParticles = particles;
    disposables.push(pGeo, pMat);

    // --- 4. Cavitation Bubbles (Anomaly) ---
    const bubbleCount = 200;
    const bGeo = new THREE.BufferGeometry();
    const bPos = new Float32Array(bubbleCount * 3);
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    const bMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.15, 
        transparent: true, 
        opacity: 0 
    });
    const bubbles = new THREE.Points(bGeo, bMat);
    group.add(bubbles);
    animatables.cavitationBubbles = bubbles;
    disposables.push(bGeo, bMat);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Impeller Rotation
      if (animatables.impeller) {
          animatables.impeller.rotation.z -= (rpm / 60) * 0.15;
      }

      // Flow Simulation
      if (animatables.flowParticles) {
          const positions = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              let x = positions[i*3];
              let y = positions[i*3+1];
              let z = positions[i*3+2];

              if (z > 0) {
                  // Suction phase: move towards center
                  z -= 0.15 * flowRate;
                  if (z <= 0) {
                      // Enter volute
                      const angle = Math.atan2(y, x);
                      const r = 0.5;
                      x = Math.cos(angle) * r;
                      y = Math.sin(angle) * r;
                  }
              } else {
                  // Volute phase: spiral out
                  const angle = Math.atan2(y, x) - 0.1; // Rotate
                  const r = Math.sqrt(x*x + y*y) + 0.05 * flowRate; // Expand
                  x = Math.cos(angle) * r;
                  y = Math.sin(angle) * r;
                  
                  // Exit condition
                  if (r > 3.5) {
                      // Reset to suction
                      x = (Math.random() - 0.5) * 1.0;
                      y = (Math.random() - 0.5) * 1.0;
                      z = 5;
                  }
              }

              positions[i*3] = x;
              positions[i*3+1] = y;
              positions[i*3+2] = z;
          }
          animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Cavitation Effect
      if (animatables.cavitationBubbles) {
          const bPositions = animatables.cavitationBubbles.geometry.attributes.position.array as Float32Array;
          const mat = animatables.cavitationBubbles.material as THREE.PointsMaterial;
          mat.opacity = cavitationLevel;

          for(let i=0; i<bubbleCount; i++) {
              // Bubbles near impeller eye (low pressure zone)
              const angle = time * 2 + i;
              const r = 0.8 + Math.random() * 0.5;
              bPositions[i*3] = Math.cos(angle) * r;
              bPositions[i*3+1] = Math.sin(angle) * r;
              bPositions[i*3+2] = (Math.random() - 0.5) * 0.5;
          }
          animatables.cavitationBubbles.geometry.attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [rpm, flowRate, cavitationLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

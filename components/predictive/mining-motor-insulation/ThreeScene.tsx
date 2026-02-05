
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MotorInsulationSceneProps } from './three-types';

export const MiningMotorInsulationScene: React.FC<MotorInsulationSceneProps> = ({
  rotationSpeed,
  windingTemp,
  pdIntensity,
  insulationHealth,
  viewMode,
  isRunning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rotorRef = useRef<THREE.Group | null>(null);
  const windingsRef = useRef<THREE.Group | null>(null);
  const pdParticlesRef = useRef<THREE.Points | null>(null);
  const fieldAuraRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.03); // Dark purple fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    violetLight.position.set(5, 5, 5);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 20);
    blueLight.position.set(-5, -5, -5);
    scene.add(blueLight);

    const heatLight = new THREE.PointLight(0xff4500, 0, 20); // Dynamic heat light
    heatLight.position.set(0, 0, 0);
    scene.add(heatLight);

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Stator Core (Frame)
    const statorGeo = new THREE.CylinderGeometry(4, 4, 6, 32, 1, true);
    const statorMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        wireframe: false
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.z = Math.PI / 2;
    mainGroup.add(stator);

    // Stator Wireframe Overlay
    const edges = new THREE.EdgesGeometry(statorGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.1 }));
    line.rotation.z = Math.PI / 2;
    mainGroup.add(line);

    // 2. Windings (The critical part)
    const windingGroup = new THREE.Group();
    windingsRef.current = windingGroup;
    mainGroup.add(windingGroup);

    const coilCount = 12;
    for(let i=0; i<coilCount; i++) {
        const angle = (i / coilCount) * Math.PI * 2;
        // Elongated torus shape to simulate coil loop
        const coilGeo = new THREE.TorusGeometry(1.5, 0.2, 8, 32);
        const coilMat = new THREE.MeshPhysicalMaterial({
            color: 0xb45309, // Copper
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x000000,
            clearcoat: 1.0
        });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        
        // Position coils around the center
        coil.position.set(0, Math.cos(angle)*2.5, Math.sin(angle)*2.5);
        coil.scale.set(2, 0.8, 1);
        coil.rotation.y = Math.PI / 2;
        coil.rotation.x = -angle; // Orient radially
        
        windingGroup.add(coil);
    }

    // 3. Rotor
    const rotorGroup = new THREE.Group();
    rotorRef.current = rotorGroup;
    mainGroup.add(rotorGroup);

    const rotorGeo = new THREE.CylinderGeometry(1.8, 1.8, 8, 32);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotorGroup.add(rotor);
    
    // Commutator / Slip rings
    const commGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.5, 32);
    commGeo.rotateZ(Math.PI / 2);
    const comm = new THREE.Mesh(commGeo, new THREE.MeshStandardMaterial({ color: 0xb45309 }));
    comm.position.x = 3.5;
    rotorGroup.add(comm);

    // 4. Electric Field Aura
    const auraGeo = new THREE.SphereGeometry(3.8, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.0,
        wireframe: true
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    fieldAuraRef.current = aura;
    mainGroup.add(aura);

    // 5. Partial Discharge Particles (Sparks)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    // Init off screen
    for(let i=0; i<pCount; i++) pPos[i*3] = 100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png')
    });
    const sparks = new THREE.Points(pGeo, pMat);
    pdParticlesRef.current = sparks;
    mainGroup.add(sparks);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Rotor Rotation
      if (rotorRef.current && isRunning) {
          rotorRef.current.rotation.x -= (rotationSpeed / 60) * 0.1;
      }

      // 2. View Mode Logic & Material Updates
      if (windingsRef.current) {
          windingsRef.current.children.forEach((coil: any, i) => {
              const mat = coil.material as THREE.MeshPhysicalMaterial;
              
              if (viewMode === 'thermal') {
                  // Map temperature to color (60C - 180C)
                  // Add variation per coil to simulate hotspots
                  const localTemp = windingTemp + (i % 3 === 0 ? 20 : 0); 
                  const tNorm = Math.min(1, Math.max(0, (localTemp - 60) / 120));
                  const color = new THREE.Color().setHSL(0.7 - tNorm * 0.7, 1.0, 0.5); // Blue to Red
                  
                  mat.color.copy(color);
                  mat.emissive.copy(color);
                  mat.emissiveIntensity = tNorm * 1.5;
                  mat.metalness = 0.2;
              } else if (viewMode === 'electric-field') {
                  mat.color.setHex(0xb45309);
                  mat.emissive.setHex(0x8b5cf6); // Violet glow
                  mat.emissiveIntensity = 0.2 + Math.sin(time * 5 + i) * 0.2; // Pulsing field
                  mat.metalness = 0.8;
              } else {
                  // Standard
                  mat.color.setHex(0xb45309);
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
                  mat.metalness = 0.6;
              }
          });
      }

      // 3. Electric Field Aura
      if (fieldAuraRef.current) {
          if (viewMode === 'electric-field') {
              fieldAuraRef.current.visible = true;
              (fieldAuraRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 2) * 0.05;
              fieldAuraRef.current.rotation.y += 0.005;
              fieldAuraRef.current.rotation.z -= 0.005;
          } else {
              fieldAuraRef.current.visible = false;
          }
      }

      // 4. PD Particles (Sparks)
      if (pdParticlesRef.current) {
          const positions = pdParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const mat = pdParticlesRef.current.material as THREE.PointsMaterial;
          
          // Intensity defines frequency and visibility
          if (pdIntensity > 50) {
              mat.opacity = Math.min(1, pdIntensity / 500);
              
              for(let i=0; i<pCount; i++) {
                  // Randomly spawn sparks near windings
                  if (Math.random() > 0.95) {
                      const angle = Math.random() * Math.PI * 2;
                      const r = 2.5;
                      positions[i*3] = (Math.random() - 0.5) * 4; // X (Axial)
                      positions[i*3+1] = Math.cos(angle) * r;
                      positions[i*3+2] = Math.sin(angle) * r;
                  } else {
                      // Hide
                      positions[i*3] = 100;
                  }
              }
              pdParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          } else {
              mat.opacity = 0;
          }
      }

      // Heat light
      if (viewMode === 'thermal') {
          heatLight.intensity = (windingTemp - 60) / 40;
      } else {
          heatLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [rotationSpeed, windingTemp, pdIntensity, insulationHealth, viewMode, isRunning]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

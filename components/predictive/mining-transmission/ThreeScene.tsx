
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransmissionSceneProps } from './three-types';

export const TransmissionThreeScene: React.FC<TransmissionSceneProps> = ({
  inputRpm,
  outputRpm,
  currentGear,
  clutches,
  oilTemp,
  vibrationLevel,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gearGroupsRef = useRef<THREE.Group[]>([]);
  const shaftRef = useRef<THREE.Mesh | null>(null);
  const housingRef = useRef<THREE.Mesh | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-transmission useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050200, 0.03); // Deep Amber Fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xf59e0b, 3, 50); // Amber light
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const backLight = new THREE.SpotLight(0x3b82f6, 5); // Blue rim light
    backLight.position.set(-10, 5, -5);
    scene.add(backLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, metalness: 0.9, roughness: 0.3 
    });
    
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0xb45309, metalness: 0.7, roughness: 0.4 
    });
    
    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const clutchPlateMat = new THREE.MeshStandardMaterial({
        color: 0x44403c, metalness: 0.5, roughness: 0.9
    });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Transmission Housing
    const housingGeo = new THREE.CylinderGeometry(4, 4, 12, 32, 1, true);
    housingGeo.rotateZ(Math.PI / 2);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housingRef.current = housing;
    mainGroup.add(housing);

    // 2. Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 16);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    shaftRef.current = shaft;
    mainGroup.add(shaft);

    // 3. Planetary Gear Sets & Clutches
    gearGroupsRef.current = [];
    const setPositions = [-3, 0, 3]; 

    setPositions.forEach((x, i) => {
        const setGroup = new THREE.Group();
        setGroup.position.x = x;
        mainGroup.add(setGroup);
        gearGroupsRef.current.push(setGroup);

        // Sun Gear (Center)
        const sunGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 24);
        sunGeo.rotateZ(Math.PI/2);
        const sun = new THREE.Mesh(sunGeo, steelMat);
        setGroup.add(sun);

        // Planet Gears (3)
        const planetGroup = new THREE.Group();
        setGroup.add(planetGroup);
        
        for(let p=0; p<3; p++) {
            const angle = (p / 3) * Math.PI * 2;
            const planetGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 16);
            planetGeo.rotateZ(Math.PI/2);
            const planet = new THREE.Mesh(planetGeo, steelMat);
            planet.position.set(0, Math.cos(angle)*2.2, Math.sin(angle)*2.2);
            planetGroup.add(planet);
        }

        // Ring Gear (Outer)
        const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 16, 64);
        ringGeo.rotateY(Math.PI/2);
        const ring = new THREE.Mesh(ringGeo, bronzeMat);
        setGroup.add(ring);

        // Clutch Pack (Surrounding)
        // Multi-disc pack visual
        for(let c=0; c<5; c++) {
            const clutchGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 32);
            clutchGeo.rotateZ(Math.PI/2);
            const clutchMesh = new THREE.Mesh(clutchGeo, clutchPlateMat.clone());
            clutchMesh.position.x = (c - 2) * 0.2;
            // Name it specially to find it later
            clutchMesh.name = `clutch-plate-${i}-${c}`;
            setGroup.add(clutchMesh);
        }
    });

    // 4. Oil Particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 10;
        pPos[i*3+1] = -2 + Math.random() * 2; // Bottom of case
        pPos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 0.1,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    oilParticlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 1. Shaft Rotation
      if (shaftRef.current) {
          shaftRef.current.rotation.x -= (inputRpm / 60) * 0.1;
      }

      // 2. Gear Set Animation & Clutch State
      gearGroupsRef.current.forEach((group, i) => {
          const carrier = group.children[1];
          const sun = group.children[0];
          
          // Logic: Input speed propagates
          // Simplified visual: higher gears (higher index) spin faster output
          const speedFactor = 1 / (i + 1);
          
          sun.rotation.x -= (inputRpm/60) * 0.1; // Sun spins with shaft
          carrier.rotation.x -= (outputRpm/60) * 0.1 * speedFactor; // Planets orbit
          
          // Update Clutch Colors based on Engagement
          const clutchData = clutches[i];
          if (clutchData) {
              const isEngaged = clutchData.isEngaged;
              const heat = Math.min(1, (clutchData.temp - 60)/100);
              
              for(let c=0; c<5; c++) {
                  const plate = group.getObjectByName(`clutch-plate-${i}-${c}`) as THREE.Mesh;
                  if (plate) {
                      const mat = plate.material as THREE.MeshStandardMaterial;
                      
                      if (viewMode === 'thermal') {
                          mat.color.setHSL(0.7 - heat*0.7, 1.0, 0.5); // Blue to Red
                          mat.emissive.setHSL(0.7 - heat*0.7, 1.0, 0.5);
                          mat.emissiveIntensity = 0.5;
                      } else {
                          if (isEngaged) {
                              mat.color.setHex(0xf59e0b); // Gold
                              mat.emissive.setHex(0xf59e0b);
                              mat.emissiveIntensity = 0.3;
                              // Compress plates visually
                              plate.position.x = (c - 2) * 0.15; 
                          } else {
                              mat.color.setHex(0x44403c); // Grey
                              mat.emissive.setHex(0x000000);
                              mat.emissiveIntensity = 0;
                              // Expand plates
                              plate.position.x = (c - 2) * 0.2;
                          }
                      }
                  }
              }
          }
      });

      // 3. Vibration Shake
      if (mainGroup && vibrationLevel > 0) {
          mainGroup.position.y = Math.sin(time * 50) * vibrationLevel * 0.05;
          mainGroup.position.z = Math.cos(time * 50) * vibrationLevel * 0.05;
      }

      // 4. Housing Visibility
      if (housingRef.current) {
          const mat = housingRef.current.material as THREE.MeshPhysicalMaterial;
          if (viewMode === 'solid') {
              mat.opacity = 0.9;
              mat.color.setHex(0x475569);
          } else {
              mat.opacity = 0.2;
              mat.color.setHex(0x1c1917);
          }
      }

      // 5. Oil Particles Animation
      if (oilParticlesRef.current) {
          const pos = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3] += (inputRpm > 0 ? 0.05 : 0) * (Math.random() > 0.5 ? 1 : -1);
              if (Math.abs(pos[i*3]) > 6) pos[i*3] *= -0.9;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          oilParticlesRef.current.visible = viewMode !== 'solid';
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [inputRpm, outputRpm, currentGear, clutches, oilTemp, vibrationLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

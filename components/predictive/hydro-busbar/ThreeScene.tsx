
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BusbarSceneProps } from './three-types';

export const BusbarScene: React.FC<BusbarSceneProps> = ({ 
  phaseTemps, 
  loadCurrent,
  hotspotLocation,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const busbarsRef = useRef<THREE.Mesh[]>([]);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const heatParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark environment for heat glow visibility
    scene.fog = new THREE.FogExp2(0x050202, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Use tone mapping to allow bright emissive colors to bloom (simulated)
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const heatLight = new THREE.PointLight(0xff4500, 0, 20); // Dynamic heat source
    heatLight.position.set(0, 2, 0);
    scene.add(heatLight);

    // --- Materials ---
    const copperMat = new THREE.MeshStandardMaterial({ 
      color: 0xb87333, metalness: 0.8, roughness: 0.3 
    });
    
    const insulationMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155, metalness: 0.1, roughness: 0.8, clearcoat: 0.5
    });

    const thermalMat = new THREE.MeshBasicMaterial({
        color: 0x0000ff, // Base cool color
    });

    const boltMat = new THREE.MeshStandardMaterial({
        color: 0x888888, metalness: 0.9, roughness: 0.2
    });

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    busbarsRef.current = [];
    jointsRef.current = [];

    // Create 3 Phases
    [-2, 0, 2].forEach((x, i) => {
        const phaseGroup = new THREE.Group();
        phaseGroup.position.set(x, 0, 0);
        mainGroup.add(phaseGroup);

        // 1. Busbar Segments (Rectangular copper bar)
        const barGeo = new THREE.BoxGeometry(0.5, 0.8, 8);
        const bar = new THREE.Mesh(barGeo, copperMat.clone());
        bar.userData = { phaseIndex: i, type: 'bar' };
        phaseGroup.add(bar);
        busbarsRef.current.push(bar);

        // 2. Joint (The connection point in the middle)
        // Two plates bolted together
        const plateGeo = new THREE.BoxGeometry(0.8, 1.0, 1.2);
        const joint = new THREE.Mesh(plateGeo, copperMat.clone());
        joint.userData = { phaseIndex: i, type: 'joint' };
        phaseGroup.add(joint);
        jointsRef.current.push(joint);

        // 3. Bolts
        const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
        boltGeo.rotateZ(Math.PI/2);
        for(let b=0; b<4; b++) {
            const bolt = new THREE.Mesh(boltGeo, boltMat);
            const bx = (b%2===0 ? -0.2 : 0.2);
            const bz = (b<2 ? -0.3 : 0.3);
            bolt.position.set(0, 0, bz);
            // Slightly offset Y based on b
            bolt.position.y = (b%2===0 ? 0.2 : -0.2); 
            joint.add(bolt);
        }

        // 4. Support Insulators
        const supportGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 32);
        [-3, 3].forEach(z => {
            const support = new THREE.Mesh(supportGeo, insulationMat);
            support.position.set(0, -1.2, z);
            phaseGroup.add(support);
        });
    });

    // Heat Particles (Rising from hot joints)
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; // Hide initially
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xff4500,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    heatParticlesRef.current = particles;
    scene.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Material & Temperature Update
      [...busbarsRef.current, ...jointsRef.current].forEach(mesh => {
          const { phaseIndex, type } = mesh.userData;
          const temp = phaseTemps[phaseIndex];
          const isHotspot = (hotspotLocation === phaseIndex + 1) && (type === 'joint');
          
          // Calculate effective temp for visualization
          // Joints are hotter than bars generally, hotspot is much hotter
          let effTemp = temp;
          if (type === 'joint') effTemp += 5; 
          if (isHotspot) effTemp += 30; // Significant rise

          // Color Mapping
          // 40C (Blue) -> 60C (Green) -> 80C (Yellow) -> 100C+ (Red/White)
          const tNorm = Math.min(1, Math.max(0, (effTemp - 40) / 100));
          const heatColor = new THREE.Color().setHSL(0.66 - tNorm * 0.66, 1.0, 0.5 + tNorm*0.2);

          if (viewMode === 'thermal') {
              (mesh.material as THREE.MeshStandardMaterial).color.copy(heatColor);
              (mesh.material as THREE.MeshStandardMaterial).emissive.copy(heatColor);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
              (mesh.material as THREE.MeshStandardMaterial).metalness = 0.1;
          } else {
              // Visual Mode: Only glow if really hot
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xb87333); // Copper
              (mesh.material as THREE.MeshStandardMaterial).metalness = 0.8;
              
              if (effTemp > 80) {
                  (mesh.material as THREE.MeshStandardMaterial).emissive.copy(heatColor);
                  (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = (effTemp - 80) / 50;
              } else {
                  (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                  (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
              }
          }
      });

      // 2. Particle System (Heat Shimmer)
      if (heatParticlesRef.current) {
          const positions = heatParticlesRef.current.geometry.attributes.position.array as Float32Array;
          let pIdx = 0;
          
          // Emit particles only from the hotspot phase if exists
          if (hotspotLocation > 0) {
              const phaseX = (hotspotLocation - 2) * 2; // Map 1,2,3 to -2, 0, 2
              // Only simulate for a subset to create rising effect
              for(let i=0; i<pCount; i++) {
                  if (positions[i*3+1] > 4 || positions[i*3+1] < -10) {
                      // Reset to source
                      positions[i*3] = phaseX + (Math.random()-0.5)*0.8;
                      positions[i*3+1] = 0.5 + (Math.random()*0.5);
                      positions[i*3+2] = (Math.random()-0.5)*0.8;
                  }
                  
                  // Rise up
                  positions[i*3+1] += 0.05 + Math.random()*0.02;
                  // Drift
                  positions[i*3] += Math.sin(time + i)*0.01;
                  
                  // Hide if no hotspot
                  if (hotspotLocation === 0) positions[i*3+1] = -100;
              }
              heatParticlesRef.current.geometry.attributes.position.needsUpdate = true;
              
              // Color based on temp
              const hotTemp = phaseTemps[hotspotLocation-1] + 30;
              const tNorm = Math.min(1, Math.max(0, (hotTemp - 40) / 100));
              const heatColor = new THREE.Color().setHSL(0.1, 1.0, 0.5); // Orange/Red sparks
              (heatParticlesRef.current.material as THREE.PointsMaterial).color.copy(heatColor);
              (heatParticlesRef.current.material as THREE.PointsMaterial).opacity = tNorm * 0.5;
          } else {
              // Hide all
               for(let i=0; i<pCount; i++) positions[i*3+1] = -100;
               heatParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
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
  }, [phaseTemps, loadCurrent, hotspotLocation, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

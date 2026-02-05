
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HoistSceneProps } from './three-types';

export const GateHoistScene: React.FC<HoistSceneProps> = ({ 
  extension,
  pressureHead,
  pressureRod,
  sealWear,
  rodScore,
  temperature,
  isMoving
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rodRef = useRef<THREE.Mesh | null>(null);
  const glandRef = useRef<THREE.Mesh | null>(null);
  const leakParticlesRef = useRef<THREE.Points | null>(null);
  const armRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    const orangeLight = new THREE.PointLight(0xf97316, 2, 20); // Warning light
    orangeLight.position.set(-5, 5, -5);
    scene.add(orangeLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 1, 20); // Cool light
    blueLight.position.set(5, -5, 5);
    scene.add(blueLight);

    // --- Materials ---
    const cylinderMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.6, roughness: 0.4 
    });
    
    // Rod material - shiny chrome, becomes rougher with wear
    const rodMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xe2e8f0, 
        metalness: 0.9, 
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const sealMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, metalness: 0.2, roughness: 0.8
    });

    const armMat = new THREE.MeshStandardMaterial({
        color: 0x475569, metalness: 0.4, roughness: 0.7
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Cylinder Barrel (Stationary)
    // Pivot at (-6, 0, 0)
    const barrelLength = 10;
    const barrelGeo = new THREE.CylinderGeometry(1.2, 1.2, barrelLength, 32);
    barrelGeo.rotateZ(Math.PI / 2);
    barrelGeo.translate(-1, 0, 0); // Shift center
    const barrel = new THREE.Mesh(barrelGeo, cylinderMat);
    mainGroup.add(barrel);

    // Trunnion/Pivot mount
    const pivotGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
    pivotGeo.rotateX(Math.PI / 2);
    const pivot = new THREE.Mesh(pivotGeo, cylinderMat);
    pivot.position.set(-5, 0, 0);
    mainGroup.add(pivot);

    // 2. Cylinder Head / Gland (Seal location)
    const glandGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.5, 32);
    glandGeo.rotateZ(Math.PI / 2);
    const gland = new THREE.Mesh(glandGeo, sealMat);
    gland.position.set(3.5, 0, 0); // End of barrel
    glandRef.current = gland;
    mainGroup.add(gland);

    // 3. Piston Rod (Moving)
    const rodLength = 12;
    const rodGeo = new THREE.CylinderGeometry(0.6, 0.6, rodLength, 32);
    rodGeo.rotateZ(Math.PI / 2);
    rodGeo.translate(rodLength/2, 0, 0); // Pivot at 0
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(0, 0, 0); // Start inside
    rodRef.current = rod;
    mainGroup.add(rod);

    // Clevis (Rod End)
    const clevisGeo = new THREE.BoxGeometry(2, 1.5, 1.5);
    const clevis = new THREE.Mesh(clevisGeo, cylinderMat);
    clevis.position.x = rodLength;
    rod.add(clevis); // Attach to rod

    // 4. Gate Arm Fragment (Visual Context)
    const armGroup = new THREE.Group();
    armRef.current = armGroup;
    mainGroup.add(armGroup);
    
    // Connects to Clevis
    const armSegment = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 1), armMat);
    armSegment.position.y = -3;
    armGroup.add(armSegment);
    const pivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 16), steelMat);
    pivotPin.rotation.x = Math.PI/2;
    armGroup.add(pivotPin);

    // 5. Leakage Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 3.5 + (Math.random()-0.5)*0.2; // Gland X
        pPos[i*3+1] = -0.6; // Bottom of gland
        pPos[i*3+2] = (Math.random()-0.5)*0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xf59e0b, // Oil color
        size: 0.1,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    leakParticlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Rod Extension Animation
      if (rodRef.current) {
          // Extension ranges from -4 (retracted) to +4 (extended) relative to base
          // Base position of rod mesh was 0 (starts at internal).
          // Let's say extension 0% = x: -4, 100% = x: 2
          const targetX = -4 + (extension / 100) * 6;
          rodRef.current.position.x += (targetX - rodRef.current.position.x) * 0.1;

          // Update Arm position to follow rod end
          if (armRef.current) {
              // Rod end world position approx: rod.pos.x + 12 (length)
              const rodTipX = rodRef.current.position.x + 12;
              armRef.current.position.set(rodTipX, 0, 0);
              // Slight rotation to simulate arc movement
              const arcAngle = -0.2 + (extension / 100) * 0.4; // -0.2 to 0.2 rad
              armRef.current.rotation.z = arcAngle;
              
              // Correct rod rotation slightly to match (pivot at -5)
              mainGroup.rotation.z = arcAngle * 0.5; 
          }
          
          // Rod Scoring Visual
          // Increase roughness if score is high
          const rMat = rodRef.current.material as THREE.MeshPhysicalMaterial;
          rMat.roughness = 0.1 + (rodScore / 100) * 0.6;
          rMat.metalness = 0.9 - (rodScore / 100) * 0.4;
          // Darken color with wear
          const baseColor = new THREE.Color(0xe2e8f0);
          rMat.color.lerpColors(baseColor, new THREE.Color(0x3f3f46), rodScore/100);
      }

      // 2. Heat Map on Gland (Seal Friction)
      if (glandRef.current) {
          const mat = glandRef.current.material as THREE.MeshStandardMaterial;
          // Temp 20C -> 100C maps to Blue -> Red
          const tNorm = Math.min(1, Math.max(0, (temperature - 20) / 80));
          const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5); 
          mat.emissive.copy(color);
          mat.emissiveIntensity = tNorm * 0.8;
      }

      // 3. Leakage Particles
      if (leakParticlesRef.current) {
          const positions = leakParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const mat = leakParticlesRef.current.material as THREE.PointsMaterial;
          
          if (sealWear > 40) { // Only leak if wear is significant
              mat.opacity = (sealWear - 40) / 60;
              for(let i=0; i<pCount; i++) {
                  // Drop down
                  positions[i*3+1] -= 0.02 + Math.random() * 0.02;
                  // Reset
                  if (positions[i*3+1] < -4) {
                      positions[i*3+1] = -0.6;
                      positions[i*3] = 3.5 + (Math.random()-0.5)*0.2;
                  }
              }
              leakParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          } else {
              mat.opacity = 0;
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
  }, [extension, pressureHead, pressureRod, sealWear, rodScore, temperature, isMoving]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, metalness: 0.8, roughness: 0.3 
});

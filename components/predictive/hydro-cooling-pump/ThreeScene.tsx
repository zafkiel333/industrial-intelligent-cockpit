
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CoolingPumpProps } from './three-types';

export const CoolingPumpScene: React.FC<CoolingPumpProps> = ({ 
  activePumpId,
  flowRate,
  vibration,
  temperature,
  isCavitating,
  cloggingLevel
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pumpsRef = useRef<THREE.Group[]>([]);
  const flowParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2, 20);
    cyanLight.position.set(5, 5, 5);
    scene.add(cyanLight);

    const orangeLight = new THREE.PointLight(0xf97316, 0, 20); // Alarm light
    orangeLight.position.set(0, 5, 0);
    scene.add(orangeLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.7, roughness: 0.3 
    });
    
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    const activePumpMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9, metalness: 0.6, roughness: 0.4, emissive: 0x0ea5e9, emissiveIntensity: 0.2
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Skid Base
    const skidGeo = new THREE.BoxGeometry(8, 0.2, 4);
    const skid = new THREE.Mesh(skidGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    skid.position.y = -0.1;
    mainGroup.add(skid);

    // Pumps (Horizontal Centrifugal)
    pumpsRef.current = [];
    [-2, 2].forEach((x, i) => {
        const pumpGroup = new THREE.Group();
        pumpGroup.position.set(x, 0.5, 0);
        mainGroup.add(pumpGroup);
        pumpsRef.current.push(pumpGroup);

        // Motor
        const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
        motorGeo.rotateZ(Math.PI/2);
        const motor = new THREE.Mesh(motorGeo, steelMat.clone());
        motor.position.x = 1.5;
        pumpGroup.add(motor);

        // Volute (Pump Body)
        const voluteGeo = new THREE.SphereGeometry(1, 32, 16);
        const volute = new THREE.Mesh(voluteGeo, steelMat.clone());
        pumpGroup.add(volute);

        // Suction Pipe (Front)
        const suctionGeo = new THREE.CylinderGeometry(0.6, 0.6, 2, 16);
        suctionGeo.rotateX(Math.PI/2);
        const suction = new THREE.Mesh(suctionGeo, pipeMat);
        suction.position.z = 2;
        pumpGroup.add(suction);

        // Discharge Pipe (Top)
        const dischargeGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
        const discharge = new THREE.Mesh(dischargeGeo, pipeMat);
        discharge.position.y = 2;
        pumpGroup.add(discharge);
        
        // Status Ring
        const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 8, 32);
        ringGeo.rotateY(Math.PI/2);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({color: 0x333333}));
        pumpGroup.add(ring);
    });

    // Manifolds (Connecting Pipes)
    // Suction Header
    const headerGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
    headerGeo.rotateZ(Math.PI/2);
    const suctionHeader = new THREE.Mesh(headerGeo, pipeMat);
    suctionHeader.position.set(0, 0.5, 3);
    mainGroup.add(suctionHeader);

    // Discharge Header (Higher up)
    const dischargeHeader = new THREE.Mesh(headerGeo, pipeMat);
    dischargeHeader.position.set(0, 4, 0);
    mainGroup.add(dischargeHeader);

    // Elbows to connect pumps to headers would go here... simplified for visualization

    // Flow Particles
    const pCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount); // Store individual speeds
    
    for(let i=0; i<pCount; i++) {
        // Init inside suction header or active pump pipes
        pPos[i*3] = (Math.random()-0.5) * 8; 
        pPos[i*3+1] = 0.5 + (Math.random()-0.5)*0.5;
        pPos[i*3+2] = 3 + (Math.random()-0.5)*0.5;
        pSpeeds[i] = 0.05 + Math.random() * 0.05;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    flowParticlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Pump Visualization (Active State)
      pumpsRef.current.forEach((pump, i) => {
          const isActive = (i + 1) === activePumpId;
          const motor = pump.children[0] as THREE.Mesh;
          const ring = pump.children[3] as THREE.Mesh;
          
          if (isActive) {
              // Shake if vibration is high
              if (vibration > 0) {
                  pump.position.x = (i === 0 ? -2 : 2) + Math.sin(time * 50) * vibration * 0.05;
              }
              // Spin ring visual
              ring.rotation.z -= 0.2;
              (ring.material as THREE.MeshBasicMaterial).color.setHex(0x0ea5e9);
              
              // Heat Color
              if (temperature > 60) {
                  (motor.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
                  (motor.material as THREE.MeshStandardMaterial).emissiveIntensity = (temperature - 60) / 40;
              } else {
                  (motor.material as THREE.MeshStandardMaterial).emissive.setHex(0x0ea5e9);
                  (motor.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
              }
          } else {
              (ring.material as THREE.MeshBasicMaterial).color.setHex(0x333333);
              (motor.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
              pump.position.x = i === 0 ? -2 : 2; // Reset pos
          }
      });

      // 2. Particle Flow Logic
      if (flowParticlesRef.current) {
          const positions = flowParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const activeX = activePumpId === 1 ? -2 : 2;
          
          for(let i=0; i<pCount; i++) {
              let x = positions[i*3];
              let y = positions[i*3+1];
              let z = positions[i*3+2];
              
              const speed = pSpeeds[i] * (flowRate / 100);

              // Simple state machine for particle path
              // State 0: Suction Header (z=3) -> move towards active pump x
              if (z > 2) {
                  if (Math.abs(x - activeX) > 0.5) {
                      x += (activeX - x) * 0.1; // Move to pump inlet
                  } else {
                      z -= speed * 2; // Enter pump
                  }
              }
              // State 1: In Pump (z < 2 and y < 2) -> move Up
              else if (y < 3.5 && z < 2) {
                   y += speed * 2;
                   z = 0 + (Math.random()-0.5)*0.5; // Center in discharge
                   // Cavitation bubbles jitter
                   if (isCavitating) {
                       x += (Math.random()-0.5) * 0.1;
                   }
              }
              // State 2: Discharge Header (y > 3) -> move Out
              else if (y >= 3.5) {
                   x += speed * 2; // Flow out
                   z = 0 + (Math.random()-0.5)*0.5;
              }

              // Reset
              if (x > 5 || y > 5) {
                   x = (Math.random()-0.5) * 8;
                   y = 0.5;
                   z = 3;
              }
              
              positions[i*3] = x;
              positions[i*3+1] = y;
              positions[i*3+2] = z;
          }
          flowParticlesRef.current.geometry.attributes.position.needsUpdate = true;

          // Clogging effect: Darken particles
          const baseColor = new THREE.Color(0x22d3ee);
          const sludgeColor = new THREE.Color(0x3f3f3f);
          (flowParticlesRef.current.material as THREE.PointsMaterial).color.lerpColors(baseColor, sludgeColor, cloggingLevel);
      }

      // Lights
      if (temperature > 80 || vibration > 0.8) {
          orangeLight.intensity = 1.0 + Math.sin(time * 10);
      } else {
          orangeLight.intensity = 0;
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
  }, [activePumpId, flowRate, vibration, temperature, isCavitating, cloggingLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

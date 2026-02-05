
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocomotiveSceneProps } from './three-types';

export const LocomotiveThreeScene: React.FC<LocomotiveSceneProps> = ({
  speed,
  pantographHeight,
  isSparking,
  brakeTemp,
  motorTemp,
  viewMode,
  trackCurvature
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const locoGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const pantographRef = useRef<THREE.Group | null>(null);
  const sparkSystemRef = useRef<THREE.Points | null>(null);
  const tunnelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020409, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 6, 12);
    camera.lookAt(0, 1, 0);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const headLight = new THREE.SpotLight(0xffffff, 10, 50, 0.5, 0.5);
    headLight.position.set(5, 2, 0);
    headLight.target.position.set(20, 0, 0);
    scene.add(headLight);
    scene.add(headLight.target);

    const tunnelLight = new THREE.PointLight(0xffaa00, 1, 30);
    tunnelLight.position.set(0, 8, 0);
    scene.add(tunnelLight);

    // --- Materials ---
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0xfacc15, // Industrial Yellow
        metalness: 0.2,
        roughness: 0.4,
        clearcoat: 0.5,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.2 : 1.0
    });

    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.8, roughness: 0.3 
    });

    const thermalMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Placeholder for thermal updates

    // --- Geometry ---
    const locoGroup = new THREE.Group();
    locoGroupRef.current = locoGroup;
    scene.add(locoGroup);

    // 1. Chassis & Body
    const chassisGeo = new THREE.BoxGeometry(8, 1, 3);
    const chassis = new THREE.Mesh(chassisGeo, steelMat);
    chassis.position.y = 1;
    locoGroup.add(chassis);

    const cabGeo = new THREE.BoxGeometry(2.5, 3, 2.8);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(2.5, 3, 0);
    locoGroup.add(cab);

    const engineBodyGeo = new THREE.BoxGeometry(5, 2, 2.8);
    const engineBody = new THREE.Mesh(engineBodyGeo, bodyMat);
    engineBody.position.set(-1.5, 2.5, 0);
    locoGroup.add(engineBody);

    // 2. Wheels (2 Axles)
    wheelsRef.current = [];
    [-2.5, 2.5].forEach(x => {
        const axleGroup = new THREE.Group();
        axleGroup.position.x = x;
        locoGroup.add(axleGroup);

        const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.2), steelMat);
        axle.rotation.x = Math.PI/2;
        axle.position.y = 0.8;
        axleGroup.add(axle);

        // Wheels
        [-1.5, 1.5].forEach(z => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32), steelMat);
            wheel.rotation.x = Math.PI/2;
            wheel.position.set(0, 0.8, z);
            
            // Add brake disc visual
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16), steelMat.clone());
            disc.rotation.x = Math.PI/2;
            disc.position.set(0, 0.8, z * 0.8);
            disc.name = 'brakeDisc'; // Tag for thermal update
            
            axleGroup.add(wheel);
            axleGroup.add(disc);
        });
        
        // Motor (Ghosted in Xray)
        const motor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({color: 0x475569}));
        motor.position.set(0, 1.5, 0);
        motor.name = 'tractionMotor'; // Tag
        axleGroup.add(motor);

        wheelsRef.current.push(axleGroup);
    });

    // 3. Pantograph (Scissor style)
    const pantoGroup = new THREE.Group();
    pantoGroup.position.set(-2, 3.5, 0);
    pantographRef.current = pantoGroup;
    locoGroup.add(pantoGroup);

    const baseP = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), steelMat);
    pantoGroup.add(baseP);

    // Arms (Simplified)
    const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), steelMat);
    armLower.position.set(0, 1, 0);
    armLower.rotation.z = -0.5; // Folded
    armLower.name = 'armLower';
    pantoGroup.add(armLower);

    const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), steelMat);
    armUpper.position.set(0.8, 2.5, 0); // Approx tip of lower
    armUpper.rotation.z = 0.5;
    armUpper.name = 'armUpper';
    pantoGroup.add(armUpper);
    
    const slider = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.4), new THREE.MeshStandardMaterial({color: 0x333333}));
    slider.position.set(0, 3.5, 0); // Top
    slider.name = 'slider';
    pantoGroup.add(slider);

    // 4. Sparks Particle System
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparkSystemRef.current = sparks;
    locoGroup.add(sparks);

    // 5. Tunnel Environment (Moving lines to simulate speed)
    const tunnelGroup = new THREE.Group();
    tunnelRef.current = tunnelGroup;
    scene.add(tunnelGroup);
    
    for(let i=0; i<20; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.2, 8, 16, Math.PI), new THREE.MeshBasicMaterial({color: 0x1e293b, transparent: true, opacity: 0.3}));
        ring.position.x = -50 + i * 10;
        ring.position.y = 4;
        ring.rotation.y = Math.PI / 2;
        tunnelGroup.add(ring);

        // Wall Lights
        const lightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), new THREE.MeshBasicMaterial({color: 0xffaa00}));
        lightMesh.position.set(-50 + i * 10, 8, 3);
        tunnelGroup.add(lightMesh);
    }


    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Wheel Rotation (Speed)
      const rotSpeed = speed / 10; 
      wheelsRef.current.forEach(w => {
          w.children.forEach(c => {
              if (c.geometry.type === 'CylinderGeometry' && c.name !== 'brakeDisc') {
                  c.rotation.y -= rotSpeed; // Cylinder rotated X, so rotate Y local
              }
          });
      });

      // 2. Locomotive Movement Simulation (Tunnel moving back)
      if (tunnelRef.current) {
          tunnelRef.current.position.x += rotSpeed * 2;
          if (tunnelRef.current.position.x > 10) tunnelRef.current.position.x -= 10; // Loop
      }
      
      // 3. Locomotive Sway (Vibration)
      if (locoGroupRef.current) {
          locoGroupRef.current.position.y = Math.sin(time * 20) * 0.02 * (speed / 10);
          locoGroupRef.current.rotation.z = Math.sin(time * 5) * 0.01; // Roll
          locoGroupRef.current.rotation.y = Math.sin(time * 2) * 0.02; // Yaw (Hunting)
      }

      // 4. Pantograph Dynamics
      if (pantographRef.current) {
          // Extension
          const ext = 1 + pantographHeight * 2;
          const slider = pantographRef.current.getObjectByName('slider');
          if (slider) {
              slider.position.y = ext;
              
              // Sparks
              if (isSparking && sparkSystemRef.current) {
                  const positions = sparkSystemRef.current.geometry.attributes.position.array as Float32Array;
                  for(let i=0; i<pCount; i++) {
                      // Reset to slider
                      if (Math.random() > 0.8) {
                          positions[i*3] = slider.position.x - 2 + (Math.random()-0.5)*0.5; // Relative to loco group
                          positions[i*3+1] = slider.position.y + 3.5;
                          positions[i*3+2] = slider.position.z + (Math.random()-0.5)*0.5;
                      }
                      // Fall
                      positions[i*3] -= speed * 0.1; // Drag back
                      positions[i*3+1] -= 0.1;
                  }
                  sparkSystemRef.current.geometry.attributes.position.needsUpdate = true;
                  (sparkSystemRef.current.material as THREE.PointsMaterial).opacity = 1;
              } else if (sparkSystemRef.current) {
                  (sparkSystemRef.current.material as THREE.PointsMaterial).opacity = 0;
              }
          }
      }

      // 5. Thermal Visualization
      wheelsRef.current.forEach(axle => {
          // Brakes
          const discs = axle.children.filter(c => c.name === 'brakeDisc');
          discs.forEach((d: any) => {
             const mat = d.material as THREE.MeshStandardMaterial;
             if (viewMode === 'thermal') {
                 const tNorm = Math.min(1, (brakeTemp - 50) / 300);
                 const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
                 mat.color.copy(color);
                 mat.emissive.copy(color);
                 mat.emissiveIntensity = tNorm;
             } else {
                 mat.color.setHex(0x334155);
                 mat.emissive.setHex(0x000000);
             }
          });
          
          // Motors
          const motor = axle.getObjectByName('tractionMotor') as THREE.Mesh;
          if (motor) {
             const mat = motor.material as THREE.MeshStandardMaterial;
             if (viewMode === 'thermal') {
                 const tNorm = Math.min(1, (motorTemp - 50) / 100);
                 const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
                 mat.color.copy(color);
                 mat.emissive.copy(color);
                 mat.emissiveIntensity = tNorm;
             } else {
                 mat.color.setHex(0x475569);
                 mat.emissive.setHex(0x000000);
             }
          }
      });

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
  }, [speed, pantographHeight, isSparking, brakeTemp, motorTemp, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

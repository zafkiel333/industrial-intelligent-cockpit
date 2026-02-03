
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotorUnbalanceProps } from './three-types';

export const RotorUnbalanceScene: React.FC<RotorUnbalanceProps> = ({ 
  rpm, 
  vibrationAmp, 
  phaseAngle, 
  heavySpotAngle,
  showVectors = true,
  showOrbit = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rotorGroupRef = useRef<THREE.Group | null>(null);
  const vectorGroupRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false; // We rotate the object, not camera
    
    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    scene.add(hemiLight);
    
    const spotLight = new THREE.SpotLight(0xffaa00, 2);
    spotLight.position.set(10, 20, 10);
    spotLight.lookAt(0,0,0);
    scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x00aaff, 1, 20);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    // --- Geometry: Rotor ---
    const rotorGroup = new THREE.Group();
    rotorGroupRef.current = rotorGroup;
    scene.add(rotorGroup);

    // Spider / Hub
    const spiderGeo = new THREE.CylinderGeometry(2, 2, 1, 8);
    const spiderMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
    const spider = new THREE.Mesh(spiderGeo, spiderMat);
    rotorGroup.add(spider);

    // Arms
    for(let i=0; i<8; i++) {
        const armGeo = new THREE.BoxGeometry(0.5, 0.5, 3.5);
        const arm = new THREE.Mesh(armGeo, spiderMat);
        arm.rotation.y = (i/8) * Math.PI * 2;
        arm.position.x = Math.sin((i/8) * Math.PI * 2) * 2;
        arm.position.z = Math.cos((i/8) * Math.PI * 2) * 2;
        rotorGroup.add(arm);
    }

    // Rim
    const rimGeo = new THREE.CylinderGeometry(4, 4, 1.2, 64, 1, true);
    const rimMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.5, 
        roughness: 0.6,
        side: THREE.DoubleSide
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rotorGroup.add(rim);

    // Poles
    const poleCount = 16;
    for(let i=0; i<poleCount; i++) {
        const angle = (i / poleCount) * Math.PI * 2;
        const poleGeo = new THREE.BoxGeometry(0.8, 1.4, 0.4);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xb45309 }); // Copper
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(Math.cos(angle)*4.2, 0, Math.sin(angle)*4.2);
        pole.rotation.y = -angle;
        rotorGroup.add(pole);
    }

    // --- Vectors Group (Stationary relative to rotor local coord, but visually we might want global) ---
    // Actually, Heavy Spot rotates WITH rotor. High Spot (response) phase lag is relative to Heavy Spot.
    
    // Unbalance Mass Marker (Red Sphere embedded)
    const massGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const massMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const massMarker = new THREE.Mesh(massGeo, massMat);
    // Position will be updated in animation loop based on heavySpotAngle
    massMarker.name = "HeavySpot";
    rotorGroup.add(massMarker); 

    // --- Orbit Visualization (Stationary Frame) ---
    if (showOrbit) {
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
            const th = (i / 64) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(Math.cos(th)*0.1, 0, Math.sin(th)*0.1));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        orbitLine.rotation.x = Math.PI / 2; // Flat on XZ plane initially? No, Cylinder is Y-up.
        // Actually rotor is Y-up. Orbit represents shaft center movement on XZ plane.
        orbitLine.position.y = 2.5; // Above rotor
        scene.add(orbitLine);
        orbitLineRef.current = orbitLine;
    }

    // --- Reference Grid ---
    const gridHelper = new THREE.PolarGridHelper(8, 8, 8, 64, 0x333333, 0x111111);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      if (rotorGroupRef.current) {
          // Rotation
          const speedRad = (rpm / 60) * Math.PI * 2 * 0.016; 
          rotorGroupRef.current.rotation.y -= speedRad;

          // Wobble / Unbalance Simulation
          // The rotor center actually moves in an orbit.
          const time = Date.now() * 0.001;
          const orbitRadius = vibrationAmp * 0.02; // Scale for visual
          
          // Shaft centerline movement (1X frequency)
          // The vibration lags the heavy spot by phaseAngle
          // Current Rotor Angle = rotation
          const currentRot = rotorGroupRef.current.rotation.y;
          
          // Vibration position (Orbit)
          const vibX = Math.cos(currentRot - phaseAngle * Math.PI/180) * orbitRadius;
          const vibZ = Math.sin(currentRot - phaseAngle * Math.PI/180) * orbitRadius;
          
          rotorGroupRef.current.position.set(vibX, 0, vibZ);

          // Update Heavy Spot Marker Position relative to local rotation
          const heavySpotObj = rotorGroupRef.current.getObjectByName("HeavySpot");
          if (heavySpotObj) {
              const hRad = heavySpotAngle * Math.PI / 180;
              heavySpotObj.position.set(Math.cos(hRad)*4, 0.6, Math.sin(hRad)*4);
          }

          // Update Orbit Trail Scale
          if (orbitLineRef.current) {
              const s = orbitRadius * 20; // Scale up orbit line to match the movement
              orbitLineRef.current.scale.set(s, s, s);
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
  }, [rpm, vibrationAmp, phaseAngle, heavySpotAngle, showVectors, showOrbit]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

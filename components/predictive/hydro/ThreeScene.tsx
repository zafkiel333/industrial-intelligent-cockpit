
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroSceneProps } from './three-types';

export const HydroThreeScene: React.FC<HydroSceneProps> = ({ 
  activePart = 'all', 
  rotationSpeed = 1.0,
  vibrationLevel = 0,
  heatLevel = 0,
  onPartClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partsRef = useRef<{[key: string]: THREE.Mesh | THREE.Group}>({});

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x050a14, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x0ea5e9, 2, 20);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const rimLight = new THREE.SpotLight(0xf43f5e, 5);
    rimLight.position.set(-5, 0, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const copperMat = new THREE.MeshStandardMaterial({ 
      color: 0xb45309, 
      metalness: 0.6, 
      roughness: 0.3 
    });

    const activeMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // --- Geometry Construction ---

    // 1. Stator (Frame)
    const statorGeo = new THREE.CylinderGeometry(3, 3, 2, 32, 1, true);
    const stator = new THREE.Mesh(statorGeo, new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, metalness: 0.5, roughness: 0.5, wireframe: true 
    }));
    stator.position.y = 1;
    partsRef.current['stator'] = stator;
    group.add(stator);

    // Stator Coils (Visual)
    const coilGeo = new THREE.TorusGeometry(2.8, 0.1, 8, 32);
    coilGeo.rotateX(Math.PI / 2);
    const coilUpper = new THREE.Mesh(coilGeo, copperMat);
    coilUpper.position.y = 2;
    group.add(coilUpper);
    const coilLower = new THREE.Mesh(coilGeo, copperMat);
    coilLower.position.y = 0;
    group.add(coilLower);

    // 2. Rotor (Rotating Part)
    const rotorGroup = new THREE.Group();
    partsRef.current['rotor'] = rotorGroup;
    group.add(rotorGroup);

    const rotorCoreGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.8, 16);
    const rotorCore = new THREE.Mesh(rotorCoreGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    rotorCore.position.y = 1;
    rotorGroup.add(rotorCore);

    // Poles
    for(let i=0; i<12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const poleGeo = new THREE.BoxGeometry(0.5, 1.8, 0.2);
        const pole = new THREE.Mesh(poleGeo, copperMat);
        pole.position.set(Math.cos(angle)*2.6, 1, Math.sin(angle)*2.6);
        pole.rotation.y = -angle;
        rotorGroup.add(pole);
    }

    // 3. Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 16);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    shaft.position.y = -1;
    partsRef.current['shaft'] = shaft;
    rotorGroup.add(shaft);

    // 4. Thrust Bearing
    const bearingGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
    const bearing = new THREE.Mesh(bearingGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
    bearing.position.y = -0.5;
    partsRef.current['bearing'] = bearing;
    group.add(bearing);

    // 5. Turbine Runner (Francis type simplified)
    const runnerGroup = new THREE.Group();
    runnerGroup.position.y = -3;
    partsRef.current['turbine'] = runnerGroup;
    rotorGroup.add(runnerGroup); // Attached to rotor

    const runnerHubGeo = new THREE.CylinderGeometry(1.5, 0.5, 1.5, 16);
    const runnerHub = new THREE.Mesh(runnerHubGeo, steelMat);
    runnerGroup.add(runnerHub);

    // Blades
    for(let i=0; i<9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const bladeGeo = new THREE.BoxGeometry(1.5, 1.2, 0.1);
        // Twist blade
        const positions = bladeGeo.attributes.position.array;
        // Simple manual distortion for look
        const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        blade.position.set(Math.cos(angle)*1.2, 0, Math.sin(angle)*1.2);
        blade.rotation.y = -angle + 0.5;
        blade.rotation.x = 0.2;
        runnerGroup.add(blade);
    }

    // Volute (Spiral Case) - Wireframe
    const volutePoints = [];
    for(let i=0; i<=100; i++) {
        const t = i/100 * Math.PI * 2.5;
        const r = 2.5 + t * 0.5;
        volutePoints.push(new THREE.Vector3(Math.cos(t)*r, -2.5, Math.sin(t)*r));
    }
    const volutePath = new THREE.CatmullRomCurve3(volutePoints);
    const voluteGeo = new THREE.TubeGeometry(volutePath, 64, 0.8, 8, false);
    const volute = new THREE.Mesh(voluteGeo, new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 
    }));
    group.add(volute);


    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // Rotation based on props
      if (rotorGroup) {
          rotorGroup.rotation.y -= 0.02 * rotationSpeed;
      }

      // Vibration Effect
      if (vibrationLevel > 0 && groupRef.current) {
          groupRef.current.position.x = (Math.random() - 0.5) * 0.02 * vibrationLevel;
          groupRef.current.position.z = (Math.random() - 0.5) * 0.02 * vibrationLevel;
      }

      // Heat Effect (Pulse color)
      if (heatLevel > 0) {
          const intensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;
          rimLight.intensity = 5 + intensity * 5 * heatLevel;
          rimLight.color.setHSL(0, 1, 0.5); // Red
      } else {
          rimLight.color.setHex(0x0ea5e9); // Blue default
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && sceneRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [rotationSpeed, vibrationLevel, heatLevel]); // Re-init not ideal for perf, but okay for prototype props update handling could be refined

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GovernorSceneProps } from './three-types';

export const GovernorHydraulicScene: React.FC<GovernorSceneProps> = ({ 
  systemPressure,
  tankLevel,
  oilTemp,
  pumpA_State,
  pumpB_State,
  accumulatorLevel,
  servoPosition
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const fluidRef = useRef<THREE.Mesh | null>(null);
  const accuPistonRef = useRef<THREE.Group | null>(null);
  const pumpARef = useRef<THREE.Group | null>(null);
  const pumpBRef = useRef<THREE.Group | null>(null);
  const servoRodRef = useRef<THREE.Mesh | null>(null);
  const pipesRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0f18, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.target.set(0, 2, 0);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x0ea5e9, 2, 20); // Cyan light
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const warmLight = new THREE.PointLight(0xf59e0b, 1, 20); // Amber for machinery
    warmLight.position.set(-5, 5, -5);
    scene.add(warmLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.8, roughness: 0.3 
    });
    
    const tankGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b, // Amber oil
      metalness: 0.2,
      roughness: 0.2,
      transmission: 0.4,
      transparent: true,
      opacity: 0.8,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2
    });

    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.5 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.5 });

    const group = new THREE.Group();
    scene.add(group);

    // --- Geometry: HPU (Hydraulic Power Unit) ---

    // 1. Oil Tank (Base)
    const tankGeo = new THREE.BoxGeometry(8, 2.5, 5);
    const tank = new THREE.Mesh(tankGeo, tankGlassMat);
    tank.position.y = 1.25;
    group.add(tank);

    // Oil Fluid inside tank
    const fluidGeo = new THREE.BoxGeometry(7.8, 2.3, 4.8);
    // Translate fluid so scaling Y happens from bottom
    fluidGeo.translate(0, 1.15, 0); 
    const fluid = new THREE.Mesh(fluidGeo, oilMat);
    fluid.position.y = 0.1;
    fluidRef.current = fluid;
    group.add(fluid);

    // 2. Motor-Pump Groups (Vertical)
    const createPump = (x: number, z: number, label: string) => {
        const pumpGroup = new THREE.Group();
        pumpGroup.position.set(x, 2.5, z);
        
        // Motor
        const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32);
        const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
        motor.position.y = 1.5;
        pumpGroup.add(motor);
        
        // Cooling fins
        const finGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.0, 16, 1, true);
        const fin = new THREE.Mesh(finGeo, new THREE.MeshBasicMaterial({color: 0x334155, wireframe: true}));
        fin.position.y = 1.5;
        pumpGroup.add(fin);

        // Pump Base
        const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.8, 32);
        const base = new THREE.Mesh(baseGeo, steelMat);
        base.position.y = 0.4;
        pumpGroup.add(base);

        // Status Light
        const lightGeo = new THREE.SphereGeometry(0.15);
        const light = new THREE.Mesh(lightGeo, steelMat); // Color updated in animation
        light.position.set(0, 2.4, 0.8);
        light.name = "statusLight";
        pumpGroup.add(light);

        group.add(pumpGroup);
        return pumpGroup;
    };

    pumpARef.current = createPump(-2, 1, 'P1');
    pumpBRef.current = createPump(0, 1, 'P2');

    // 3. Accumulator Bank (Vertical Cylinders)
    const accuGroup = new THREE.Group();
    accuGroup.position.set(2.5, 2.5, -1);
    group.add(accuGroup);
    
    // Main Accumulator Body
    const accuBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
    const accuBody = new THREE.Mesh(accuBodyGeo, new THREE.MeshStandardMaterial({color: 0xb91c1c, metalness: 0.4, roughness: 0.3}));
    accuBody.position.y = 2.5;
    accuGroup.add(accuBody);

    // Indicator / Piston visual (External scale)
    const pistonGroup = new THREE.Group();
    pistonGroup.position.set(1, 0, 0); // Side indicator
    accuGroup.add(pistonGroup);
    accuPistonRef.current = pistonGroup;

    const scaleBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 0.1), steelMat);
    scaleBar.position.y = 2.5;
    pistonGroup.add(scaleBar);
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), redMat);
    marker.name = "marker";
    pistonGroup.add(marker);

    // 4. Servomotor (Actuator) - Represented slightly detached
    const servoGroup = new THREE.Group();
    servoGroup.position.set(-4, 2, -3);
    group.add(servoGroup);

    const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    cylGeo.rotateZ(Math.PI/2);
    const cylinder = new THREE.Mesh(cylGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    servoGroup.add(cylinder);

    const rodGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 32);
    rodGeo.rotateZ(Math.PI/2);
    const rod = new THREE.Mesh(rodGeo, new THREE.MeshStandardMaterial({color: 0xc0c0c0, metalness: 0.9, roughness: 0.1}));
    rod.position.x = 2;
    servoRodRef.current = rod;
    servoGroup.add(rod);

    // 5. Piping (Simplified connection mesh)
    // Connect Pumps to Accumulator to Servo
    // ... Simplified tubes
    
    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Fluid Dynamics Visuals
      if (fluidRef.current) {
          // Scale fluid Y based on tankLevel (0-100)
          // Base height is 2.3. Scale 0 to 1.
          const scaleY = Math.max(0.1, tankLevel / 100);
          fluidRef.current.scale.y = scaleY;
          // Bubbling effect on top surface if pumps running
          if (pumpA_State === 'running' || pumpB_State === 'running') {
             // Subtle jitter
          }
      }

      // 2. Pump Status Lights
      const updatePump = (ref: React.MutableRefObject<THREE.Group | null>, state: string) => {
          if (ref.current) {
              const light = ref.current.getObjectByName('statusLight') as THREE.Mesh;
              if (light) {
                  if (state === 'running') {
                      (light.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e);
                      (light.material as THREE.MeshStandardMaterial).emissive.setHex(0x22c55e);
                      // Vibration
                      ref.current.position.x += Math.sin(time * 50) * 0.002;
                  } else if (state === 'fault') {
                      (light.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
                      (light.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
                      // Blink
                      (light.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(time * 10) > 0 ? 1 : 0;
                  } else {
                      (light.material as THREE.MeshStandardMaterial).color.setHex(0x64748b);
                      (light.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                  }
              }
          }
      };
      updatePump(pumpARef, pumpA_State);
      updatePump(pumpBRef, pumpB_State);

      // 3. Accumulator Level
      if (accuPistonRef.current) {
          const marker = accuPistonRef.current.getObjectByName('marker');
          if (marker) {
              // Map 0-100 to height 0.5 to 4.5
              const y = 0.5 + (accumulatorLevel / 100) * 4.0;
              marker.position.y = y;
          }
      }

      // 4. Servo Actuation
      if (servoRodRef.current) {
          // Map 0-100 to extension X 2.0 to 4.0
          // servoPosition 0% = retracted (x=2), 100% = extended (x=4) - simplified visual
          const x = 2.0 + (servoPosition / 100) * 1.5;
          servoRodRef.current.position.x = x;
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
  }, [systemPressure, tankLevel, oilTemp, pumpA_State, pumpB_State, accumulatorLevel, servoPosition]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

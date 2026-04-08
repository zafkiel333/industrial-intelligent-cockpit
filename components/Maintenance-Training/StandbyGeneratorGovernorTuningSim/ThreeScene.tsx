import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GovernorState } from './three-types';

interface ThreeSceneProps {
  state: GovernorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GovernorState>(state);
  const flywheelRef = useRef<THREE.Mesh | null>(null);
  const actuatorRodRef = useRef<THREE.Mesh | null>(null);
  const fuelRackRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Engine Block (Simplified)
    const engineGeo = new THREE.BoxGeometry(3, 2, 2);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(-1, 0, 0);
    scene.add(engine);

    // Flywheel
    const flywheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32);
    const flywheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const flywheel = new THREE.Mesh(flywheelGeo, flywheelMat);
    flywheel.rotation.x = Math.PI / 2;
    flywheel.position.set(1, 0, 0);
    scene.add(flywheel);
    flywheelRef.current = flywheel;

    // Add some details to flywheel to see rotation
    const dotGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.42, 16);
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(0.8, 0, 0);
    flywheel.add(dot);

    // Electronic Governor Actuator
    const actuatorGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
    actuator.position.set(-1, 1.5, 0);
    scene.add(actuator);

    // Actuator Arm/Rod
    const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 1 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(-0.5, 1.5, 0); // Base position
    scene.add(rod);
    actuatorRodRef.current = rod;

    // Fuel Injection Pump Rack (Simplified)
    const rackGeo = new THREE.BoxGeometry(1, 0.2, 0.2);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0xb45309 }); // Brass/Copper
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0.5, 1.5, 0);
    scene.add(rack);
    fuelRackRef.current = rack;

    // Linkage connecting rod to rack
    const linkGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const link = new THREE.Mesh(linkGeo, linkMat);
    link.position.set(0, 1.5, 0);
    scene.add(link);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate Flywheel based on engine speed (RPM -> rad/frame)
      // 1500 RPM = 25 rev/sec = 157 rad/sec. At 60fps, ~2.6 rad/frame
      if (flywheelRef.current && currentState.isEngineRunning) {
          const rotationSpeed = (currentState.engineSpeed / 60) * Math.PI * 2 * (1/60);
          flywheelRef.current.rotation.y += rotationSpeed; // Cylinder is rotated X, so Y is the rolling axis
      }

      // Move Actuator Rod and Fuel Rack based on actuator position (0-100%)
      // Map 0-100% to visual X position
      const visualTravel = 0.5; // Total movement range
      const offset = (currentState.actuatorPosition / 100) * visualTravel;

      if (actuatorRodRef.current && fuelRackRef.current) {
          // Rod extends out of actuator
          actuatorRodRef.current.position.x = -0.5 + offset / 2;
          actuatorRodRef.current.scale.y = 1 + offset; // Stretch rod slightly to simulate extension
          
          // Rack moves linearly
          fuelRackRef.current.position.x = 0.5 + offset;
          
          // Link moves with them
          link.position.x = offset;
      }

      // Add visual vibration if hunting
      if (currentState.huntingAmplitude > 10 && currentState.isEngineRunning) {
          const vibration = (Math.random() - 0.5) * (currentState.huntingAmplitude / 1000);
          engine.position.y = vibration;
          actuator.position.y = 1.5 + vibration;
      } else {
          engine.position.y = 0;
          actuator.position.y = 1.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

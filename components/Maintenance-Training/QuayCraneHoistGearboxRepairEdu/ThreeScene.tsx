import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GearboxState } from './three-types';

interface ThreeSceneProps {
  state: GearboxState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GearboxState>(state);

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
    camera.position.set(0, 8, 15);
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

    // Gearbox Lower Casing
    const lowerCasingGeo = new THREE.BoxGeometry(8, 3, 6);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const lowerCasing = new THREE.Mesh(lowerCasingGeo, casingMat);
    lowerCasing.position.y = -1.5;
    scene.add(lowerCasing);

    // Gearbox Upper Cover
    const upperCoverGeo = new THREE.BoxGeometry(8, 2, 6);
    const upperCover = new THREE.Mesh(upperCoverGeo, casingMat);
    upperCover.position.y = 1;
    scene.add(upperCover);

    // High-Speed Shaft Assembly
    const hsShaftGroup = new THREE.Group();
    hsShaftGroup.position.set(0, 0, 1.5);

    const hsShaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 7, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const hsShaft = new THREE.Mesh(hsShaftGeo, shaftMat);
    hsShaft.rotation.z = Math.PI / 2;
    hsShaftGroup.add(hsShaft);

    // High-Speed Pinion Gear
    const pinionGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pinion = new THREE.Mesh(pinionGeo, gearMat);
    pinion.rotation.z = Math.PI / 2;
    hsShaftGroup.add(pinion);

    // Bearings
    const bearingGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7 }); // Brass/Gold color for visibility
    const bearing1 = new THREE.Mesh(bearingGeo, bearingMat);
    bearing1.position.set(2.5, 0, 0);
    bearing1.rotation.z = Math.PI / 2;
    hsShaftGroup.add(bearing1);
    
    const bearing2 = new THREE.Mesh(bearingGeo, bearingMat);
    bearing2.position.set(-2.5, 0, 0);
    bearing2.rotation.z = Math.PI / 2;
    hsShaftGroup.add(bearing2);

    scene.add(hsShaftGroup);

    // Low-Speed Gear (Large)
    const lsGearGroup = new THREE.Group();
    lsGearGroup.position.set(0, 0, -1.5);
    
    const lsGearGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.5, 32);
    const lsGear = new THREE.Mesh(lsGearGeo, gearMat);
    lsGear.rotation.z = Math.PI / 2;
    lsGearGroup.add(lsGear);

    const lsShaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 32);
    const lsShaft = new THREE.Mesh(lsShaftGeo, shaftMat);
    lsShaft.rotation.z = Math.PI / 2;
    lsGearGroup.add(lsShaft);

    scene.add(lsGearGroup);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Running Animation
      if (currentState.isRunning && currentState.step === 0) {
        hsShaftGroup.rotation.x += 0.1; // Fast rotation
        lsGearGroup.rotation.x -= 0.03; // Slow rotation (gear ratio)
      }

      // Disassembly Animation based on step
      if (currentState.step === 0) {
        upperCover.position.y = THREE.MathUtils.lerp(upperCover.position.y, 1, 0.1);
        hsShaftGroup.position.y = THREE.MathUtils.lerp(hsShaftGroup.position.y, 0, 0.1);
        hsShaftGroup.position.z = THREE.MathUtils.lerp(hsShaftGroup.position.z, 1.5, 0.1);
      } else if (currentState.step === 1) {
        // Open Cover
        upperCover.position.y = THREE.MathUtils.lerp(upperCover.position.y, 5, 0.05);
        hsShaftGroup.position.y = THREE.MathUtils.lerp(hsShaftGroup.position.y, 0, 0.1);
        hsShaftGroup.position.z = THREE.MathUtils.lerp(hsShaftGroup.position.z, 1.5, 0.1);
      } else if (currentState.step === 2) {
        // Remove High-Speed Shaft
        upperCover.position.y = 5;
        hsShaftGroup.position.y = THREE.MathUtils.lerp(hsShaftGroup.position.y, 4, 0.05);
        hsShaftGroup.position.z = THREE.MathUtils.lerp(hsShaftGroup.position.z, 1.5, 0.1);
      } else if (currentState.step === 3) {
        // Inspect Bearings (Move shaft closer to camera)
        upperCover.position.y = 5;
        hsShaftGroup.position.y = THREE.MathUtils.lerp(hsShaftGroup.position.y, 4, 0.05);
        hsShaftGroup.position.z = THREE.MathUtils.lerp(hsShaftGroup.position.z, 5, 0.05);
        hsShaftGroup.rotation.x += 0.01; // Slowly rotate for inspection
      }

      // Slowly rotate scene
      if (currentState.step < 3) {
        scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;
      } else {
        scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, 0, 0.05);
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

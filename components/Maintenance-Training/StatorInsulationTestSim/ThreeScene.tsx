import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InsulationState } from './three-types';

interface ThreeSceneProps {
  state: InsulationState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<InsulationState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x3b82f6, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Stator Core
    const statorGeo = new THREE.TorusGeometry(4, 1, 32, 64);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.x = Math.PI / 2;
    scene.add(stator);

    // Coils
    const coilsGroup = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const coilGeo = new THREE.BoxGeometry(1.2, 0.5, 2.5);
      const coilMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.3, roughness: 0.7 }); // Copper-ish
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.x = Math.cos(angle) * 4;
      coil.position.z = Math.sin(angle) * 4;
      coil.rotation.y = -angle;
      coilsGroup.add(coil);
    }
    scene.add(coilsGroup);

    // Test Probe
    const probeGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.rotation.x = Math.PI / 2;
    scene.add(probe);

    // Spark effect
    const sparkGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0 });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    scene.add(spark);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update probe position
      probe.position.set(currentState.probePosition.x, currentState.probePosition.y, currentState.probePosition.z);
      
      // Spark effect when testing
      if (currentState.isTesting) {
        spark.position.copy(probe.position);
        spark.position.z -= 1; // Move to tip
        sparkMat.opacity = Math.random() * 0.8 + 0.2;
        spark.scale.setScalar(Math.random() * 1.5 + 0.5);
      } else {
        sparkMat.opacity = 0;
      }

      // Rotate stator slowly
      stator.rotation.z += 0.002;
      coilsGroup.rotation.y += 0.002;

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

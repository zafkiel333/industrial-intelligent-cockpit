import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WheelState } from './three-types';

interface ThreeSceneProps {
  state: WheelState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WheelState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1b4b'); // indigo-950

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Assembly Parts
    const parts = {
      axle: new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
      ),
      motor: new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 4, 32),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.7 }) // Blue motor
      ),
      gearbox: new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 2, 32),
        new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 }) // Yellow gearbox
      ),
      rim: new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 3, 32),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, wireframe: true })
      ),
      tire: new THREE.Mesh(
        new THREE.TorusGeometry(5, 1.5, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }) // Black tire
      )
    };

    // Initial setup (all parts rotated to face camera properly)
    Object.values(parts).forEach(part => {
      part.rotation.x = Math.PI / 2;
      scene.add(part);
    });

    // Target positions for each step
    // Step 0: Exploded view
    // Step 1: Axle + Motor
    // Step 2: + Gearbox
    // Step 3: + Rim
    // Step 4: + Tire (Fully assembled)

    const getTargetZ = (partName: string, step: number) => {
      if (step === 0) {
        // Exploded
        if (partName === 'axle') return -8;
        if (partName === 'motor') return -4;
        if (partName === 'gearbox') return 0;
        if (partName === 'rim') return 4;
        if (partName === 'tire') return 8;
      } else {
        // Assembled positions
        if (partName === 'axle') return 0;
        if (partName === 'motor') return step >= 1 ? 0 : -10;
        if (partName === 'gearbox') return step >= 2 ? 0 : -15;
        if (partName === 'rim') return step >= 3 ? 0 : -20;
        if (partName === 'tire') return step >= 4 ? 0 : -25;
      }
      return 0;
    };

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Animate parts to their target positions
      Object.keys(parts).forEach(key => {
        const part = parts[key as keyof typeof parts];
        const targetZ = getTargetZ(key, currentState.step);
        part.position.z = THREE.MathUtils.lerp(part.position.z, targetZ, 0.05);
      });

      // Rotate the whole assembly slowly
      scene.rotation.y += 0.002;
      scene.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;

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

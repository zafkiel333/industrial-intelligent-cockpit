import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DryingState } from './three-types';

interface ThreeSceneProps {
  state: DryingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<DryingState>(state);

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
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Drying Oven
    const ovenGeo = new THREE.BoxGeometry(8, 6, 6);
    const ovenMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.2, wireframe: true });
    const oven = new THREE.Mesh(ovenGeo, ovenMat);
    scene.add(oven);

    // Motor Stator (Inside oven)
    const statorGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6, roughness: 0.4 }); // Copper color
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.z = Math.PI / 2;
    scene.add(stator);

    // Heating Coils (Visual indicator of heat)
    const coilGeo = new THREE.TorusGeometry(2.5, 0.1, 16, 32);
    const coilMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const coils: THREE.Mesh[] = [];
    for (let i = -2; i <= 2; i += 2) {
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.x = i;
      coil.rotation.y = Math.PI / 2;
      scene.add(coil);
      coils.push(coil);
    }

    // Moisture Particles (Steam)
    const steamGeo = new THREE.BufferGeometry();
    const steamCount = 200;
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount * 3; i++) {
      steamPos[i] = (Math.random() - 0.5) * 4;
      steamPos[i + 1] = (Math.random() - 0.5) * 2;
      steamPos[i + 2] = (Math.random() - 0.5) * 2;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.2, transparent: true, opacity: 0.5 });
    const steam = new THREE.Points(steamGeo, steamMat);
    scene.add(steam);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Heating Coils Color based on temperature
      const tempRatio = (currentState.temperature - 20) / 100; // 0 to 1
      const heatColor = new THREE.Color(0x334155).lerp(new THREE.Color(0xef4444), tempRatio);
      coilMat.color = heatColor;

      // Steam Animation based on moisture and heat
      if (currentState.moisture > 0 && currentState.temperature > 40) {
        steam.visible = true;
        // Opacity based on remaining moisture
        steamMat.opacity = (currentState.moisture / 100) * 0.5;
        
        const positions = steamGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < steamCount; i++) {
          positions[i * 3 + 1] += 0.05 + Math.random() * 0.05; // Move up
          if (positions[i * 3 + 1] > 3) {
            // Reset to bottom
            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = -2 + Math.random();
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
          }
        }
        steamGeo.attributes.position.needsUpdate = true;
      } else {
        steam.visible = false;
      }

      // Slowly rotate scene
      scene.rotation.y += 0.005;

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

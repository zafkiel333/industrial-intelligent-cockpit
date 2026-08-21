import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PumpState } from './three-types';

interface ThreeSceneProps {
  state: PumpState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PumpState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Pump Parts
    const parts: { mesh: THREE.Mesh | THREE.Group, baseZ: number, explodedZ: number, stepZ: number[] }[] = [];

    // 1. Motor/Shaft (Base, stays fixed mostly)
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    scene.add(shaft);
    parts.push({ mesh: shaft, baseZ: 0, explodedZ: 0, stepZ: [0, 0, 0, 0, 0, 0] });

    // 2. Coupling
    const couplingGeo = new THREE.CylinderGeometry(1.5, 1.5, 1, 32);
    const couplingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.5 });
    const coupling = new THREE.Mesh(couplingGeo, couplingMat);
    coupling.rotation.x = Math.PI / 2;
    scene.add(coupling);
    // Step 0: attached, Step 1+: removed (moved back)
    parts.push({ mesh: coupling, baseZ: -2, explodedZ: -4, stepZ: [-2, -6, -6, -6, -6, -2] });

    // 3. Pump Cover
    const coverGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.7 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.rotation.x = Math.PI / 2;
    scene.add(cover);
    // Step 0-1: attached, Step 2+: removed
    parts.push({ mesh: cover, baseZ: 1, explodedZ: 3, stepZ: [1, 1, 5, 5, 5, 1] });

    // 4. Mechanical Seal (Old / New)
    const sealGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.1, roughness: 0.9 }); // Black rubber/carbon
    const seal = new THREE.Mesh(sealGeo, sealMat);
    scene.add(seal);
    // Step 0-2: attached, Step 3: removed, Step 4: new installed
    parts.push({ mesh: seal, baseZ: 1.5, explodedZ: 5, stepZ: [1.5, 1.5, 1.5, 8, 1.5, 1.5] });

    // 5. Impeller / Casing
    const casingGeo = new THREE.CylinderGeometry(3, 3, 2, 32);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.3, roughness: 0.8 });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    scene.add(casing);
    parts.push({ mesh: casing, baseZ: 3, explodedZ: 8, stepZ: [3, 3, 3, 3, 3, 3] });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate scene slightly for better 3D feel
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;
      scene.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;

      // Update part positions based on state
      parts.forEach((part, index) => {
        let targetZ = part.baseZ;

        if (currentState.isExploded) {
          targetZ = part.explodedZ;
        } else {
          targetZ = part.stepZ[currentState.step];
        }

        // Smooth transition
        part.mesh.position.z += (targetZ - part.mesh.position.z) * 0.1;

        // Highlight active part
        if (part.mesh.material instanceof THREE.MeshStandardMaterial) {
          if (!currentState.isExploded) {
            if ((currentState.step === 1 && index === 1) || // Coupling
                (currentState.step === 2 && index === 2) || // Cover
                (currentState.step === 3 && index === 3) || // Old Seal
                (currentState.step === 4 && index === 3)) { // New Seal
              part.mesh.material.emissive.setHex(0x0ea5e9);
              part.mesh.material.emissiveIntensity = 0.5;
            } else {
              part.mesh.material.emissive.setHex(0x000000);
            }
          } else {
            part.mesh.material.emissive.setHex(0x000000);
          }
        }
      });

      // Change seal color in step 4 to indicate "new"
      if (currentState.step >= 4) {
        sealMat.color.setHex(0x10b981); // Greenish for new
      } else {
        sealMat.color.setHex(0x000000); // Black for old
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

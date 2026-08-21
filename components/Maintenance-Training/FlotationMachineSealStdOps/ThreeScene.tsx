import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SealState } from './three-types';

interface ThreeSceneProps {
  state: SealState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SealState>(state);

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

    // Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 10, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    scene.add(shaft);

    // Bearing Housing (Lower part)
    const housingGeo = new THREE.CylinderGeometry(2.5, 2.5, 3, 32);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.y = -2;
    scene.add(housing);

    // Seal Cover (Upper part to be removed)
    const coverGeo = new THREE.CylinderGeometry(2.5, 2.5, 1, 32);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.y = 0;
    scene.add(cover);

    // Old Seal (Worn, dark)
    const oldSealGeo = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
    const oldSealMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const oldSeal = new THREE.Mesh(oldSealGeo, oldSealMat);
    oldSeal.rotation.x = Math.PI / 2;
    oldSeal.position.y = -0.4;
    scene.add(oldSeal);

    // New Seal (Clean, bright)
    const newSealGeo = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
    const newSealMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Blue polyurethane seal
    const newSeal = new THREE.Mesh(newSealGeo, newSealMat);
    newSeal.rotation.x = Math.PI / 2;
    newSeal.position.set(5, 5, 0); // Initially off-screen
    scene.add(newSeal);

    // Cleaning Spray (Particles)
    const sprayGeo = new THREE.BufferGeometry();
    const sprayCount = 100;
    const sprayPos = new Float32Array(sprayCount * 3);
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    const sprayMat = new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.1, transparent: true, opacity: 0.6 });
    const spray = new THREE.Points(sprayGeo, sprayMat);
    spray.visible = false;
    scene.add(spray);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Animation logic based on step
      if (currentState.step === 0) {
        // Normal
        cover.position.y = THREE.MathUtils.lerp(cover.position.y, 0, 0.1);
        oldSeal.position.y = THREE.MathUtils.lerp(oldSeal.position.y, -0.4, 0.1);
        shaft.rotation.y += 0.05; // Running
      } else {
        shaft.rotation.y = 0; // Stopped
        
        if (currentState.step === 1) {
          // Disassemble cover
          cover.position.y = THREE.MathUtils.lerp(cover.position.y, 4, 0.05);
        } else if (currentState.step === 2) {
          // Remove old seal
          cover.position.y = 4;
          oldSeal.position.y = THREE.MathUtils.lerp(oldSeal.position.y, 5, 0.05);
          oldSeal.position.x = THREE.MathUtils.lerp(oldSeal.position.x, -5, 0.05);
        } else if (currentState.step === 3) {
          // Clean
          oldSeal.visible = false;
          spray.visible = true;
          const positions = sprayGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < sprayCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 1] = -0.5 + (Math.random() - 0.5) * 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
          }
          sprayGeo.attributes.position.needsUpdate = true;
        } else if (currentState.step === 4) {
          // Install new seal
          spray.visible = false;
          newSeal.position.x = THREE.MathUtils.lerp(newSeal.position.x, 0, 0.05);
          newSeal.position.y = THREE.MathUtils.lerp(newSeal.position.y, -0.4, 0.05);
        } else if (currentState.step === 5) {
          // Reassemble
          newSeal.position.set(0, -0.4, 0);
          cover.position.y = THREE.MathUtils.lerp(cover.position.y, 0, 0.05);
        }
      }

      // Slowly rotate scene
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

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

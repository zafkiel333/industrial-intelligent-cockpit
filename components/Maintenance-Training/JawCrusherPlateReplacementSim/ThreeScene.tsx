import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CrusherState } from './three-types';

interface ThreeSceneProps {
  state: CrusherState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CrusherState>(state);

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
    camera.position.set(10, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Crusher Frame
    const frameGeo = new THREE.BoxGeometry(6, 8, 6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x292524, transparent: true, opacity: 0.3, wireframe: true });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    scene.add(frame);

    // Fixed Jaw Plate
    const fixedPlateGeo = new THREE.BoxGeometry(1, 6, 4);
    const fixedPlateMat = new THREE.MeshStandardMaterial({ color: 0x57534e, metalness: 0.6 });
    const fixedPlate = new THREE.Mesh(fixedPlateGeo, fixedPlateMat);
    fixedPlate.position.set(-2, 0, 0);
    fixedPlate.rotation.z = -Math.PI / 12; // Tilted
    scene.add(fixedPlate);

    // Movable Jaw Plate Group
    const movableGroup = new THREE.Group();
    movableGroup.position.set(1, 0, 0);
    
    // The plate itself
    const movablePlateGeo = new THREE.BoxGeometry(1, 6, 4);
    // Use a custom material to simulate wear (bottom part worn out)
    const movablePlateMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, metalness: 0.8 });
    const movablePlate = new THREE.Mesh(movablePlateGeo, movablePlateMat);
    movableGroup.add(movablePlate);

    // Bolts
    const boltGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const bolts: THREE.Mesh[] = [];
    
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(0.5, i * 2.5, j * 1.5);
        movableGroup.add(bolt);
        bolts.push(bolt);
      }
    }

    scene.add(movableGroup);

    let animationFrameId: number;
    let flipAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Wear visualization (color change on the bottom half)
      if (currentState.step === 0 || currentState.step === 1) {
        const wearColor = new THREE.Color(0xa8a29e).lerp(new THREE.Color(0x7f1d1d), currentState.wearLevel / 100);
        movablePlateMat.color = wearColor;
      } else if (currentState.step >= 3) {
        // After flipping, the worn part is at the top, but let's just reset color for simplicity or show it flipped
        movablePlateMat.color = new THREE.Color(0xa8a29e); // Looks new at the bottom
      }

      // Animation logic based on steps
      if (currentState.step === 0) {
        // Normal operation - swinging
        movableGroup.rotation.z = Math.PI / 12 + Math.sin(Date.now() * 0.01) * 0.05;
        movableGroup.position.x = 1;
        bolts.forEach(b => b.position.x = 0.5);
      } else {
        // Maintenance mode - stop swinging
        movableGroup.rotation.z = THREE.MathUtils.lerp(movableGroup.rotation.z, Math.PI / 12, 0.1);
        
        if (currentState.step === 1) {
          // Unbolting - bolts move out
          bolts.forEach(b => b.position.x = THREE.MathUtils.lerp(b.position.x, 2, 0.1));
        } else if (currentState.step === 2) {
          // Flipping - plate moves out and rotates 180 degrees
          movableGroup.position.x = THREE.MathUtils.lerp(movableGroup.position.x, 4, 0.1);
          flipAngle = THREE.MathUtils.lerp(flipAngle, Math.PI, 0.05);
          movablePlate.rotation.x = flipAngle;
        } else if (currentState.step === 3) {
          // Re-bolting - plate moves back, bolts move in
          movableGroup.position.x = THREE.MathUtils.lerp(movableGroup.position.x, 1, 0.1);
          if (movableGroup.position.x < 1.1) {
            bolts.forEach(b => b.position.x = THREE.MathUtils.lerp(b.position.x, 0.5, 0.1));
          }
        } else if (currentState.step === 4) {
          // Done - resume swinging
          movableGroup.rotation.z = Math.PI / 12 + Math.sin(Date.now() * 0.01) * 0.05;
        }
      }

      // Camera rotation
      scene.rotation.y += 0.002;

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

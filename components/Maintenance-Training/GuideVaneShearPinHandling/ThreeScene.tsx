import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VaneState } from './three-types';

interface ThreeSceneProps {
  state: VaneState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<VaneState>(state);

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
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Center Runner (Static)
    const runnerGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    scene.add(runner);

    // Guide Vanes
    const numVanes = 12;
    const radius = 3.5;
    const vanes: THREE.Group[] = [];

    const vaneGeo = new THREE.BoxGeometry(0.2, 1, 1.5);
    const vaneMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6 });
    const brokenMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });

    for (let i = 0; i < numVanes; i++) {
      const group = new THREE.Group();
      const angle = (i / numVanes) * Math.PI * 2;
      
      group.position.x = Math.cos(angle) * radius;
      group.position.z = Math.sin(angle) * radius;
      
      // Initial rotation to point towards center
      group.rotation.y = -angle;

      const mesh = new THREE.Mesh(vaneGeo, i === 0 ? brokenMat : vaneMat);
      // Offset mesh so it rotates around its edge
      mesh.position.z = 0.75;
      
      group.add(mesh);
      scene.add(group);
      vanes.push(group);
    }

    // Outer Ring
    const ringGeo = new THREE.TorusGeometry(4.5, 0.1, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Calculate target rotation based on opening (0-100 -> 0 to PI/4)
      const targetRotation = (currentState.opening / 100) * (Math.PI / 4);

      vanes.forEach((vane, index) => {
        if (index === 0 && currentState.pinBroken) {
          // Broken vane stays at 0, plus manual alignment
          vane.children[0].rotation.y = THREE.MathUtils.lerp(
            vane.children[0].rotation.y,
            (currentState.alignment * Math.PI) / 180,
            0.1
          );
          (vane.children[0] as THREE.Mesh).material = brokenMat;
        } else {
          // Normal vanes rotate
          vane.children[0].rotation.y = THREE.MathUtils.lerp(
            vane.children[0].rotation.y,
            targetRotation,
            0.1
          );
          (vane.children[0] as THREE.Mesh).material = vaneMat;
        }
      });

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

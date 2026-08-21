import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ReversePowerState } from './three-types';

interface ThreeSceneProps {
  state: ReversePowerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ReversePowerState>(state);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Generator Stator (Outer)
    const statorGeo = new THREE.CylinderGeometry(3, 3, 4, 32, 1, true);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, side: THREE.DoubleSide });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.z = Math.PI / 2;
    scene.add(stator);

    // Generator Rotor (Inner)
    const rotorGeo = new THREE.CylinderGeometry(2.5, 2.5, 4.2, 16);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, wireframe: true });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.rotation.z = Math.PI / 2;
    scene.add(rotor);

    // Power Flow Particles
    const flowGeo = new THREE.BufferGeometry();
    const flowCount = 100;
    const flowPos = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount * 3; i++) {
      flowPos[i] = (Math.random() - 0.5) * 8; // x
      flowPos[i + 1] = (Math.random() - 0.5) * 2; // y
      flowPos[i + 2] = (Math.random() - 0.5) * 2; // z
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    const flowMat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.2, transparent: true, opacity: 0.8 }); // Green for generating
    const flowParticles = new THREE.Points(flowGeo, flowMat);
    scene.add(flowParticles);

    // Main Circuit Breaker (ACB)
    const breakerGroup = new THREE.Group();
    breakerGroup.position.set(5, 0, 0);
    
    const breakerBoxGeo = new THREE.BoxGeometry(1, 3, 3);
    const breakerBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const breakerBox = new THREE.Mesh(breakerBoxGeo, breakerBoxMat);
    breakerGroup.add(breakerBox);

    const contactGeo = new THREE.BoxGeometry(0.2, 1, 1);
    const contactMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1 });
    const contact = new THREE.Mesh(contactGeo, contactMat);
    contact.position.set(-0.6, 0, 0);
    breakerGroup.add(contact);

    scene.add(breakerGroup);

    // Spark effect for trip
    const sparkLight = new THREE.PointLight(0xffffff, 0, 10);
    sparkLight.position.set(4.5, 0, 0);
    scene.add(sparkLight);

    let animationFrameId: number;
    let lastBreakerState = state.breakerClosed;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotor rotation (constant speed for synchronous generator)
      rotor.rotation.x += 0.1;

      // Power flow animation
      if (currentState.breakerClosed) {
        flowParticles.visible = true;
        const positions = flowGeo.attributes.position.array as Float32Array;
        
        // Direction and color based on active power
        if (currentState.activePower >= 0) {
          // Generating: Flow outwards to grid (right)
          flowMat.color.setHex(0x22c55e); // Green
          for (let i = 0; i < flowCount; i++) {
            positions[i * 3] += 0.1;
            if (positions[i * 3] > 6) positions[i * 3] = -2;
          }
        } else {
          // Motoring (Reverse Power): Flow inwards from grid (left)
          flowMat.color.setHex(0xef4444); // Red
          for (let i = 0; i < flowCount; i++) {
            positions[i * 3] -= 0.1;
            if (positions[i * 3] < -2) positions[i * 3] = 6;
          }
        }
        flowGeo.attributes.position.needsUpdate = true;
      } else {
        flowParticles.visible = false;
      }

      // Breaker animation
      if (currentState.breakerClosed) {
        contact.position.x = -0.6; // Closed
      } else {
        contact.position.x = -1.2; // Open
      }

      // Trip spark effect
      if (lastBreakerState && !currentState.breakerClosed) {
        sparkLight.intensity = 5; // Flash
      }
      if (sparkLight.intensity > 0) {
        sparkLight.intensity -= 0.2; // Fade out
      }
      lastBreakerState = currentState.breakerClosed;

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.1;

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

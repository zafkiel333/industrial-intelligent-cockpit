import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BrakeState } from './three-types';

interface ThreeSceneProps {
  state: BrakeState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BrakeState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
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

    // Brake Disc
    const discGeo = new THREE.CylinderGeometry(4, 4, 0.5, 64);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    scene.add(disc);

    // Brake Caliper Assembly (simplified)
    const caliperGroup = new THREE.Group();
    
    // Caliper Body
    const bodyGeo = new THREE.BoxGeometry(2, 3, 1.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.5 }); // Red caliper
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(4, 0, 0);
    caliperGroup.add(body);

    // Brake Pads
    const padGeo = new THREE.BoxGeometry(1.5, 2, 0.2);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    
    const padFront = new THREE.Mesh(padGeo, padMat);
    const padBack = new THREE.Mesh(padGeo, padMat);
    
    caliperGroup.add(padFront);
    caliperGroup.add(padBack);

    scene.add(caliperGroup);

    // Feeler Gauge (塞尺)
    const gaugeGroup = new THREE.Group();
    const gaugeBladeGeo = new THREE.BoxGeometry(1.5, 0.5, 0.02);
    const gaugeBladeMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9 });
    const gaugeBlade = new THREE.Mesh(gaugeBladeGeo, gaugeBladeMat);
    gaugeGroup.add(gaugeBlade);
    
    // Position gauge near the gap
    gaugeGroup.position.set(3.5, 1, 0);
    gaugeGroup.visible = false;
    scene.add(gaugeGroup);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Disc rotation (only if not braking)
      if (!currentState.isBraking) {
        disc.rotation.y += 0.05;
      }

      // Calculate pad positions based on clearance and braking state
      // Base disc thickness is 0.5 (z from -0.25 to 0.25)
      // Clearance is in mm, scaled for visual effect (e.g., 1mm -> 0.1 units)
      const visualClearance = currentState.isBraking ? 0 : currentState.clearance * 0.1;
      
      padFront.position.set(3.5, 0, 0.25 + visualClearance + 0.1); // 0.1 is half pad thickness
      padBack.position.set(3.5, 0, -0.25 - visualClearance - 0.1);

      // Feeler Gauge animation
      if (currentState.measuring && !currentState.isBraking) {
        gaugeGroup.visible = true;
        // Slide gauge into the gap
        gaugeGroup.position.z = THREE.MathUtils.lerp(gaugeGroup.position.z, 0.25 + visualClearance / 2, 0.1);
      } else {
        gaugeGroup.position.z = THREE.MathUtils.lerp(gaugeGroup.position.z, 2, 0.1);
        if (gaugeGroup.position.z > 1.9) gaugeGroup.visible = false;
      }

      // Gentle camera sway
      camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
      camera.lookAt(0, 0, 0);

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

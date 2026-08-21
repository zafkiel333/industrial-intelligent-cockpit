import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HoistState } from './three-types';

interface ThreeSceneProps {
  state: HoistState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HoistState>(state);

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
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Dam Structure
    const damGeo = new THREE.BoxGeometry(20, 10, 5);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(0, -5, 0);
    scene.add(dam);

    // Gate
    const gateGeo = new THREE.BoxGeometry(8, 8, 0.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(0, -4, 2.6);
    scene.add(gate);

    // Hoist Mechanism (Motor & Drum)
    const drumGeo = new THREE.CylinderGeometry(1, 1, 6, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0, 4, 2.6);
    scene.add(drum);

    // Cables
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
    
    const cable1 = new THREE.Mesh(cableGeo, cableMat);
    cable1.position.set(-3, 0, 2.6);
    scene.add(cable1);
    
    const cable2 = new THREE.Mesh(cableGeo, cableMat);
    cable2.position.set(3, 0, 2.6);
    scene.add(cable2);

    // Water
    const waterGeo = new THREE.PlaneGeometry(20, 10);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6, roughness: 0.1 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -2, 7.5);
    scene.add(water);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Map opening (0-100) to Y position (-4 to 4)
      const targetY = -4 + (currentState.gateOpening / 100) * 8;
      gate.position.y += (targetY - gate.position.y) * 0.1;

      // Update cables
      const cableLength = 8 - (gate.position.y + 4);
      cable1.scale.y = cableLength / 10;
      cable1.position.y = gate.position.y + cableLength / 2;
      cable2.scale.y = cableLength / 10;
      cable2.position.y = gate.position.y + cableLength / 2;

      // Rotate drum if operating
      if (currentState.isOperating) {
        drum.rotation.x += currentState.direction === 'up' ? 0.05 : -0.05;
      }

      // Water animation
      water.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.1;

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

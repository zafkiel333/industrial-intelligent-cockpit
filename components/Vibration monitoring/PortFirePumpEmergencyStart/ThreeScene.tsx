import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirePumpState } from './three-types';

interface ThreeSceneProps {
  state: FirePumpState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<FirePumpState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Fire Pump Set Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Motor
    const motorGeom = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -2.5;
    pumpGroup.add(motor);

    // Pump Casing
    const pumpGeom = new THREE.CylinderGeometry(2, 2, 2, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.5 });
    const pump = new THREE.Mesh(pumpGeom, pumpMat);
    pump.rotation.z = Math.PI / 2;
    pump.position.x = 1.5;
    pumpGroup.add(pump);

    // Base
    const baseGeom = new THREE.BoxGeometry(8, 0.5, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -2;
    pumpGroup.add(base);

    // Pipes
    const pipeGeom = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const inlet = new THREE.Mesh(pipeGeom, pipeMat);
    inlet.position.set(1.5, 0, 3);
    inlet.rotation.x = Math.PI / 2;
    pumpGroup.add(inlet);

    const outlet = new THREE.Mesh(pipeGeom, pipeMat);
    outlet.position.set(1.5, 3, 0);
    pumpGroup.add(outlet);

    // Animation
    let rotationAngle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { motorSpeed, vibrationPeak, isStarting, startProgress } = stateRef.current;
      
      // Rotate Shaft
      const rotSpeed = (motorSpeed / 60) * (Math.PI * 2) * 0.016;
      rotationAngle += rotSpeed;
      
      // Vibration Effect (Transient during start)
      if (isStarting || motorSpeed > 0) {
        const shake = Math.sin(Date.now() * 0.1) * vibrationPeak * 0.05;
        pumpGroup.position.set(shake, shake * 0.5, shake * 0.2);
      }

      // Start Progress Effect (Glow)
      if (isStarting) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        motorMat.emissive.setHex(0x00ffff);
        motorMat.emissiveIntensity = pulse * startProgress;
      } else if (motorSpeed > 0) {
        motorMat.emissiveIntensity = 0.2;
      } else {
        motorMat.emissiveIntensity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      // Cleanup scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="firepump-3d-container" />;
};

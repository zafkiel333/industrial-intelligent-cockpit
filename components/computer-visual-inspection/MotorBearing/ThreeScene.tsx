import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MotorState } from './three-types';

interface ThreeSceneProps {
  state: MotorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(50, 40, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Motor Body (Simplified)
    const motorGroup = new THREE.Group();
    scene.add(motorGroup);

    const bodyGeo = new THREE.CylinderGeometry(15, 15, 40, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    motorGroup.add(body);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(3, 3, 60, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    motorGroup.add(shaft);

    // Bearing Housing DE
    const housingDEGeo = new THREE.CylinderGeometry(18, 18, 5, 32);
    const housingDEMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const housingDE = new THREE.Mesh(housingDEGeo, housingDEMat);
    housingDE.rotation.z = Math.PI / 2;
    housingDE.position.x = 20;
    motorGroup.add(housingDE);

    // Bearing Housing NDE
    const housingNDEGeo = new THREE.CylinderGeometry(18, 18, 5, 32);
    const housingNDEMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const housingNDE = new THREE.Mesh(housingNDEGeo, housingNDEMat);
    housingNDE.rotation.z = Math.PI / 2;
    housingNDE.position.x = -20;
    motorGroup.add(housingNDE);

    // Leak Markers
    const leakGroup = new THREE.Group();
    scene.add(leakGroup);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { rpm, bearingDE, bearingNDE } = stateRef.current;
      
      // Rotate shaft
      shaft.rotation.x += (rpm / 60) * 0.1;

      // Update leak visualization
      leakGroup.clear();
      
      if (bearingDE.oilLeakLevel !== 'none') {
        const color = bearingDE.oilLeakLevel === 'major' ? 0xf43f5e : 0xf59e0b;
        const leakGeo = new THREE.SphereGeometry(bearingDE.leakArea / 10, 16, 16);
        const leakMat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.6 });
        const leak = new THREE.Mesh(leakGeo, leakMat);
        leak.position.set(22, -15, 5);
        leakGroup.add(leak);
      }

      if (bearingNDE.oilLeakLevel !== 'none') {
        const color = bearingNDE.oilLeakLevel === 'major' ? 0xf43f5e : 0xf59e0b;
        const leakGeo = new THREE.SphereGeometry(bearingNDE.leakArea / 10, 16, 16);
        const leakMat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.6 });
        const leak = new THREE.Mesh(leakGeo, leakMat);
        leak.position.set(-22, -15, -5);
        leakGroup.add(leak);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

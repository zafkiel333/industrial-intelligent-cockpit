import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HoistingState } from './three-types';

interface ThreeSceneProps {
  state: HoistingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HoistingState>(state);

  // Update ref without triggering re-renders in useEffect
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup existing canvases
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 15, 20);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 2);
    spotLight.position.set(0, 25, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    scene.add(gridHelper);

    // Objects
    const runnerGroup = new THREE.Group();
    
    // Runner Hub
    const hubGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    runnerGroup.add(hub);

    // Blades
    const bladeGeo = new THREE.BoxGeometry(0.2, 4, 3);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    for (let i = 0; i < 6; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = Math.cos((i * Math.PI) / 3) * 3;
      blade.position.z = Math.sin((i * Math.PI) / 3) * 3;
      blade.rotation.y = -(i * Math.PI) / 3;
      blade.rotation.x = Math.PI / 6;
      runnerGroup.add(blade);
    }
    scene.add(runnerGroup);

    // Crane Hook
    const hookGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 16);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    scene.add(hook);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentState = stateRef.current;
      
      // Apply state to models
      runnerGroup.position.y = currentState.height;
      runnerGroup.rotation.y += currentState.isHoisting ? 0.02 : 0.005;
      
      hook.position.y = currentState.hookPosition;

      // Particle animation
      particlesMesh.rotation.y += 0.001;

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
  }, []); // Empty dependency array as requested

  return <div ref={mountRef} className="w-full h-full" />;
};

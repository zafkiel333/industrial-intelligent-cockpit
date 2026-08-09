import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VacuumState } from './three-types';

interface ThreeSceneProps {
  state: VacuumState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<VacuumState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
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

    // Pump Casing (Transparent to see inside)
    const casingGeo = new THREE.CylinderGeometry(4, 4, 2, 32);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.3, wireframe: true });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    scene.add(casing);

    // Impeller (Eccentric)
    const impellerGroup = new THREE.Group();
    impellerGroup.position.y = -1; // Eccentric offset
    
    const hubGeo = new THREE.CylinderGeometry(1, 1, 1.8, 16);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    impellerGroup.add(hub);

    // Blades
    const bladeCount = 12;
    const bladeGeo = new THREE.BoxGeometry(0.2, 2.5, 1.8);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
    for (let i = 0; i < bladeCount; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 1.5;
      
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / bladeCount) * Math.PI * 2;
      pivot.add(blade);
      impellerGroup.add(pivot);
    }
    scene.add(impellerGroup);

    // Water Ring (Dynamic based on water level and RPM)
    const waterGeo = new THREE.TorusGeometry(3.5, 0.5, 16, 64);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });
    const waterRing = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterRing);

    // Leak Particles
    const leakGeo = new THREE.BufferGeometry();
    const leakCount = 50;
    const leakPos = new Float32Array(leakCount * 3);
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0xf8fafc, size: 0.2, transparent: true, opacity: 0.8 });
    const leakParticles = new THREE.Points(leakGeo, leakMat);
    leakParticles.position.set(3, 3, 0); // Top right leak
    scene.add(leakParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Impeller Rotation
      const speed = (currentState.rpm / 1500) * 0.2;
      impellerGroup.rotation.z -= speed;

      // Water Ring Dynamics
      // Thickness depends on water level
      const thickness = Math.max(0.1, (currentState.waterLevel / 100) * 1.5);
      waterRing.scale.set(1, 1, thickness);
      
      // If RPM is low, water ring collapses
      if (currentState.rpm < 500) {
        waterRing.position.y = -2 + (currentState.rpm / 500) * 2;
        waterRing.scale.y = Math.max(0.1, currentState.rpm / 500);
      } else {
        waterRing.position.y = 0;
        waterRing.scale.y = 1;
      }

      // Leak Animation
      if (currentState.hasLeak && currentState.vacuum < -10) {
        leakParticles.visible = true;
        const positions = leakGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < leakCount; i++) {
          positions[i * 3] -= 0.1 + Math.random() * 0.1; // Suck inward
          positions[i * 3 + 1] -= 0.1 + Math.random() * 0.1;
          
          // Reset if too close to center
          if (positions[i * 3] < -2 || positions[i * 3 + 1] < -2) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
          }
        }
        leakGeo.attributes.position.needsUpdate = true;
      } else {
        leakParticles.visible = false;
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

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FWGState } from './three-types';

interface ThreeSceneProps {
  state: FWGState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<FWGState>(state);

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

    // FWG Main Shell
    const shellGeo = new THREE.CylinderGeometry(3, 3, 6, 32, 1, true);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    // Evaporator (Bottom)
    const evapGeo = new THREE.CylinderGeometry(2.8, 2.8, 2, 32);
    const evapMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 }); // Red for heating
    const evap = new THREE.Mesh(evapGeo, evapMat);
    evap.position.y = -2;
    scene.add(evap);

    // Condenser (Top)
    const condGeo = new THREE.CylinderGeometry(2.8, 2.8, 2, 32);
    const condMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 }); // Blue for cooling
    const cond = new THREE.Mesh(condGeo, condMat);
    cond.position.y = 2;
    scene.add(cond);

    // Ejector (Vacuum pump)
    const ejectorGeo = new THREE.CylinderGeometry(0.5, 0.2, 2, 16);
    const ejectorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const ejector = new THREE.Mesh(ejectorGeo, ejectorMat);
    ejector.position.set(3.5, 2, 0);
    ejector.rotation.z = -Math.PI / 4;
    scene.add(ejector);

    // Vapor Particles (Evaporation)
    const vaporGeo = new THREE.BufferGeometry();
    const vaporCount = 200;
    const vaporPos = new Float32Array(vaporCount * 3);
    for (let i = 0; i < vaporCount * 3; i++) {
      vaporPos[i] = (Math.random() - 0.5) * 5;
      vaporPos[i + 1] = -1 + Math.random() * 2;
      vaporPos[i + 2] = (Math.random() - 0.5) * 5;
    }
    vaporGeo.setAttribute('position', new THREE.BufferAttribute(vaporPos, 3));
    const vaporMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    const vaporParticles = new THREE.Points(vaporGeo, vaporMat);
    scene.add(vaporParticles);

    // Air Leak Particles (Red)
    const leakGeo = new THREE.BufferGeometry();
    const leakCount = 50;
    const leakPos = new Float32Array(leakCount * 3);
    for (let i = 0; i < leakCount * 3; i++) {
      leakPos[i] = 3; // Shell edge
      leakPos[i + 1] = 0; // Middle joint
      leakPos[i + 2] = 0;
    }
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.2, transparent: true, opacity: 0.8 });
    const leakParticles = new THREE.Points(leakGeo, leakMat);
    scene.add(leakParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Vapor animation depends on vacuum and heating
      if (currentState.vacuumLevel > 50 && currentState.heatingWaterTemp > 70) {
        vaporParticles.visible = true;
        const positions = vaporGeo.attributes.position.array as Float32Array;
        const speed = (currentState.vacuumLevel / 100) * 0.05;
        
        for (let i = 0; i < vaporCount; i++) {
          positions[i * 3 + 1] += speed; // Move up
          if (positions[i * 3 + 1] > 2) {
            // Reset to bottom
            positions[i * 3 + 1] = -1;
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
          }
        }
        vaporGeo.attributes.position.needsUpdate = true;
        
        // Adjust opacity based on vacuum
        vaporMat.opacity = (currentState.vacuumLevel / 100) * 0.6;
      } else {
        vaporParticles.visible = false;
      }

      // Leak animation
      if (currentState.leakActive && currentState.ejectorPumpRunning) {
        leakParticles.visible = true;
        const positions = leakGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < leakCount; i++) {
          positions[i * 3] -= 0.1; // Sucked inwards
          positions[i * 3 + 1] += (Math.random() - 0.5) * 0.1;
          
          if (positions[i * 3] < 0) {
            positions[i * 3] = 3; // Reset to edge
            positions[i * 3 + 1] = 0;
          }
        }
        leakGeo.attributes.position.needsUpdate = true;
      } else {
        leakParticles.visible = false;
      }

      // Ejector color indicates running
      if (currentState.ejectorPumpRunning) {
        (ejector.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e); // Green
      } else {
        (ejector.material as THREE.MeshStandardMaterial).color.setHex(0x94a3b8); // Gray
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;

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

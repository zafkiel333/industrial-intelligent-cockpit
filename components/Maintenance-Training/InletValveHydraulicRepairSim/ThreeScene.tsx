import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HydraulicState } from './three-types';

interface ThreeSceneProps {
  state: HydraulicState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HydraulicState>(state);

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
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Pipe system
    const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    
    const pipe1 = new THREE.Mesh(pipeGeo, pipeMat);
    pipe1.position.set(-2, 0, 0);
    pipe1.rotation.z = Math.PI / 2;
    scene.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeo, pipeMat);
    pipe2.position.set(2, 0, 0);
    pipe2.rotation.z = Math.PI / 2;
    scene.add(pipe2);

    // Valve Body
    const valveGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.5, roughness: 0.5 });
    const valve = new THREE.Mesh(valveGeo, valveMat);
    scene.add(valve);

    // Butterfly Disc
    const discGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    scene.add(disc);

    // Leak Particles
    const leakGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const leakMat = new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.8 });
    const leakParticles: THREE.Mesh[] = [];
    for(let i=0; i<30; i++) {
      const p = new THREE.Mesh(leakGeo, leakMat);
      p.position.set(0, -0.8, 0);
      scene.add(p);
      leakParticles.push(p);
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate disc based on valveOpen
      const targetRotation = currentState.valveOpen ? 0 : Math.PI / 2;
      disc.rotation.y += (targetRotation - disc.rotation.y) * 0.1;

      // Leak animation
      leakParticles.forEach(p => {
        if (currentState.leakActive && currentState.pressure > 0) {
          p.visible = true;
          p.position.y -= 0.1 * (currentState.pressure / 10);
          p.position.x += (Math.random() - 0.5) * 0.05;
          p.position.z += (Math.random() - 0.5) * 0.05;
          
          if (p.position.y < -3) {
            p.position.set((Math.random() - 0.5) * 0.2, -0.8, (Math.random() - 0.5) * 0.2);
          }
        } else {
          p.visible = false;
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

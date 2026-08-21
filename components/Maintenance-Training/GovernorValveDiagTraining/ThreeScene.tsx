import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ValveState } from './three-types';

interface ThreeSceneProps {
  state: ValveState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ValveState>(state);

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
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Valve Body (Transparent)
    const bodyGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, 
      transparent: true, 
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    scene.add(body);

    // Spool (Moving part)
    const spoolGeo = new THREE.CylinderGeometry(1.4, 1.4, 4, 32);
    const spoolMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const spool = new THREE.Mesh(spoolGeo, spoolMat);
    spool.rotation.z = Math.PI / 2;
    scene.add(spool);

    // Ports
    const portGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    
    const portP = new THREE.Mesh(portGeo, portMat);
    portP.position.set(0, 1.5, 0);
    scene.add(portP);

    const portA = new THREE.Mesh(portGeo, portMat);
    portA.position.set(-1.5, -1.5, 0);
    scene.add(portA);

    const portB = new THREE.Mesh(portGeo, portMat);
    portB.position.set(1.5, -1.5, 0);
    scene.add(portB);

    // Oil Particles
    const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xeab308 }); // Yellow oil
    const particles: THREE.Mesh[] = [];
    
    for(let i=0; i<50; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      p.position.set((Math.random()-0.5)*2, 1.5 + Math.random(), (Math.random()-0.5)*1);
      scene.add(p);
      particles.push(p);
    }

    // Clog visual
    const clogGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const clogMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 1 });
    const clog = new THREE.Mesh(clogGeo, clogMat);
    clog.position.set(-1.5, -0.5, 0); // Block Port A
    scene.add(clog);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Move spool
      // spoolPosition is -1 to 1. Map to physical limits (-1 to 1)
      const targetX = currentState.spoolPosition * 1.0;
      spool.position.x += (targetX - spool.position.x) * 0.1;

      // Show/hide clog
      clog.visible = currentState.isClogged;

      // Animate oil particles
      particles.forEach((p, i) => {
        if (currentState.flowRate > 0) {
          p.position.y -= 0.05 * currentState.flowRate;
          
          // Reset particle
          if (p.position.y < -2) {
            p.position.y = 2;
            p.position.x = (Math.random()-0.5)*1;
          }

          // Flow logic based on spool position
          if (p.position.y < 0) {
            if (spool.position.x > 0.2) {
              p.position.x -= 0.05; // Flow to Port A
            } else if (spool.position.x < -0.2) {
              p.position.x += 0.05; // Flow to Port B
            }
          }
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

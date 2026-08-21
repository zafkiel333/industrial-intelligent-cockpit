import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LubeValveState } from './three-types';

interface ThreeSceneProps {
  state: LubeValveState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<LubeValveState>(state);

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
    camera.position.set(0, 5, 12);
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

    // Main Supply Pipe
    const mainPipeGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 32);
    mainPipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const mainPipe = new THREE.Mesh(mainPipeGeo, pipeMat);
    mainPipe.position.y = 2;
    scene.add(mainPipe);

    // Distributor Block
    const blockGeo = new THREE.BoxGeometry(6, 1, 1);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = 1;
    scene.add(block);

    // Valves and Outlet Pipes
    const valves: THREE.Mesh[] = [];
    const outlets: THREE.Mesh[] = [];
    const flowParticles: THREE.Points[] = [];

    const createValveSystem = (xPos: number, index: number) => {
      // Valve Body
      const valveGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
      const valveMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const valve = new THREE.Mesh(valveGeo, valveMat);
      valve.position.set(xPos, 0.5, 0);
      scene.add(valve);
      valves.push(valve);

      // Outlet Pipe
      const outletGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
      const outlet = new THREE.Mesh(outletGeo, pipeMat);
      outlet.position.set(xPos, -1, 0);
      scene.add(outlet);
      outlets.push(outlet);

      // Flow Particles
      const particleCount = 50;
      const particlesGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for(let i=0; i < particleCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 0.2; // x
          posArray[i+1] = Math.random() * 3 - 1.5; // y
          posArray[i+2] = (Math.random() - 0.5) * 0.2; // z
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particlesMat = new THREE.PointsMaterial({
          size: 0.1,
          color: 0xfacc15, // Grease color (yellowish)
          transparent: true,
          opacity: 0.8
      });
      const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      particlesMesh.position.set(xPos, -1, 0);
      scene.add(particlesMesh);
      flowParticles.push(particlesMesh);
    };

    createValveSystem(-2, 0); // Valve 1
    createValveSystem(0, 1);  // Valve 2
    createValveSystem(2, 2);  // Valve 3

    // Heater Element (Visual)
    const heaterGeo = new THREE.BoxGeometry(6.2, 0.2, 1.2);
    const heaterMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0 });
    const heater = new THREE.Mesh(heaterGeo, heaterMat);
    heater.position.y = 0.4;
    scene.add(heater);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Heater Visuals
      if (currentState.isHeating) {
        heaterMat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.2; // Pulsing red
      } else {
        heaterMat.emissiveIntensity = 0;
      }

      // Update Flow Particles
      const flows = [currentState.valve1Flow, currentState.valve2Flow, currentState.valve3Flow];
      const blockages = [currentState.valve1Blocked, currentState.valve2Blocked, currentState.valve3Blocked];

      flowParticles.forEach((particlesMesh, index) => {
        const positions = particlesMesh.geometry.attributes.position.array as Float32Array;
        const flowRate = flows[index];
        const isBlocked = blockages[index];

        // Highlight selected valve
        if (currentState.selectedValve === index + 1) {
            (valves[index].material as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
        } else {
            (valves[index].material as THREE.MeshStandardMaterial).color.setHex(isBlocked ? 0xef4444 : 0x94a3b8);
        }

        particlesMesh.visible = currentState.isPumpOn && flowRate > 0;

        if (currentState.isPumpOn && flowRate > 0) {
            const speed = (flowRate / 100) * 0.1;
            for(let i = 0; i < 50; i++) {
                const i3 = i * 3;
                positions[i3+1] -= speed; // Move down
                
                // Reset to top
                if (positions[i3+1] < -1.5) {
                    positions[i3+1] = 1.5;
                }
            }
            particlesMesh.geometry.attributes.position.needsUpdate = true;
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

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ChillerState } from './three-types';

interface ThreeSceneProps {
  state: ChillerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ChillerState>(state);

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
    camera.position.set(0, 8, 25);
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

    // --- Chiller Unit (Left) ---
    const chillerGroup = new THREE.Group();
    chillerGroup.position.set(-6, 0, 0);
    scene.add(chillerGroup);

    // Evaporator (Bottom shell)
    const evapGeo = new THREE.CylinderGeometry(2, 2, 8, 32);
    const evapMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.2 }); // Blue
    const evap = new THREE.Mesh(evapGeo, evapMat);
    evap.rotation.z = Math.PI / 2;
    evap.position.y = -2;
    chillerGroup.add(evap);

    // Condenser (Top shell)
    const condGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
    const condMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.2 }); // Red
    const cond = new THREE.Mesh(condGeo, condMat);
    cond.rotation.z = Math.PI / 2;
    cond.position.y = 2;
    chillerGroup.add(cond);

    // Compressor (Top center)
    const compGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const compMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const comp = new THREE.Mesh(compGeo, compMat);
    comp.position.set(0, 4.5, 0);
    chillerGroup.add(comp);

    // Connecting pipes
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2), pipeMat);
    pipe1.position.set(-2, 3.25, 0);
    chillerGroup.add(pipe1);
    const pipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2), pipeMat);
    pipe2.position.set(2, 3.25, 0);
    chillerGroup.add(pipe2);

    // --- Recovery Machine (Center) ---
    const recoveryGroup = new THREE.Group();
    recoveryGroup.position.set(2, -1, 0);
    scene.add(recoveryGroup);

    const recBodyGeo = new THREE.BoxGeometry(3, 2.5, 2);
    const recBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4 }); // Orange
    const recBody = new THREE.Mesh(recBodyGeo, recBodyMat);
    recoveryGroup.add(recBody);

    // Recovery Compressor Fan
    const fanGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const fan = new THREE.Mesh(fanGeo, fanMat);
    fan.rotation.x = Math.PI / 2;
    fan.position.set(0, 0, 1.1);
    recoveryGroup.add(fan);

    // --- Recovery Cylinder (Right) ---
    const cylGroup = new THREE.Group();
    cylGroup.position.set(8, -1, 0);
    scene.add(cylGroup);

    const cylGeo = new THREE.CapsuleGeometry(1.2, 3, 16, 32);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.6 }); // Green
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylGroup.add(cylinder);

    // --- Hoses (Lines) ---
    const hoseMatLiquid = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3 }); // Blue for liquid
    const hoseMatVapor = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }); // Red for vapor
    
    // Chiller to Recovery (Vapor/Liquid lines)
    const hoseInGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4, -2, 0), // Evap bottom (liquid)
      new THREE.Vector3(0.5, -1, 0) // Recovery inlet
    ]);
    const hoseIn = new THREE.Line(hoseInGeo, hoseMatLiquid);
    scene.add(hoseIn);

    // Recovery to Cylinder
    const hoseOutGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(3.5, -1, 0), // Recovery outlet
      new THREE.Vector3(8, 1.5, 0) // Cylinder top
    ]);
    const hoseOut = new THREE.Line(hoseOutGeo, hoseMatVapor);
    scene.add(hoseOut);

    // --- Valves (Visual Indicators) ---
    const createValve = (x: number, y: number, z: number) => {
      const vGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
      const vMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red = closed initially
      const vMesh = new THREE.Mesh(vGeo, vMat);
      vMesh.position.set(x, y, z);
      scene.add(vMesh);
      return vMesh;
    };

    const vLiquid = createValve(-4, -2, 0.5);
    const vVapor = createValve(-4, 2, 0.5);
    const vRecIn = createValve(0.5, -1, 0.5);
    const vRecOut = createValve(3.5, -1, 0.5);

    // --- Flow Particles ---
    const flowGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const flowMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const flowParticles: THREE.Mesh[] = [];
    for(let i=0; i<10; i++) {
        const p = new THREE.Mesh(flowGeo, flowMat);
        p.visible = false;
        scene.add(p);
        flowParticles.push(p);
    }

    let animationFrameId: number;
    let particleOffset = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Valve Colors
      const updateValveColor = (mesh: THREE.Mesh, isOpen: boolean) => {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(isOpen ? 0x22c55e : 0xef4444);
      };
      updateValveColor(vLiquid, currentState.valves.liquidLine);
      updateValveColor(vVapor, currentState.valves.vaporLine);
      updateValveColor(vRecIn, currentState.valves.recoveryInlet);
      updateValveColor(vRecOut, currentState.valves.recoveryOutlet);

      // Update Hose Colors based on mode
      if (currentState.mode === 'liquid_recovery') {
         hoseIn.material = hoseMatLiquid;
         hoseInGeo.setFromPoints([new THREE.Vector3(-4, -2, 0), new THREE.Vector3(0.5, -1, 0)]); // Connect to Evap
      } else if (currentState.mode === 'vapor_recovery') {
         hoseIn.material = hoseMatVapor;
         hoseInGeo.setFromPoints([new THREE.Vector3(-4, 2, 0), new THREE.Vector3(0.5, -1, 0)]); // Connect to Condenser
      }

      // Animate Recovery Fan
      if (currentState.compressorRunning) {
        fan.rotation.y += 0.5;
      }

      // Animate Flow Particles
      if (currentState.compressorRunning && currentState.valves.recoveryInlet && currentState.valves.recoveryOutlet) {
        particleOffset += 0.05;
        if (particleOffset > 1) particleOffset = 0;

        flowParticles.forEach((p, i) => {
           p.visible = true;
           // Simple linear interpolation along the path
           // Path: Chiller -> Recovery -> Cylinder
           const t = (particleOffset + i * 0.1) % 1;
           
           let startPoint, endPoint;
           if (t < 0.5) {
               // First half: Chiller to Recovery
               const localT = t * 2;
               startPoint = currentState.mode === 'vapor_recovery' ? new THREE.Vector3(-4, 2, 0) : new THREE.Vector3(-4, -2, 0);
               endPoint = new THREE.Vector3(0.5, -1, 0);
               p.position.lerpVectors(startPoint, endPoint, localT);
               (p.material as THREE.MeshBasicMaterial).color.setHex(currentState.mode === 'vapor_recovery' ? 0xfca5a5 : 0x93c5fd);
           } else {
               // Second half: Recovery to Cylinder
               const localT = (t - 0.5) * 2;
               startPoint = new THREE.Vector3(3.5, -1, 0);
               endPoint = new THREE.Vector3(8, 1.5, 0);
               p.position.lerpVectors(startPoint, endPoint, localT);
               (p.material as THREE.MeshBasicMaterial).color.setHex(0x93c5fd); // Always liquid out of recovery machine
           }
        });
      } else {
        flowParticles.forEach(p => p.visible = false);
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

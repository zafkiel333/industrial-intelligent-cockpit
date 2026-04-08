import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ForkliftHydraulicState } from './three-types';

interface ThreeSceneProps {
  state: ForkliftHydraulicState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ForkliftHydraulicState>(state);

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
    camera.position.set(0, 2, 8);
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

    // Hydraulic System Group
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    // Multi-way Valve Block (Center)
    const valveBlockGeo = new THREE.BoxGeometry(2, 1.5, 1.5);
    const valveBlockMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const valveBlock = new THREE.Mesh(valveBlockGeo, valveBlockMat);
    systemGroup.add(valveBlock);

    // Valve Spool (Inside block, visible end)
    const spoolGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 16);
    const spoolMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const spool = new THREE.Mesh(spoolGeo, spoolMat);
    spool.rotation.z = Math.PI / 2;
    systemGroup.add(spool);

    // Hydraulic Cylinder (Right)
    const cylinderGroup = new THREE.Group();
    cylinderGroup.position.set(3, 0, 0);
    systemGroup.add(cylinderGroup);

    const cylinderBodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 32);
    const cylinderBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 }); // Yellow
    const cylinderBody = new THREE.Mesh(cylinderBodyGeo, cylinderBodyMat);
    cylinderBody.rotation.z = Math.PI / 2;
    cylinderGroup.add(cylinderBody);

    const pistonRodGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 16);
    const pistonRodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const pistonRod = new THREE.Mesh(pistonRodGeo, pistonRodMat);
    pistonRod.rotation.z = Math.PI / 2;
    pistonRod.position.x = 1; // Base position
    cylinderGroup.add(pistonRod);

    // Pump (Left)
    const pumpGeo = new THREE.CylinderGeometry(0.6, 0.6, 1, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6 }); // Blue
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.x = Math.PI / 2;
    pump.position.set(-3, 0, 0);
    systemGroup.add(pump);

    // Hoses (Simplified as lines)
    const createHose = (points: THREE.Vector3[], color: number) => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
        return new THREE.Line(geo, mat);
    };

    const pressureLine = createHose([new THREE.Vector3(-2.5, 0.2, 0), new THREE.Vector3(-1, 0.2, 0)], 0xef4444); // Red (High Pressure)
    systemGroup.add(pressureLine);
    
    const returnLine = createHose([new THREE.Vector3(-1, -0.2, 0), new THREE.Vector3(-2.5, -0.2, 0)], 0x3b82f6); // Blue (Low Pressure)
    systemGroup.add(returnLine);

    const cylLineA = createHose([new THREE.Vector3(1, 0.2, 0), new THREE.Vector3(2, 0.2, 0)], 0xef4444);
    systemGroup.add(cylLineA);

    const cylLineB = createHose([new THREE.Vector3(1, -0.2, 0), new THREE.Vector3(2, -0.2, 0)], 0x3b82f6);
    systemGroup.add(cylLineB);

    // Leakage Visualizer (Particles inside valve block)
    const leakParticleGeo = new THREE.BufferGeometry();
    const leakParticleCount = 100;
    const leakPositions = new Float32Array(leakParticleCount * 3);
    for(let i=0; i<leakParticleCount*3; i++) {
        leakPositions[i] = (Math.random() - 0.5) * 1.5; // Spread within block
    }
    leakParticleGeo.setAttribute('position', new THREE.BufferAttribute(leakPositions, 3));
    const leakParticleMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.05, transparent: true, opacity: 0 });
    const leakParticles = new THREE.Points(leakParticleGeo, leakParticleMat);
    systemGroup.add(leakParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Spool Position (-100 to 100 -> -0.5 to 0.5 visual)
      spool.position.x = (currentState.valveSpoolPosition / 100) * 0.5;

      // Update Cylinder Position (0 to 1000mm -> 1 to 2 visual x)
      pistonRod.position.x = 1 + (currentState.cylinderPosition / 1000);

      // Update Pump Rotation based on speed
      pump.rotation.y += (currentState.pumpSpeed / 60) * 0.1;

      // Update Hose Colors based on pressure/flow direction (simplified)
      if (currentState.valveSpoolPosition > 10) {
          (cylLineA.material as THREE.LineBasicMaterial).color.setHex(0xef4444); // High pressure to A
          (cylLineB.material as THREE.LineBasicMaterial).color.setHex(0x3b82f6); // Return from B
      } else if (currentState.valveSpoolPosition < -10) {
          (cylLineA.material as THREE.LineBasicMaterial).color.setHex(0x3b82f6); // Return from A
          (cylLineB.material as THREE.LineBasicMaterial).color.setHex(0xef4444); // High pressure to B
      } else {
          // Neutral, holding pressure
          if (currentState.systemPressure > 5) {
              (cylLineA.material as THREE.LineBasicMaterial).color.setHex(0xf59e0b); // Holding pressure (Orange)
          } else {
              (cylLineA.material as THREE.LineBasicMaterial).color.setHex(0x3b82f6);
          }
          (cylLineB.material as THREE.LineBasicMaterial).color.setHex(0x3b82f6);
      }

      // Leakage Visualization
      if (currentState.internalLeakageRate > 0 && currentState.systemPressure > 5) {
          leakParticleMat.opacity = Math.min(1, currentState.internalLeakageRate / 50); // Max opacity at 50 L/min
          const positions = leakParticleGeo.attributes.position.array as Float32Array;
          for(let i=0; i<leakParticleCount; i++) {
              // Move particles slightly to simulate flow
              positions[i*3 + 1] -= 0.01; // Move down
              if (positions[i*3 + 1] < -0.7) {
                  positions[i*3 + 1] = 0.7; // Reset to top
              }
          }
          leakParticleGeo.attributes.position.needsUpdate = true;
      } else {
          leakParticleMat.opacity = 0;
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

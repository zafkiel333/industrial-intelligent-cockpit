import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GroundingState } from './three-types';

interface ThreeSceneProps {
  state: GroundingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GroundingState>(state);
  
  // Refs for moving objects
  const probePRef = useRef<THREE.Group | null>(null);
  const probeCRef = useRef<THREE.Group | null>(null);
  const wirePRef = useRef<THREE.Line | null>(null);
  const wireCRef = useRef<THREE.Line | null>(null);
  const currentFlowRef = useRef<THREE.Points | null>(null);

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
    scene.fog = new THREE.FogExp2('#0f172a', 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(10, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground/Soil
    const groundGeo = new THREE.PlaneGeometry(60, 20, 30, 10);
    // Displace ground slightly for terrain look
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, (Math.random() - 0.5) * 0.5);
    }
    groundGeo.computeVertexNormals();
    
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x422006, // Dark brown soil
        roughness: 0.9,
        metalness: 0.1,
        wireframe: true, // Wireframe to look "virtual/simulated"
        transparent: true,
        opacity: 0.3
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(20, 0, 0);
    scene.add(ground);

    // Grounding Grid (Underground)
    const gridGeo = new THREE.GridHelper(10, 5, 0x94a3b8, 0x475569);
    gridGeo.position.set(0, -1, 0);
    scene.add(gridGeo);

    // Main Earth Terminal (E)
    const terminalGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
    const terminalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const terminalE = new THREE.Mesh(terminalGeo, terminalMat);
    terminalE.position.set(0, 0, 0);
    scene.add(terminalE);

    // Tester Instrument
    const testerGeo = new THREE.BoxGeometry(1.5, 0.8, 1);
    const testerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Yellow tester
    const tester = new THREE.Mesh(testerGeo, testerMat);
    tester.position.set(-2, 0.4, 0);
    scene.add(tester);

    // Helper function to create probes
    const createProbe = (color: number) => {
        const group = new THREE.Group();
        const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
        const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.y = 0;
        group.add(rod);
        
        const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3);
        const handleMat = new THREE.MeshStandardMaterial({ color: color });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = 0.8;
        group.add(handle);
        
        return group;
    };

    // Potential Probe (P) - Yellow
    const probeP = createProbe(0xfacc15);
    scene.add(probeP);
    probePRef.current = probeP;

    // Current Probe (C) - Red
    const probeC = createProbe(0xef4444);
    scene.add(probeC);
    probeCRef.current = probeC;

    // Wires
    const wireMat = new THREE.LineBasicMaterial({ color: 0x22c55e }); // Green for E
    const wireEGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.5, 0.4, 0), // Tester
        new THREE.Vector3(0, 0.5, 0)     // Terminal E
    ]);
    scene.add(new THREE.Line(wireEGeo, wireMat));

    const wirePMat = new THREE.LineBasicMaterial({ color: 0xfacc15 });
    const wirePGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.5, 0.4, 0), new THREE.Vector3(0,0,0)]);
    const wireP = new THREE.Line(wirePGeo, wirePMat);
    scene.add(wireP);
    wirePRef.current = wireP;

    const wireCMat = new THREE.LineBasicMaterial({ color: 0xef4444 });
    const wireCGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.5, 0.4, 0), new THREE.Vector3(0,0,0)]);
    const wireC = new THREE.Line(wireCGeo, wireCMat);
    scene.add(wireC);
    wireCRef.current = wireC;

    // Current Flow Visualization (Underground)
    const particleCount = 500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.2, transparent: true, opacity: 0.6 });
    const currentFlow = new THREE.Points(particlesGeo, particlesMat);
    scene.add(currentFlow);
    currentFlowRef.current = currentFlow;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Probe Positions
      if (probePRef.current && probeCRef.current) {
          probePRef.current.position.set(currentState.probeDistanceP, 0, 0);
          probeCRef.current.position.set(currentState.probeDistanceC, 0, 0);
      }

      // Update Wires
      if (wirePRef.current && wireCRef.current) {
          wirePRef.current.geometry.setFromPoints([
              new THREE.Vector3(-1.5, 0.4, 0),
              new THREE.Vector3(currentState.probeDistanceP, 0.5, 0)
          ]);
          wireCRef.current.geometry.setFromPoints([
              new THREE.Vector3(-1.5, 0.4, 0),
              new THREE.Vector3(currentState.probeDistanceC, 0.5, 0)
          ]);
      }

      // Animate Current Flow (from C to E through ground)
      if (currentState.isTesting && currentFlowRef.current) {
          currentFlowRef.current.visible = true;
          const positions = currentFlowRef.current.geometry.attributes.position.array as Float32Array;
          
          for(let i = 0; i < particleCount; i++) {
              // If particle is uninitialized or reached E, reset to C
              if (positions[i*3] === 0 || positions[i*3] < 0) {
                  positions[i*3] = currentState.probeDistanceC; // X
                  positions[i*3+1] = -Math.random() * 5; // Y (depth)
                  positions[i*3+2] = (Math.random() - 0.5) * 4; // Z (spread)
              } else {
                  // Move towards E (x=0)
                  positions[i*3] -= 0.2; // Speed
                  // Curve upwards as it approaches E
                  if (positions[i*3] < 5) {
                      positions[i*3+1] += 0.1;
                  }
              }
          }
          currentFlowRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (currentFlowRef.current) {
          currentFlowRef.current.visible = false;
      }

      // Update ground color based on weather (soil resistivity)
      if (currentState.weatherCondition === 'Wet') {
          groundMat.color.setHex(0x1c1917); // Darker, more conductive
      } else if (currentState.weatherCondition === 'Dry') {
          groundMat.color.setHex(0x78350f); // Lighter, less conductive
      } else {
          groundMat.color.setHex(0x422006); // Normal
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

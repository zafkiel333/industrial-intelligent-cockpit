import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CouplingState } from './three-types';

interface ThreeSceneProps {
  state: CouplingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CouplingState>(state);

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

    // Base
    const baseGeo = new THREE.BoxGeometry(10, 0.5, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2;
    scene.add(base);

    // Motor (Input side)
    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.6 }); // Blue
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-4, 0, 0);
    scene.add(motor);

    // Input Shaft
    const inputShaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const inputShaft = new THREE.Mesh(inputShaftGeo, shaftMat);
    inputShaft.rotation.z = Math.PI / 2;
    inputShaft.position.set(-2, 0, 0);
    scene.add(inputShaft);

    // Fluid Coupling (Center)
    const couplingGroup = new THREE.Group();
    scene.add(couplingGroup);

    // Coupling Shell (Transparent to see inside)
    const shellGeo = new THREE.SphereGeometry(2, 32, 32);
    const shellMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x64748b, 
      transparent: true, 
      opacity: 0.4, 
      roughness: 0.1, 
      transmission: 0.9, 
      thickness: 0.5 
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.scale.set(0.5, 1, 1); // Flatten it like a disc
    couplingGroup.add(shell);

    // Impeller (Input side inside coupling)
    const impellerGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 32);
    const impellerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7 }); // Red
    const impeller = new THREE.Mesh(impellerGeo, impellerMat);
    impeller.rotation.z = Math.PI / 2;
    impeller.position.set(-0.3, 0, 0);
    couplingGroup.add(impeller);

    // Runner (Output side inside coupling)
    const runnerGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 32);
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.7 }); // Green
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.z = Math.PI / 2;
    runner.position.set(0.3, 0, 0);
    couplingGroup.add(runner);

    // Oil Level Indicator (Visualized as a plane inside)
    const oilGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.8, 32);
    const oilMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8, transmission: 0.5 }); // Amber oil
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.rotation.z = Math.PI / 2;
    couplingGroup.add(oil);

    // Output Shaft
    const outputShaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const outputShaft = new THREE.Mesh(outputShaftGeo, shaftMat);
    outputShaft.rotation.z = Math.PI / 2;
    outputShaft.position.set(2, 0, 0);
    scene.add(outputShaft);

    // Gearbox/Load (Output side)
    const loadGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const loadMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const load = new THREE.Mesh(loadGeo, loadMat);
    load.position.set(4, 0, 0);
    scene.add(load);

    // Fusible Plug (Top of coupling shell)
    const plugGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
    const plugMat = new THREE.MeshStandardMaterial({ color: 0xeab308 }); // Yellow brass
    const plug = new THREE.Mesh(plugGeo, plugMat);
    plug.position.set(0, 2, 0);
    couplingGroup.add(plug);

    // Leak Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.05, color: 0xf59e0b, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.set(0, -2, 0); // Start below coupling
    scene.add(particles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate shafts and internal parts
      if (currentState.isRunning) {
        const inputRotSpeed = (currentState.inputSpeed / 60) * Math.PI * 2 * 0.01; // Scale down for visual
        const outputRotSpeed = (currentState.outputSpeed / 60) * Math.PI * 2 * 0.01;

        inputShaft.rotation.x += inputRotSpeed;
        impeller.rotation.x += inputRotSpeed; // Impeller spins with input

        outputShaft.rotation.x += outputRotSpeed;
        runner.rotation.x += outputRotSpeed; // Runner spins with output
        
        // Shell spins with input (usually attached to impeller)
        shell.rotation.x += inputRotSpeed;
        plug.rotation.x += inputRotSpeed;
      }

      // Update Oil Level Visual (Scale Y of the oil cylinder)
      // 0% = scale 0.01, 100% = scale 1
      const oilScale = Math.max(0.01, currentState.oilLevel / 100);
      oil.scale.set(1, 1, oilScale);
      
      // If running, oil gets flung to outside, visual simplification: just make it fill the shell more
      if (currentState.isRunning && currentState.oilLevel > 0) {
         oil.scale.set(1.05, 1.05, oilScale);
      } else {
         oil.scale.set(1, 1, oilScale);
      }

      // Color change based on temperature
      if (currentState.oilTemp > 90) {
        oilMat.color.setHex(0xef4444); // Red if too hot
        shellMat.color.setHex(0xef4444);
      } else {
        oilMat.color.setHex(0xf59e0b); // Normal amber
        shellMat.color.setHex(0x64748b);
      }

      // Plug visibility
      plug.visible = !currentState.plugRemoved;

      // Leak animation
      if (currentState.isLeaking) {
        particles.visible = true;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=1; i<particleCount*3; i+=3) {
            positions[i] -= 0.05; // Fall down
            if (positions[i] < -2) {
                positions[i] = 0; // Reset to bottom of coupling
                positions[i-1] = (Math.random() - 0.5) * 2; // Random X
                positions[i+1] = (Math.random() - 0.5) * 2; // Random Z
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      } else {
        particles.visible = false;
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

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpState } from './three-types';

interface ThreeSceneProps {
  state: PumpState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 2); // sky-500
    spotLight.position.set(-10, 15, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Swashplate (Fixed angle for simplicity, though real ones vary)
    const swashplateGeo = new THREE.CylinderGeometry(4, 4, 0.5, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const swashplate = new THREE.Mesh(swashplateGeo, metalMat);
    swashplate.rotation.x = Math.PI / 2;
    swashplate.rotation.y = Math.PI / 6; // 30 degree tilt
    swashplate.position.set(-5, 0, 0);
    pumpGroup.add(swashplate);

    // Cylinder Block
    const blockGeo = new THREE.CylinderGeometry(3.5, 3.5, 6, 32);
    const blockMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.6, 
        roughness: 0.4,
        transparent: true,
        opacity: 0.4 // See-through to see pistons
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.rotation.z = Math.PI / 2;
    block.position.set(0, 0, 0);
    pumpGroup.add(block);

    // Pistons
    const pistonCount = 7;
    const pistons: THREE.Mesh[] = [];
    const pistonGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    for (let i = 0; i < pistonCount; i++) {
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        piston.rotation.z = Math.PI / 2;
        pumpGroup.add(piston);
        pistons.push(piston);
    }

    // Fluid Particles (Oil)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = (Math.random() - 0.5) * 10;
        particlePos[i*3+1] = (Math.random() - 0.5) * 6;
        particlePos[i*3+2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0xf59e0b, // amber-500 (Hydraulic oil)
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    pumpGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotation speed based on flow rate
      const speed = currentState.flowRate * 0.05;
      block.rotation.x -= speed * 0.016;

      // Piston Kinematics
      pistons.forEach((piston, i) => {
          const angle = (i / pistonCount) * Math.PI * 2 + block.rotation.x;
          const radius = 2.2;
          
          // Position in the block
          const y = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          // X position depends on the swashplate tilt
          // Swashplate is at x = -5, tilted by PI/6 around Y axis
          // The distance the piston sticks out depends on its Z position relative to the tilt
          const stroke = Math.sin(angle) * radius * Math.tan(Math.PI / 6);
          const x = -2 + stroke; // Base position + stroke

          piston.position.set(x, y, z);
      });

      // Fluid Dynamics
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const pressureFactor = currentState.pressure / 30; // Max ~30MPa
      const leakFactor = currentState.internalLeakage / 100;
      
      for(let i=0; i<particleCount; i++) {
          // Normal flow (right to left)
          positions[i*3] -= speed * 0.1;
          
          // High pressure causes turbulence
          if (pressureFactor > 0.5) {
              positions[i*3+1] += (Math.random() - 0.5) * pressureFactor * 0.2;
              positions[i*3+2] += (Math.random() - 0.5) * pressureFactor * 0.2;
          }

          // Internal Leakage (particles flowing backwards/escaping block)
          if (Math.random() < leakFactor * 0.1) {
              positions[i*3] += speed * 0.5; // Flow backwards
              positions[i*3+1] += (Math.random() - 0.5) * 0.5; // Scatter
          }

          // Reset particles
          if (positions[i*3] < -8) {
              positions[i*3] = 8;
              positions[i*3+1] = (Math.random() - 0.5) * 4;
              positions[i*3+2] = (Math.random() - 0.5) * 4;
          } else if (positions[i*3] > 8) {
              // Reset leaked particles
              positions[i*3] = -8;
          }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Oil color changes with temperature (darkens/reddens)
      const tempFactor = Math.max(0, Math.min(1, (currentState.oilTemperature - 40) / 60));
      particleMat.color.setRGB(
          0.96 - tempFactor * 0.2, // R
          0.62 - tempFactor * 0.4, // G
          0.04                     // B
      );

      controls.update();
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      swashplateGeo.dispose();
      metalMat.dispose();
      blockGeo.dispose();
      blockMat.dispose();
      pistonGeo.dispose();
      pistonMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BearingState } from './three-types';

interface ThreeSceneProps {
  state: BearingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BearingState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(2, 2, 8, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    scene.add(shaft);

    // Bearing Pads (8 pads)
    const pads: THREE.Mesh[] = [];
    const padCount = 8;
    for (let i = 0; i < padCount; i++) {
      const angle = (i / padCount) * Math.PI * 2;
      const padGeo = new THREE.BoxGeometry(1.2, 3, 0.5);
      // We will update the color dynamically
      const padMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5, roughness: 0.5 });
      const pad = new THREE.Mesh(padGeo, padMat);
      
      pad.position.x = Math.cos(angle) * 2.5;
      pad.position.z = Math.sin(angle) * 2.5;
      pad.rotation.y = -angle;
      
      scene.add(pad);
      pads.push(pad);
    }

    // Oil Film (Transparent Cylinder)
    const oilGeo = new THREE.CylinderGeometry(2.1, 2.1, 4, 32);
    const oilMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xeab308, 
      transparent: true, 
      opacity: 0.4,
      transmission: 0.8,
      roughness: 0.1
    });
    const oilFilm = new THREE.Mesh(oilGeo, oilMat);
    scene.add(oilFilm);

    // Cooling Water Pipe
    const pipeGeo = new THREE.TorusGeometry(3.5, 0.2, 16, 64);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, transparent: true, opacity: 0.8 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.x = Math.PI / 2;
    scene.add(pipe);

    // Water particles inside pipe
    const waterParticlesGeo = new THREE.BufferGeometry();
    const waterCount = 100;
    const waterPos = new Float32Array(waterCount * 3);
    const waterAngles = new Float32Array(waterCount);
    for(let i=0; i<waterCount; i++) {
      waterAngles[i] = Math.random() * Math.PI * 2;
      waterPos[i*3] = Math.cos(waterAngles[i]) * 3.5;
      waterPos[i*3+1] = (Math.random() - 0.5) * 0.3;
      waterPos[i*3+2] = Math.sin(waterAngles[i]) * 3.5;
    }
    waterParticlesGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterParticlesMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.8 });
    const waterParticles = new THREE.Points(waterParticlesGeo, waterParticlesMat);
    scene.add(waterParticles);

    let animationFrameId: number;

    // Helper to map temperature to color (blue -> green -> yellow -> red)
    const getTempColor = (temp: number) => {
      if (temp < 40) return new THREE.Color(0x3b82f6); // Blue
      if (temp < 60) return new THREE.Color(0x10b981); // Green
      if (temp < 80) return new THREE.Color(0xeab308); // Yellow
      return new THREE.Color(0xef4444); // Red
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate shaft based on RPM
      shaft.rotation.y += (currentState.rpm / 60) * 0.1;

      // Update pad colors based on temperature
      pads.forEach((pad, index) => {
        const temp = currentState.padTemps[index] || 35;
        (pad.material as THREE.MeshStandardMaterial).color.lerp(getTempColor(temp), 0.1);
      });

      // Update oil film color based on fault
      if (currentState.faultType === 'oil_contamination') {
        oilMat.color.lerp(new THREE.Color(0x451a03), 0.05); // Dark brown
        oilMat.opacity = 0.8;
      } else {
        oilMat.color.lerp(new THREE.Color(0xeab308), 0.05); // Normal yellow
        oilMat.opacity = 0.4;
      }

      // Animate water flow
      if (currentState.waterFlow > 0) {
        const positions = waterParticlesGeo.attributes.position.array as Float32Array;
        for(let i=0; i<waterCount; i++) {
          waterAngles[i] += 0.02 * (currentState.waterFlow / 100);
          positions[i*3] = Math.cos(waterAngles[i]) * 3.5;
          positions[i*3+2] = Math.sin(waterAngles[i]) * 3.5;
        }
        waterParticlesGeo.attributes.position.needsUpdate = true;
        waterParticles.visible = true;
      } else {
        waterParticles.visible = false;
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

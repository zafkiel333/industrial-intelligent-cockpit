import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PIDTuningState } from './three-types';

interface ThreeSceneProps {
  state: PIDTuningState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PIDTuningState>(state);

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
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 32);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // Valve Body
    const valveBodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const valveBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const valveBody = new THREE.Mesh(valveBodyGeo, valveBodyMat);
    scene.add(valveBody);

    // Valve Stem
    const stemGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 1;
    scene.add(stem);

    // Actuator (Diaphragm housing)
    const actuatorGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.3 }); // Light blue
    const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
    actuator.position.y = 2;
    scene.add(actuator);

    // Positioner Box
    const positionerGeo = new THREE.BoxGeometry(0.8, 1, 0.6);
    const positionerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4 }); // Yellow
    const positioner = new THREE.Mesh(positionerGeo, positionerMat);
    positioner.position.set(1, 1.5, 0);
    scene.add(positioner);

    // Linkage (Feedback arm)
    const linkageGeo = new THREE.BoxGeometry(1, 0.05, 0.1);
    const linkageMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8 });
    const linkage = new THREE.Mesh(linkageGeo, linkageMat);
    linkage.position.set(0.5, 1, 0);
    scene.add(linkage);

    // Flow visualization (Particles)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Animate Valve Stem based on Process Variable (0-100%)
      // 0% = down (closed), 100% = up (open)
      const stemTravel = 0.8; // Max travel distance
      const currentPos = (currentState.processVariable / 100) * stemTravel;
      
      stem.position.y = 1 + currentPos;
      actuator.position.y = 2 + currentPos;
      
      // Linkage moves with stem
      linkage.position.y = 1 + currentPos;
      // Simple rotation for linkage to simulate feedback mechanism
      linkage.rotation.z = (currentState.processVariable / 100) * 0.5 - 0.25;

      // Animate Flow Particles
      const positions = particlesMesh.geometry.attributes.position.array as Float32Array;
      const flowSpeed = (currentState.processVariable / 100) * 0.2; // Speed depends on opening

      for(let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          // Move along X axis (pipe direction)
          positions[i3] += flowSpeed;
          
          // Reset if they go too far right
          if (positions[i3] > 3) {
              positions[i3] = -3;
              // Randomize Y and Z slightly within pipe
              positions[i3+1] = (Math.random() - 0.5) * 1.2;
              positions[i3+2] = (Math.random() - 0.5) * 1.2;
          }

          // If valve is mostly closed, block particles near center
          if (currentState.processVariable < 5 && positions[i3] > -0.5 && positions[i3] < 0.5) {
             positions[i3] = -0.5 - Math.random() * 0.5; // Pile up before valve
          }
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

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

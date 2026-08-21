import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FlowmeterState } from './three-types';

interface ThreeSceneProps {
  state: FlowmeterState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<FlowmeterState>(state);
  const fluidRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

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
    camera.position.set(3, 2, 4);
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

    // Flowmeter Body (Cutaway view)
    const pipeGeo = new THREE.CylinderGeometry(1, 1, 4, 32, 1, true, 0, Math.PI); // Half pipe
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, side: THREE.DoubleSide });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    scene.add(pipe);

    // Lining
    const liningGeo = new THREE.CylinderGeometry(0.95, 0.95, 4, 32, 1, true, 0, Math.PI);
    const liningMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide }); // Dark PTFE lining
    const lining = new THREE.Mesh(liningGeo, liningMat);
    lining.rotation.z = Math.PI / 2;
    scene.add(lining);

    // Electrodes
    const electrodeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
    const electrodeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1 }); // Gold/Brass color
    
    const electrodeA = new THREE.Mesh(electrodeGeo, electrodeMat);
    electrodeA.position.set(0, 0, 0.9);
    electrodeA.rotation.x = Math.PI / 2;
    scene.add(electrodeA);

    const electrodeB = new THREE.Mesh(electrodeGeo, electrodeMat);
    electrodeB.position.set(0, 0, -0.9);
    electrodeB.rotation.x = Math.PI / 2;
    scene.add(electrodeB);

    // Magnetic Coils (Top and Bottom)
    const coilGeo = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb45309 }); // Copper color
    
    const coilTop = new THREE.Mesh(coilGeo, coilMat);
    coilTop.position.set(0, 1.2, 0);
    scene.add(coilTop);

    const coilBottom = new THREE.Mesh(coilGeo, coilMat);
    coilBottom.position.set(0, -1.2, 0);
    scene.add(coilBottom);

    // Fluid (Water)
    const fluidGeo = new THREE.CylinderGeometry(0.9, 0.9, 4, 32, 1, false, 0, Math.PI);
    const fluidMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.6,
        transmission: 0.5,
        roughness: 0.1
    });
    const fluid = new THREE.Mesh(fluidGeo, fluidMat);
    fluid.rotation.z = Math.PI / 2;
    scene.add(fluid);
    fluidRef.current = fluid;

    // Particles to show flow
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2; // Initial random positions
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Magnetic Field Lines (Visual)
    const fieldLinesGroup = new THREE.Group();
    scene.add(fieldLinesGroup);
    for(let i=-0.5; i<=0.5; i+=0.25) {
        for(let j=-0.5; j<=0.5; j+=0.25) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, 1, j),
                new THREE.Vector3(i, -1, j)
            ]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 });
            fieldLinesGroup.add(new THREE.Line(lineGeo, lineMat));
        }
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Fluid Visibility
      if (currentState.testPhase === 'EmptyPipe') {
          fluid.visible = false;
          particles.visible = false;
      } else {
          fluid.visible = true;
          particles.visible = currentState.flowRate > 0;
      }

      // Animate Particles
      if (particles.visible && particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const speed = currentState.flowRate * 0.005; // Scale speed for visual
          for(let i = 0; i < particleCount; i++) {
              positions[i*3] += speed; // Move along X axis
              if (positions[i*3] > 2) {
                  positions[i*3] = -2; // Reset to start
                  // Randomize Y and Z within the pipe radius
                  const angle = Math.random() * Math.PI;
                  const radius = Math.random() * 0.8;
                  positions[i*3+1] = Math.sin(angle) * radius;
                  positions[i*3+2] = Math.cos(angle) * radius;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Update Electrode Color based on coating
      const coatingColor = new THREE.Color(0x78716c); // Dirty/scaled color
      const cleanColor = new THREE.Color(0xfacc15);
      const mixRatio = currentState.electrodeCoating / 100;
      (electrodeA.material as THREE.MeshStandardMaterial).color.lerpColors(cleanColor, coatingColor, mixRatio);
      (electrodeB.material as THREE.MeshStandardMaterial).color.lerpColors(cleanColor, coatingColor, mixRatio);

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

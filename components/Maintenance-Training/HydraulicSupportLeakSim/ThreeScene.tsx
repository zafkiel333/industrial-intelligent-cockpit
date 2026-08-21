import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SupportState } from './three-types';

interface ThreeSceneProps {
  state: SupportState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SupportState>(state);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Cylinder Outer Shell
    const outerGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
    const outerMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      transparent: true, 
      opacity: 0.8,
      metalness: 0.6,
      side: THREE.DoubleSide
    });
    const outerCylinder = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerCylinder);

    // Inner Piston Rod
    const rodGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = 2; // Extended
    scene.add(rod);

    // Piston Head (Seal area)
    const headGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.5, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = -1.5;
    rod.add(head);

    // Fluid Particles (for leak simulation)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2.8; // Spread within cylinder
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Handle Cross Section View
      if (currentState.crossSection) {
        outerMat.opacity = 0.2;
        outerMat.wireframe = true;
      } else {
        outerMat.opacity = 0.8;
        outerMat.wireframe = false;
      }

      // Handle Leak Animation
      if (currentState.leaking) {
        particles.visible = true;
        const positions = particlesGeo.attributes.position.array as Float32Array;
        for(let i=1; i < particleCount * 3; i+=3) {
            positions[i] += 0.05; // Move up
            // Reset if it goes past the seal
            if (positions[i] > head.position.y + rod.position.y + 1) {
                positions[i] = head.position.y + rod.position.y - 1; // Start below seal
                positions[i-1] = (Math.random() - 0.5) * 2.8; // X
                positions[i+1] = (Math.random() - 0.5) * 2.8; // Z
            }
        }
        particlesGeo.attributes.position.needsUpdate = true;
      } else {
        particles.visible = false;
      }

      // Rotate scene slowly for better view
      scene.rotation.y += 0.005;

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

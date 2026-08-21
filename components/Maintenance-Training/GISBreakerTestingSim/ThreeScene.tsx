import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BreakerState } from './three-types';

interface ThreeSceneProps {
  state: BreakerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BreakerState>(state);

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
    camera.position.set(0, 2, 12);
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

    // GIS Enclosure (Transparent)
    const enclosureGeo = new THREE.CylinderGeometry(2.5, 2.5, 10, 32);
    const enclosureMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x94a3b8, 
      transparent: true, 
      opacity: 0.2,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.8
    });
    const enclosure = new THREE.Mesh(enclosureGeo, enclosureMat);
    enclosure.rotation.z = Math.PI / 2;
    scene.add(enclosure);

    // Fixed Contact (Left)
    const fixedContactGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
    const contactMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 }); // Copper/Gold
    const fixedContact = new THREE.Mesh(fixedContactGeo, contactMat);
    fixedContact.rotation.z = Math.PI / 2;
    fixedContact.position.x = -3;
    scene.add(fixedContact);

    // Moving Contact (Right)
    const movingContactGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    const movingContact = new THREE.Mesh(movingContactGeo, contactMat);
    movingContact.rotation.z = Math.PI / 2;
    scene.add(movingContact);

    // Operating Rod
    const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.5 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    scene.add(rod);

    // SF6 Gas Particles
    const gasGeo = new THREE.BufferGeometry();
    const gasCount = 200;
    const gasPos = new Float32Array(gasCount * 3);
    for(let i=0; i<gasCount; i++) {
      gasPos[i*3] = (Math.random() - 0.5) * 8;
      gasPos[i*3+1] = (Math.random() - 0.5) * 4;
      gasPos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPos, 3));
    const gasMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.05, transparent: true, opacity: 0.5 });
    const gas = new THREE.Points(gasGeo, gasMat);
    scene.add(gas);

    // Arc Flash (Hidden by default)
    const arcGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.rotation.z = Math.PI / 2;
    arc.visible = false;
    scene.add(arc);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Map position (0-100) to X coordinate
      // 100 (Closed) -> x = -1 (touching fixed contact at x=-2)
      // 0 (Open) -> x = 3 (fully retracted)
      const targetX = 3 - (currentState.position / 100) * 4;
      
      movingContact.position.x = targetX;
      rod.position.x = targetX + 3; // Rod follows moving contact

      // Arc simulation during movement
      if (currentState.status === 'moving' && currentState.position > 10 && currentState.position < 90) {
        arc.visible = true;
        arc.position.x = (fixedContact.position.x + movingContact.position.x) / 2;
        arc.scale.y = Math.abs(fixedContact.position.x - movingContact.position.x) + 0.5;
        // Flicker effect
        arcMat.opacity = 0.5 + Math.random() * 0.5;
        arcGeo.scale(1, 1, 1 + Math.random() * 0.5);
      } else {
        arc.visible = false;
      }

      // Slowly rotate gas particles
      gas.rotation.x += 0.001;
      gas.rotation.y += 0.002;

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

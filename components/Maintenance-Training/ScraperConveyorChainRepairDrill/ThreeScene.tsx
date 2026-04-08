import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ChainState } from './three-types';

interface ThreeSceneProps {
  state: ChainState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ChainState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#18181b'); // zinc-900

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Create Chain Link Geometry
    const createLink = (color: number = 0x71717a) => {
      const group = new THREE.Group();
      const torusGeo = new THREE.TorusGeometry(1, 0.3, 16, 64);
      const torusMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.4 });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      // Stretch torus to look like a chain link
      torus.scale.set(1.5, 1, 1);
      group.add(torus);
      return group;
    };

    const link1 = createLink();
    const link2 = createLink(0xfacc15); // Connecting link (yellow)
    const link3 = createLink();

    // Initial positioning
    link1.position.x = -4;
    link3.position.x = 4;
    
    // Rotate alternating links
    link1.rotation.x = Math.PI / 2;
    link3.rotation.x = Math.PI / 2;

    scene.add(link1);
    scene.add(link3);

    // Tensioner Tool (Simple representation)
    const tensionerGroup = new THREE.Group();
    const rodGeo = new THREE.CylinderGeometry(0.1, 0.1, 8);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    tensionerGroup.add(rod);
    
    const hook1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), rodMat);
    const hook2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), rodMat);
    tensionerGroup.add(hook1);
    tensionerGroup.add(hook2);
    
    tensionerGroup.position.y = 1.5;
    scene.add(tensionerGroup);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Calculate positions based on tension (0 to 100)
      // Max gap is 8 (x: -4 to 4), Min gap is 2.5 (x: -1.25 to 1.25)
      const gap = 8 - (currentState.tension / 100) * 5.5;
      
      link1.position.x = -gap / 2;
      link3.position.x = gap / 2;

      // Update tensioner hooks
      hook1.position.x = -gap / 2;
      hook2.position.x = gap / 2;

      // Handle connecting link visibility
      if (currentState.step === 2) {
        scene.add(link2);
        link2.position.x = 0;
        tensionerGroup.visible = false;
      } else {
        scene.remove(link2);
        tensionerGroup.visible = currentState.step === 1;
      }

      // Gentle rotation for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
      scene.rotation.x = Math.cos(Date.now() * 0.0005) * 0.1;

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

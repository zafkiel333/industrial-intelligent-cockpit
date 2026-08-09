import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HullState } from './three-types';

interface ThreeSceneProps {
  state: HullState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<HullState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Hull Model (Segmented for bending)
    const hullGeometry = new THREE.BoxGeometry(20, 2, 4, 20, 1, 1);
    const hullMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    scene.add(hull);

    // Water Surface (Abstract)
    const waterGeom = new THREE.PlaneGeometry(40, 40, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true 
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { bendingAmplitude, frequency, waveHeight } = stateRef.current;
      const time = Date.now() * 0.001;

      // Bending Logic (Modify vertices)
      const positions = hull.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        // Vertical bending (hogging/sagging)
        const bend = Math.sin(time * frequency * Math.PI * 2) * bendingAmplitude * Math.cos((x / 10) * (Math.PI / 2));
        positions.setY(i, bend + (Math.abs(x) > 8 ? -0.5 : 0));
      }
      positions.needsUpdate = true;

      // Water Animation
      const waterPos = water.geometry.attributes.position;
      for (let i = 0; i < waterPos.count; i++) {
        const x = waterPos.getX(i);
        const z = waterPos.getZ(i);
        const h = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * waveHeight * 0.2;
        waterPos.setY(i, h);
      }
      waterPos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      // Cleanup scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="hull-3d-container" />;
};

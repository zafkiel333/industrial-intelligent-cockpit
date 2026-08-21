import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WindlassState } from './three-types';

interface ThreeSceneProps {
  state: WindlassState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<WindlassState>(state);

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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x00ffff, 1);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // Windlass Drum
    const drumGroup = new THREE.Group();

    const drumGeom = new THREE.CylinderGeometry(2, 2, 4, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    drumGroup.add(drum);

    // Drum Flanges
    const flangeGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const flange1 = new THREE.Mesh(flangeGeom, drumMat);
    flange1.rotation.z = Math.PI / 2;
    flange1.position.x = -2.1;
    drumGroup.add(flange1);

    const flange2 = new THREE.Mesh(flangeGeom, drumMat);
    flange2.rotation.z = Math.PI / 2;
    flange2.position.x = 2.1;
    drumGroup.add(flange2);

    scene.add(drumGroup);

    // Chain (Abstract)
    const chainGroup = new THREE.Group();
    scene.add(chainGroup);

    const linkGeom = new THREE.TorusGeometry(0.3, 0.1, 8, 20);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const links: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const link = new THREE.Mesh(linkGeom, linkMat);
      link.position.y = -i * 0.5;
      link.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
      chainGroup.add(link);
      links.push(link);
    }
    chainGroup.position.set(0, 2, 2);

    // Base Structure
    const baseGeom = new THREE.BoxGeometry(6, 1, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -2.5;
    scene.add(base);

    // Animation
    let drumRotation = 0;
    let chainOffset = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { speed, vibrationLevel, direction } = stateRef.current;
      
      if (direction !== 'stop') {
        const dirMult = direction === 'up' ? -1 : 1;
        const rotSpeed = (speed / 60) * (Math.PI * 2) * 0.016;
        drumRotation += rotSpeed * dirMult;
        drumGroup.rotation.x = drumRotation;

        chainOffset += rotSpeed * 2 * dirMult;
        links.forEach((link, i) => {
          link.position.y = ((-i * 0.5 + chainOffset) % 10) - 5;
        });
      }

      // Vibration Effect (Shake)
      if (vibrationLevel > 0) {
        const shake = Math.sin(Date.now() * 0.05) * vibrationLevel * 0.05;
        drumGroup.position.y = shake;
        drumGroup.position.z = Math.cos(Date.now() * 0.05) * vibrationLevel * 0.05;
      }

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

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="windlass-3d-container" />;
};

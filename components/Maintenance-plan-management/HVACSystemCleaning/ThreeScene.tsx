import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HVACSystemCleaningProps } from './three-types';

export const ThreeScene: React.FC<HVACSystemCleaningProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Duct Structure (Wireframe/Transparent)
    const ductGeo = new THREE.BoxGeometry(8, 6, 40);
    const ductMat = new THREE.MeshStandardMaterial({ 
      color: 0x445566, 
      transparent: true, 
      opacity: 0.2,
      wireframe: true
    });
    const duct = new THREE.Mesh(ductGeo, ductMat);
    scene.add(duct);

    // Cleaning Robot
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const bodyGeo = new THREE.BoxGeometry(3, 2, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00ffaa, metalness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -2;
    robotGroup.add(body);

    // Cleaning Brushes/Light cone
    const coneGeo = new THREE.ConeGeometry(3, 8, 16);
    const coneMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.3, 
      blending: THREE.AdditiveBlending 
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2;
    cone.position.set(0, -2, -4);
    robotGroup.add(cone);

    // Dust Particles
    const dustCount = 2000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustActive = new Float32Array(dustCount); // 1 = active, 0 = cleaned

    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 7.5;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 39;
      dustActive[i] = 1.0;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('active', new THREE.BufferAttribute(dustActive, 1));

    const dustMat = new THREE.PointsMaterial({ color: 0x887766, size: 0.2, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(dustGeo, dustMat);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { robotPosition, dustLevel, isCleaning } = propsRef.current;

      // Move robot
      const targetZ = 20 - (robotPosition / 100) * 40; // 0% = z:20, 100% = z:-20
      robotGroup.position.z += (targetZ - robotGroup.position.z) * 0.1;

      if (isCleaning) {
        cone.visible = true;
        // Pulse cone
        coneMat.opacity = 0.3 + Math.sin(time * 10) * 0.1;

        // Clean dust particles
        const positions = dustGeo.attributes.position.array as Float32Array;
        const actives = dustGeo.attributes.active.array as Float32Array;
        
        for (let i = 0; i < dustCount; i++) {
          if (actives[i] === 1.0) {
            const pz = positions[i * 3 + 2];
            // If particle is behind or inside the cleaning cone
            if (pz > robotGroup.position.z - 4) {
              actives[i] = 0.0; // Mark as cleaned
              positions[i * 3 + 1] = -100; // Move out of sight
            }
          }
        }
        dustGeo.attributes.position.needsUpdate = true;
        dustGeo.attributes.active.needsUpdate = true;
      } else {
        cone.visible = false;
      }

      // Overall dust opacity based on level
      dustMat.opacity = (dustLevel / 100) * 0.8;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      ductGeo.dispose();
      ductMat.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      coneGeo.dispose();
      coneMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

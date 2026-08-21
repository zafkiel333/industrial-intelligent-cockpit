import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FireExtinguishingSystemProps } from './three-types';

export const ThreeScene: React.FC<FireExtinguishingSystemProps> = (props) => {
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
    camera.position.set(0, 10, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 20, 10);
    scene.add(dirLight);

    // Cylinders
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);

    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 8, 32);
    const topGeo = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const valveGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);

    const cylinders: THREE.Group[] = [];
    const numCylinders = 6;
    const spacing = 3;
    const startX = -((numCylinders - 1) * spacing) / 2;

    for (let i = 0; i < numCylinders; i++) {
      const group = new THREE.Group();
      
      const mat = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.6, roughness: 0.3 });
      
      const body = new THREE.Mesh(cylinderGeo, mat);
      group.add(body);

      const top = new THREE.Mesh(topGeo, mat);
      top.position.y = 4;
      group.add(top);

      const valveMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 });
      const valve = new THREE.Mesh(valveGeo, valveMat);
      valve.position.y = 5.5;
      group.add(valve);

      group.position.set(startX + i * spacing, 0, 0);
      cylinderGroup.add(group);
      cylinders.push(group);
    }

    // Laser Scanner
    const laserGeo = new THREE.PlaneGeometry(0.1, 12);
    const laserMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    scene.add(laser);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { scanIndex, pressureLevel, isScanning } = propsRef.current;

      if (isScanning) {
        laser.visible = true;
        // Move laser to scanIndex
        const targetX = startX + scanIndex * spacing;
        laser.position.x += (targetX - laser.position.x) * 0.1;
        laser.position.y = Math.sin(time * 10) * 0.5; // Jitter

        // Highlight current cylinder
        cylinders.forEach((cyl, i) => {
          const bodyMat = (cyl.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
          const topMat = (cyl.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
          
          if (i === scanIndex) {
            if (pressureLevel < 80) {
              bodyMat.emissive.setHex(0x550000); // Low pressure warning
              topMat.emissive.setHex(0x550000);
            } else {
              bodyMat.emissive.setHex(0x002200); // OK
              topMat.emissive.setHex(0x002200);
            }
          } else {
            bodyMat.emissive.setHex(0x000000);
            topMat.emissive.setHex(0x000000);
          }
        });
      } else {
        laser.visible = false;
        cylinders.forEach(cyl => {
          ((cyl.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          ((cyl.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        });
      }

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
      cylinderGeo.dispose();
      topGeo.dispose();
      valveGeo.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      // Dispose materials inside cylinders
      cylinders.forEach(cyl => {
        (cyl.children[0] as THREE.Mesh).material.dispose();
        (cyl.children[2] as THREE.Mesh).material.dispose();
      });
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElectricShovelMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<ElectricShovelMaintenanceProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  // Update ref when props change to avoid re-initializing the scene
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Cleanup existing canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // Grid helper for sci-fi feel
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x003333);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    
    // Shovel Base
    const baseGeo = new THREE.BoxGeometry(6, 2, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    scene.add(base);

    // Arm
    const armGeo = new THREE.BoxGeometry(1, 10, 1);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.7, roughness: 0.3 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.y = 5;
    arm.rotation.z = Math.PI / 4;
    scene.add(arm);

    // Bucket
    const bucketGeo = new THREE.BoxGeometry(3, 2, 2);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.2 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(4, 8, 0);
    scene.add(bucket);

    // Cable
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(2, 6, 0);
    cable.rotation.z = -Math.PI / 4;
    scene.add(cable);

    const animateScene = (time) => {
      const { bucketLoad = 0, cableTension = 0, status } = propsRef.current;
      
      // Arm movement
      arm.rotation.z = Math.PI / 4 + Math.sin(time) * 0.2;
      bucket.position.x = 4 + Math.cos(time) * 1.5;
      bucket.position.y = 8 + Math.sin(time) * 1.5;
      
      // Cable tension visual
      cable.scale.x = 1 - (cableTension / 200);
      cable.scale.z = 1 - (cableTension / 200);

      if (status === '维护中') {
        armMat.color.setHex(0xffff00);
      } else if (status === '异常') {
        armMat.color.setHex(0xff0000);
      } else {
        armMat.color.setHex(0xffaa00);
      }
    };
  

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      animateScene(time);
      
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
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      
      // Dispose resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array ensures initialization only happens once

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

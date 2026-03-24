import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ isMoving?: boolean }> = ({ isMoving = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ isMoving });
  useEffect(() => {
    propsRef.current = { isMoving };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 5, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 辅助灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffb700, 2, 50, Math.PI / 6);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    const group = new THREE.Group();
    scene.add(group);

    // 1. 创建无限循环的轨道段
    const trackGroup = new THREE.Group();
    group.add(trackGroup);

    const createTrack = (zOffset: number) => {
      const railGeo = new THREE.BoxGeometry(0.1, 0.1, 10);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 1, roughness: 0.2 });
      
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(-0.8, -0.5, zOffset);
      const railR = railL.clone();
      railR.position.set(0.8, -0.5, zOffset);
      
      // 枕木
      const sleeperGeo = new THREE.BoxGeometry(2, 0.1, 0.2);
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      for(let i=0; i<10; i++) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(0, -0.6, zOffset - 5 + i);
        trackGroup.add(sleeper);
      }
      
      trackGroup.add(railL, railR);
    };

    // 生成前后两段轨道用于滚动
    createTrack(0);
    createTrack(10);
    createTrack(-10);

    // 2. 机车模型
    const locoGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.4, 1.2, 3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    locoGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
    const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 }));
    cabin.position.set(0, 1, 0.5);
    locoGroup.add(cabin);
    
    // 扫描雷达
    const scannerGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const scanner = new THREE.Mesh(scannerGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    scanner.position.set(0, 0.8, -1.2);
    locoGroup.add(scanner);

    // 扫描线特效
    const laserGeo = new THREE.ConeGeometry(3, 8, 32, 1, true);
    laserGeo.rotateX(Math.PI);
    laserGeo.translate(0, 4, 0);
    const laserMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0, 0.8, -1.2);
    laser.rotation.x = Math.PI / 3;
    locoGroup.add(laser);

    group.add(locoGroup);

    // 3. 隧道感环
    const tunnelGeo = new THREE.CylinderGeometry(4, 4, 40, 32, 1, true);
    tunnelGeo.rotateX(Math.PI / 2);
    const tunnelMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, transparent: true, opacity: 0.1 });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    scene.add(tunnel);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentIsMoving = propsRef.current.isMoving;

      if (currentIsMoving) {
        // 轨道向后滚动
        trackGroup.position.z += 0.1;
        if (trackGroup.position.z > 5) trackGroup.position.z = 0;
        
        // 扫描头旋转
        scanner.rotation.y += 0.1;
        laser.rotation.y += 0.02;
        
        // 随机震动
        locoGroup.position.y = Math.sin(Date.now() * 0.01) * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
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
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

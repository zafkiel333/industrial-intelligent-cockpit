import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ moveSpeed?: number }> = ({ moveSpeed = 1.0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ moveSpeed });
  useEffect(() => {
    propsRef.current = { moveSpeed };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(10, 6, 12);

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

    // 灯光环境
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xf59e0b, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 无限轨道滚动系统
    const trackGroup = new THREE.Group();
    mainGroup.add(trackGroup);

    const createTrack = (zOffset: number) => {
      const railGeo = new THREE.BoxGeometry(0.12, 0.1, 20);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 });
      
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(-0.8, 0, zOffset);
      const railR = railL.clone();
      railR.position.set(0.8, 0, zOffset);
      
      // 枕木
      const sleeperGeo = new THREE.BoxGeometry(2.4, 0.08, 0.4);
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      for(let i = -10; i < 10; i += 1.5) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(0, -0.05, zOffset + i);
        trackGroup.add(sleeper);
      }
      
      trackGroup.add(railL, railR);
    };

    createTrack(0);
    createTrack(20);
    createTrack(-20);

    // 2. 机车模型
    const loco = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    loco.add(body);
    
    // 激光扫描环
    const scanRingGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.z = -1.8;
    loco.add(scanRing);

    mainGroup.add(loco);

    // 3. 隧道光环 (点云模拟)
    const pointsCount = 3000;
    const pointsGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);
    for(let i = 0; i < pointsCount; i++) {
        const r = 5 + Math.random();
        const theta = Math.random() * Math.PI * 2;
        positions[i*3] = Math.cos(theta) * r;
        positions[i*3+1] = Math.sin(theta) * r + 1;
        positions[i*3+2] = (Math.random() - 0.5) * 60;
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.03, transparent: true, opacity: 0.1 });
    const tunnelPoints = new THREE.Points(pointsGeo, pointsMat);
    scene.add(tunnelPoints);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentMoveSpeed = propsRef.current.moveSpeed;

      // 滚动动画
      trackGroup.position.z += 0.1 * currentMoveSpeed;
      if (trackGroup.position.z > 15) trackGroup.position.z = 0;
      
      // 扫描波动
      scanRing.scale.set(1 + Math.sin(Date.now() * 0.01) * 0.1, 1 + Math.sin(Date.now() * 0.01) * 0.1, 1);
      scanRing.position.z = -1.8 + Math.sin(Date.now() * 0.005) * 1.5;

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

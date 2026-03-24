import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ isInspecting?: boolean }> = ({ isInspecting = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ isInspecting });
  useEffect(() => {
    propsRef.current = { isInspecting };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);

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

    // 1. 创建坝体地形 (多级子坝效果)
    const damGroup = new THREE.Group();
    const createDamStep = (y: number, scale: number, color: number) => {
      const geo = new THREE.CylinderGeometry(15 * scale, 20 * scale, 2, 6, 1, false);
      const mat = new THREE.MeshStandardMaterial({ 
        color, 
        wireframe: true,
        transparent: true, 
        opacity: 0.4 
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      damGroup.add(mesh);
    };

    createDamStep(0, 1.0, 0x334155);
    createDamStep(2, 0.8, 0x475569);
    createDamStep(4, 0.6, 0x64748b);
    scene.add(damGroup);

    // 2. 尾矿库积水区
    const waterGeo = new THREE.CylinderGeometry(10, 10, 0.5, 32);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x00e5ff, 
      transparent: true, 
      opacity: 0.6,
      shininess: 100 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(-5, 5, -5);
    scene.add(water);

    // 3. 卫星扫描平面 (垂直动态移动)
    const scanGeo = new THREE.PlaneGeometry(50, 2);
    const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff9d, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.3 
    });
    const scanLine = new THREE.Mesh(scanGeo, scanMat);
    scanLine.rotation.x = Math.PI / 2;
    scene.add(scanLine);

    // 4. 传感器监测点云
    const sensorCount = 12;
    const sensorsGeo = new THREE.BufferGeometry();
    const sensorPos = new Float32Array(sensorCount * 3);
    for(let i = 0; i < sensorCount; i++) {
      sensorPos[i*3] = (Math.random() - 0.5) * 20;
      sensorPos[i*3+1] = Math.random() * 5;
      sensorPos[i*3+2] = (Math.random() - 0.5) * 20;
    }
    sensorsGeo.setAttribute('position', new THREE.BufferAttribute(sensorPos, 3));
    const sensorsMat = new THREE.PointsMaterial({ color: 0xffb700, size: 0.8, map: createCircleTexture() });
    const sensorPoints = new THREE.Points(sensorsGeo, sensorsMat);
    scene.add(sensorPoints);

    function createCircleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'white'; ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00ff9d, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentIsInspecting = propsRef.current.isInspecting;

      if (currentIsInspecting) {
        // 卫星扫描线往复移动
        scanLine.position.z = Math.sin(Date.now() * 0.001) * 20;
        scanLine.visible = true;
      } else {
        scanLine.visible = false;
      }
      
      // 水面波动
      water.scale.y = 1 + Math.sin(Date.now() * 0.002) * 0.05;
      
      // 传感器闪烁
      sensorsMat.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;

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

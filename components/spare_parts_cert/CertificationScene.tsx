import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CertThreeProps } from './three-types';

export const CertificationScene: React.FC<CertThreeProps> = ({ 
  activePart, 
  isScanning,
  scanProgress
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // --- 核心几何体：数字化认证座 ---
    const platformGeo = new THREE.CylinderGeometry(4, 4.5, 0.5, 6);
    const platformMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      emissive: 0x0ea5e9, 
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -2;
    scene.add(platform);

    // 辅助环
    const ringGeo = new THREE.TorusGeometry(3.8, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.8;
    scene.add(ring);

    // --- 被检备件模型 (抽象工业组件) ---
    const partGroup = new THREE.Group();
    scene.add(partGroup);

    const bodyGeo = new THREE.BoxGeometry(3, 3, 3);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.4,
      thickness: 0.5,
      transparent: true,
      opacity: 0.6
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    partGroup.add(body);

    // 线框外层 (数字孪生感)
    const wireGeo = new THREE.BoxGeometry(3.1, 3.1, 3.1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    partGroup.add(wire);

    // --- 扫描激光面 ---
    const scanPlaneGeo = new THREE.PlaneGeometry(6, 6);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0 
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // 数据流粒子
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.03, color: 0x10b981, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      partGroup.rotation.y += 0.005;
      particles.rotation.y += 0.001;

      if (isScanning) {
        scanPlaneMat.opacity = 0.4 + Math.sin(time * 10) * 0.2;
        // 扫描面上下移动，根据 scanProgress 映射
        scanPlane.position.y = -1.5 + (scanProgress / 100) * 3;
        
        // 材质颜色反馈
        if (activePart?.type === 'oem') bodyMat.color.lerp(new THREE.Color(0x10b981), 0.05);
        else if (activePart?.type === 'substitute') bodyMat.color.lerp(new THREE.Color(0xf59e0b), 0.05);
      } else {
        scanPlaneMat.opacity = 0;
        bodyMat.color.lerp(new THREE.Color(0x475569), 0.05);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [isScanning, scanProgress, activePart]);

  return <div ref={mountRef} className="w-full h-full" />;
};
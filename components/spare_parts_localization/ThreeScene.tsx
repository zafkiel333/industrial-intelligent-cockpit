
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocalizationThreeProps } from './three-types';

export const LocalizationThreeScene: React.FC<LocalizationThreeProps> = ({ 
  activePart, 
  scanProgress,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业蓝图底座 ---
    const gridHelper = new THREE.GridHelper(20, 20, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const baseGeo = new THREE.CylinderGeometry(5, 5.2, 0.5, 6);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, transparent: true, opacity: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.2;
    scene.add(base);

    // --- 备件模型容器 ---
    const group = new THREE.Group();
    scene.add(group);

    // 动态生成几何体
    let geometry;
    if (activePart.type === 'runner') {
      geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
    } else if (activePart.type === 'bearing') {
      geometry = new THREE.TorusGeometry(2, 0.8, 16, 100);
    } else {
      geometry = new THREE.BoxGeometry(3, 3, 3);
    }

    // 1. "Ghost" 进口原件 (残缺感)
    const ghostMat = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const ghostMesh = new THREE.Mesh(geometry, ghostMat);
    group.add(ghostMesh);

    // 2. "Domestic" 国产重构件 (高科技感)
    const stdMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 1,
      transparent: true,
      opacity: 0
    });
    const stdMesh = new THREE.Mesh(geometry, stdMat);
    stdMesh.scale.setScalar(1.01);
    group.add(stdMesh);

    // --- 扫描平面 ---
    const scanPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // --- 数据粒子云 ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x0ea5e9, transparent: true, opacity: 0.4 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 10, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 模拟扫描逻辑
      const yScan = Math.sin(time * 1.5) * 3;
      scanPlane.position.y = yScan;
      
      // 控制国产件的显现 (基于 scanProgress 或模拟)
      stdMat.opacity = Math.min(0.7, scanProgress);
      ghostMat.opacity = 0.2 * (1 - scanProgress);

      group.rotation.y += 0.005;
      points.rotation.y += 0.001;
      
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
  }, [activePart, scanProgress]);

  return <div ref={mountRef} className="w-full h-full" />;
};

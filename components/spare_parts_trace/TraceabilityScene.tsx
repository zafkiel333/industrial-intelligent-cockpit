import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TraceThreeProps } from './three-types';

export const TraceabilityScene: React.FC<TraceThreeProps> = ({ 
  markers, 
  isScanning,
  scanProgress
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // --- 核心模型：水轮机叶片 (抽象表现) ---
    const partGeo = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
    const partMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.3,
      thickness: 1
    });
    const partMesh = new THREE.Mesh(partGeo, partMat);
    scene.add(partMesh);

    // 内部发光核心
    const coreGeo = new THREE.TorusKnotGeometry(1.9, 0.5, 128, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.1 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // --- 质量标记点 ---
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    markers.forEach(m => {
      const color = m.status === 'passed' ? 0x10b981 : 0xf59e0b;
      const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(markerGeo, markerMat);
      mesh.position.set(...m.position);
      markersGroup.add(mesh);

      // 扩散波纹
      const ringGeo = new THREE.TorusGeometry(0.25, 0.01, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(new THREE.Vector3(0,0,0));
      mesh.add(ring);
    });

    // --- 扫描光幕 ---
    const scanPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x10b981, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      partMesh.rotation.y += 0.002;
      coreMesh.rotation.y += 0.002;
      markersGroup.rotation.y += 0.002;

      if (isScanning) {
        scanPlaneMat.opacity = 0.2 + Math.sin(time * 10) * 0.1;
        scanPlane.position.y = -3 + (scanProgress / 100) * 6;
        partMat.emissive = new THREE.Color(0x0ea5e9);
        partMat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
      } else {
        scanPlaneMat.opacity = 0;
        partMat.emissiveIntensity = 0;
      }

      // 标记点跳动
      markersGroup.children.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
      });

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
  }, [isScanning, scanProgress, markers]);

  return <div ref={mountRef} className="w-full h-full" />;
};
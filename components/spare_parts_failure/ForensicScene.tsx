import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FailureAnalysisThreeProps } from './three-types';

export const ForensicScene: React.FC<FailureAnalysisThreeProps> = ({ 
  activePointId, 
  points, 
  isScanning,
  partType,
  onPointClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isScanning;

    // --- 环境光 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0x0ea5e9, 10, 50);
    spot.position.set(10, 10, 10);
    scene.add(spot);

    // --- 被分析部件 (模拟主轴) ---
    const partGroup = new THREE.Group();
    scene.add(partGroup);

    let geometry;
    if (partType === 'shaft') {
      geometry = new THREE.CylinderGeometry(1.5, 1.5, 10, 32);
    } else if (partType === 'gear') {
      geometry = new THREE.CylinderGeometry(4, 4, 1.5, 32);
    } else {
      geometry = new THREE.TorusGeometry(3, 1, 16, 100);
    }

    // 基础材质：半透明科技蓝
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 1,
      transparent: true,
      opacity: 0.6
    });
    const mainMesh = new THREE.Mesh(geometry, material);
    partGroup.add(mainMesh);

    // 线框外层
    const wireGeo = geometry.clone();
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.scale.setScalar(1.02);
    partGroup.add(wireMesh);

    // --- 失效风险点 ---
    const markers: THREE.Mesh[] = [];
    points.forEach(p => {
      const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const color = p.type === 'crack' ? 0xef4444 : (p.type === 'corrosion' ? 0xf59e0b : 0x8b5cf6);
      const markerMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.5 
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...p.position);
      marker.userData = { id: p.id };
      partGroup.add(marker);
      markers.push(marker);

      // 扩散环
      const ringGeo = new THREE.TorusGeometry(0.4, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(new THREE.Vector3(0,0,0));
      marker.add(ring);
    });

    // --- 扫描激光线 ---
    const scanPlaneGeo = new THREE.PlaneGeometry(12, 12);
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

    // 交互射束
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers);
      if (intersects.length > 0) {
        onPointClick(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (isScanning) {
        scanPlaneMat.opacity = 0.3 + Math.sin(time * 5) * 0.2;
        scanPlane.position.y = Math.sin(time * 2) * 5;
      } else {
        scanPlaneMat.opacity = 0;
      }

      partGroup.rotation.y += 0.002;
      
      markers.forEach((m, i) => {
        const isActive = m.userData.id === activePointId;
        m.scale.setScalar(isActive ? 1.5 + Math.sin(time * 10) * 0.2 : 1 + Math.sin(time * 3 + i) * 0.1);
        if (m.children[0]) {
          m.children[0].scale.setScalar(1 + Math.sin(time * 5) * 0.5);
          (m.children[0] as any).material.opacity = 0.5 - (Math.sin(time * 5) * 0.2);
        }
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
  }, [partType, isScanning, activePointId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ProcurementThreeProps } from './three-types';

export const ProcurementGlobeScene: React.FC<ProcurementThreeProps> = ({
  nodes,
  routes,
  activeOrderId,
  onNodeSelect,
  isSimulating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1020); // 深海蓝背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !activeOrderId;
    controls.autoRotateSpeed = 0.5;

    // --- 全局高亮照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const glowLight = new THREE.PointLight(0x3b82f6, 20, 60);
    glowLight.position.set(0, 0, 0);
    scene.add(glowLight);

    // --- 全息地球 ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const earthGeo = new THREE.SphereGeometry(10, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // 核心光球
    const innerGeo = new THREE.SphereGeometry(9.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05 });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // --- 节点 ---
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
        // 简单映射经纬度到坐标
        const phi = (90 - node.position[0]) * (Math.PI / 180);
        const theta = (node.position[1] + 180) * (Math.PI / 180);
        const pos = new THREE.Vector3(
            -(10 * Math.sin(phi) * Math.cos(theta)),
            10 * Math.cos(phi),
            10 * Math.sin(phi) * Math.sin(theta)
        );

        const color = node.risk === 'high' ? 0xef4444 : 0x10b981;
        const geo = new THREE.SphereGeometry(0.4, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ 
            color, 
            emissive: color, 
            emissiveIntensity: 1, 
            metalness: 0.8 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData = { id: node.id };
        globeGroup.add(mesh);
        nodeMeshes.push(mesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      nodeMeshes.forEach((m, i) => {
          m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.2);
          if (m.userData.id === activeOrderId) {
              m.scale.setScalar(2.0);
              (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 10);
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
  }, [nodes, activeOrderId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

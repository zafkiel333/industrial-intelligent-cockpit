import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MonitorThreeProps } from './three-types';

export const MonitoringScene: React.FC<MonitorThreeProps> = ({ 
  sensors, 
  activeSensorId, 
  onSensorSelect,
  systemLoad 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5 + systemLoad;

    // --- 核心工业构件 (模拟大型主轴组件) ---
    const assembly = new THREE.Group();
    scene.add(assembly);

    // 主轴
    const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.6
    });
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.z = Math.PI / 2;
    assembly.add(shaft);

    // 齿轮/盘件
    const discGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32);
    const disc1 = new THREE.Mesh(discGeo, metalMat);
    disc1.position.x = -2;
    disc1.rotation.z = Math.PI / 2;
    assembly.add(disc1);

    const disc2 = new THREE.Mesh(discGeo, metalMat);
    disc2.position.x = 2;
    disc2.rotation.z = Math.PI / 2;
    assembly.add(disc2);

    // 内部“神经”线框
    const wireGeo = new THREE.CylinderGeometry(1.6, 1.6, 8.2, 32, 1, true);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    assembly.add(wire);

    // --- 传感器节点 ---
    const sensorGroup = new THREE.Group();
    assembly.add(sensorGroup);

    const sensorMeshes: THREE.Mesh[] = [];

    sensors.forEach(s => {
      const color = s.status === 'optimal' ? 0x10b981 : (s.status === 'warning' ? 0xf59e0b : 0xef4444);
      const geo = new THREE.SphereGeometry(0.2, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...s.position);
      mesh.userData = { id: s.id };
      
      // 添加扩散光圈
      const ringGeo = new THREE.TorusGeometry(0.35, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      sensorGroup.add(mesh);
      sensorMeshes.push(mesh);
    });

    // --- 环境光效 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    // 交互射束
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sensorMeshes);
      if (intersects.length > 0) {
        onSensorSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      assembly.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      sensorGroup.children.forEach((s: any, i) => {
        const isActive = s.userData.id === activeSensorId;
        const pulse = Math.sin(time * (isActive ? 10 : 3) + i) * 0.1;
        s.scale.setScalar(1 + pulse);
        if (s.children[0]) {
          s.children[0].scale.setScalar(1 + Math.sin(time * 5) * 0.5);
          s.children[0].material.opacity = 0.5 - (s.children[0].scale.x - 1);
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
  }, [sensors, activeSensorId, systemLoad]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
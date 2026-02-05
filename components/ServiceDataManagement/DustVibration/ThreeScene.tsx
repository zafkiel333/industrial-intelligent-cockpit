
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DustVibrationProps, ReliabilityNode } from './three-types';

export const DustVibrationThreeScene: React.FC<DustVibrationProps> = ({ activeNodeId, vibrationIntensity = 1, onNodeSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: ReliabilityNode[] = [
    { id: 'v-sensor-01', position: [4, 2, 0], stressLevel: 0.8, sensorStatus: 'noisy', label: '主轴承振动传感器' },
    { id: 'd-filter-04', position: [-2, 5, 2], stressLevel: 0.4, sensorStatus: 'cleaning', label: '电控柜呼吸滤网' },
    { id: 'c-optical-09', position: [0, 8, -2], stressLevel: 0.9, sensorStatus: 'noisy', label: '光学测距模块' },
    { id: 'm-connector-12', position: [-5, 1, 0], stressLevel: 0.2, sensorStatus: 'stable', label: '高频信号连接器' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 12, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffd700, 50);
    spotLight.position.set(5, 15, 5);
    scene.add(spotLight);

    // 辅助背景：动态粒子（模拟数据流，而非粉尘）
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 30;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x475569, size: 0.1, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 抽象设备应力底座
    const baseGeo = new THREE.IcosahedronGeometry(5, 1);
    const baseMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    scene.add(base);

    // 创建可靠性节点
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(n => {
      const group = new THREE.Group();
      group.position.set(...n.position);

      const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ 
        color: n.stressLevel > 0.7 ? 0xef4444 : n.stressLevel > 0.4 ? 0xf59e0b : 0x10b981
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.userData = { id: n.id };
      group.add(sphere);
      nodeMeshes.push(sphere);

      // 应力环
      const ringGeo = new THREE.RingGeometry(0.5, 0.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      scene.add(group);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      // 模拟微震动效果
      base.rotation.y += 0.002;
      base.position.y = Math.sin(time * 10) * 0.02 * vibrationIntensity;
      
      particles.rotation.y += 0.001;
      
      nodeMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.1);
        m.parent?.children[1].scale.setScalar(1.5 + Math.sin(time * 2) * 0.5);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onNodeSelect, vibrationIntensity]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};

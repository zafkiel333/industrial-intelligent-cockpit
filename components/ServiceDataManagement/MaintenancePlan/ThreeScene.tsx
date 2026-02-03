
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MaintenancePlanProps, MaintenanceStageNode } from './three-types';

export const MaintenanceThreeScene: React.FC<MaintenancePlanProps> = ({ activeStageId, onStageSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const stages: MaintenanceStageNode[] = [
    { id: 'stage-1', name: '计划编排', status: 'planning', position: [0, 0, 8], progress: 100, taskCount: 12 },
    { id: 'stage-2', name: '资源派发', status: 'executing', position: [8, 0, 0], progress: 85, taskCount: 8 },
    { id: 'stage-3', name: '过程执行', status: 'executing', position: [0, 0, -8], progress: 62, taskCount: 15 },
    { id: 'stage-4', name: '闭环审计', status: 'auditing', position: [-8, 0, 0], progress: 40, taskCount: 5 },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 15, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光设计：冷暖对比
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0x6366f1, 20, 50);
    mainLight.position.set(0, 10, 0);
    scene.add(mainLight);

    // 背景网格装饰
    const grid = new THREE.GridHelper(30, 15, 0x1e293b, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    // 中心治理核心 (Governance Core)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(2, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      emissive: 0x6366f1,
      emissiveIntensity: 0.5
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // 旋转闭环轨道
    const orbitGeo = new THREE.TorusGeometry(8, 0.02, 16, 100);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    // 阶段节点
    const nodeMeshes: THREE.Mesh[] = [];
    stages.forEach((stage, idx) => {
      const stageGroup = new THREE.Group();
      stageGroup.position.set(...stage.position);

      const colorMap = {
        planning: 0x3b82f6,
        executing: 0xf59e0b,
        auditing: 0x8b5cf6,
        closed: 0x10b981
      };
      const color = colorMap[stage.status];

      // 阶段几何体：晶体结构
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat = new THREE.MeshPhongMaterial({
        color: stage.id === activeStageId ? 0xffffff : color,
        emissive: color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: stage.id };
      stageGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 进度环
      const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 100, (stage.progress / 100) * Math.PI * 2);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      stageGroup.add(ring);

      scene.add(stageGroup);

      // 流动粒子 (模拟任务传递)
      const dotGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.userData = { startIdx: idx, progress: Math.random() };
      scene.add(dot);
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
        onStageSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.z += 0.002;
      
      // 粒子沿轨道流动
      scene.children.forEach(child => {
        if (child.userData && child.userData.startIdx !== undefined) {
          child.userData.progress += 0.003;
          if (child.userData.progress > 1) child.userData.progress = 0;
          
          const angle = child.userData.progress * Math.PI * 2 + (child.userData.startIdx * Math.PI / 2);
          child.position.set(Math.cos(angle) * 8, Math.sin(time + child.userData.startIdx) * 0.2, Math.sin(angle) * 8);
        }
      });

      nodeMeshes.forEach((m, i) => {
        m.rotation.y += 0.01;
        m.position.y = Math.sin(time + i) * 0.1;
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
  }, [activeStageId, onStageSelect]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};

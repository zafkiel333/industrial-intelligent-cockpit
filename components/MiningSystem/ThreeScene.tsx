
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningSystemProps, SystemNode } from './three-types';

export const MiningSystemThreeScene: React.FC<MiningSystemProps> = ({ activeSystem, onSystemSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const systems: SystemNode[] = [
    { id: 'crushing', position: [-8, 0, 0], color: '#f59e0b', label: '破碎系统', dataCount: '450k+' },
    { id: 'conveying', position: [0, 0, 0], color: '#10b981', label: '输送系统', dataCount: '1.2M+' },
    { id: 'hoisting', position: [8, 0, 0], color: '#8b5cf6', label: '提升系统', dataCount: '890k+' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 18);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    pointLight.position.set(0, 10, 5);
    scene.add(pointLight);

    // 背景网格
    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    // 创建系统节点
    const meshes: THREE.Mesh[] = [];
    systems.forEach(sys => {
      // 数字化底座
      const geometry = new THREE.CylinderGeometry(2, 2.5, 1, 32);
      const material = new THREE.MeshPhongMaterial({
        color: sys.id === activeSystem ? sys.color : 0x1e293b,
        transparent: true,
        opacity: 0.8,
        emissive: sys.color,
        emissiveIntensity: sys.id === activeSystem ? 0.5 : 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...sys.position);
      mesh.userData = { id: sys.id };
      group.add(mesh);
      meshes.push(mesh);

      // 上方悬浮数据核心
      const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
      const coreMat = new THREE.MeshBasicMaterial({ color: sys.color, wireframe: true });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(sys.position[0], 2.5, sys.position[2]);
      group.add(core);

      // 连接线 (流光效果模拟)
      if (sys.id !== 'hoisting') {
        const lineGeo = new THREE.BoxGeometry(6, 0.1, 0.1);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(sys.position[0] + 4, 0, 0);
        group.add(line);
      }
    });

    // 射线检测
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onSystemSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      group.children.forEach((child, i) => {
        if (child.type === 'Mesh' && (child.geometry as any).type === 'IcosahedronGeometry') {
          child.rotation.y += 0.01;
          child.position.y = 2.5 + Math.sin(Date.now() * 0.002 + i) * 0.2;
        }
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
  }, [activeSystem]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};

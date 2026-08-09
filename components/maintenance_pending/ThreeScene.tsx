import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PendingThreeProps, PendingOrderNode } from './three-types';

export const PendingThreeScene: React.FC<PendingThreeProps> = ({ 
  orders = [
    { id: 'WO-101', reason: 'parts', pendingDays: 5, priority: 'high' },
    { id: 'WO-102', reason: 'expert', pendingDays: 12, priority: 'med' },
    { id: 'WO-103', reason: 'safety', pendingDays: 2, priority: 'low' },
    { id: 'WO-104', reason: 'parts', pendingDays: 8, priority: 'high' },
    { id: 'WO-105', reason: 'other', pendingDays: 15, priority: 'med' },
  ],
  onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.05 - Bug修复：使用ref保存实时值，避免依赖项变化触发useEffect重建场景
  // Bug情况：useEffect依赖orders/onNodeSelect导致变量反复变化时，3D场景被频繁重建，出现模型闪烁
  // Bug原因：orders为引用类型，每次父组件渲染可能生成新数组；onNodeSelect为回调函数，每次渲染也可能生成新函数，触发useEffect反复执行
  const ordersRef = useRef(orders);
  const onNodeSelectRef = useRef(onNodeSelect);
  
  // 实时更新ref值，不触发useEffect
  useEffect(() => {
    ordersRef.current = orders;
    onNodeSelectRef.current = onNodeSelect;
  }, [orders, onNodeSelect]);

  // 核心3D场景初始化：仅在挂载时执行一次，剔除易变依赖项
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===come from the wrong issue, mantenance-pending useEffect===")

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 10, 20);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Center Core (Time Axis)
    const coreGeo = new THREE.CylinderGeometry(0.1, 0.1, 15, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Decorative Rings
    const ringGeo = new THREE.TorusGeometry(8, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Nodes Group
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const clickableObjects: THREE.Object3D[] = [];

    // 提取节点更新逻辑，便于复用
    const updateNodes = () => {
      // 清空旧节点和连线
      nodesGroup.clear();
      clickableObjects.length = 0;

      const currentOrders = ordersRef.current;
      currentOrders.forEach((order, i) => {
        const angle = (i / currentOrders.length) * Math.PI * 2;
        const radius = 3 + (order.pendingDays * 0.4);
        const y = (order.pendingDays - 7.5); // Spread along Y axis

        const geo = new THREE.IcosahedronGeometry(0.6, 0);
        const color = order.priority === 'high' ? 0xef4444 : (order.priority === 'med' ? 0xf59e0b : 0x0ea5e9);
        const mat = new THREE.MeshPhongMaterial({ 
          color, 
          wireframe: true,
          emissive: color,
          emissiveIntensity: 0.5 
        });
        
        const node = new THREE.Mesh(geo, mat);
        node.position.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );
        node.userData = { id: order.id };
        nodesGroup.add(node);
        clickableObjects.push(node);

        // Connecting line to core
        const linePts = [new THREE.Vector3(0, y, 0), node.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });
        const conn = new THREE.Line(lineGeo, lineMat);
        nodesGroup.add(conn);
      });
    };

    // 初始化节点
    updateNodes();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 2, 50);
    point.position.set(0, 10, 10);
    scene.add(point);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);
      if (intersects.length > 0) {
        // 读取最新的onNodeSelect回调
        onNodeSelectRef.current?.(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      nodesGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01;
          child.rotation.x += 0.005;
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
      // 清理THREE资源，避免内存泄漏
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []); // 剔除orders/onNodeSelect依赖，仅在挂载/卸载时执行

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
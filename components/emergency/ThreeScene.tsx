import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencyThreeProps } from './three-types';

export const EmergencyThreeScene: React.FC<EmergencyThreeProps> = ({ 
  alerts = [
    { id: '1', position: [-3, 0, -2], level: 'P1' },
    { id: '2', position: [4, 0, 3], level: 'P2' },
    { id: '3', position: [0, 0, -5], level: 'P1' }
  ],
  onAlertSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // 2026.03.04 bug修复：useEffect因依赖项频繁变化导致反复触发，3D模型出现闪烁问题
  // bug原因：1. alerts为引用类型，父组件传递时易生成新引用；2. onAlertSelect为回调函数，每次渲染可能重新创建
  // 解决方案：使用ref保存最新props值，移除主useEffect的易变依赖项，仅保留稳定的mountRef依赖
  const alertsRef = useRef(alerts);
  const onAlertSelectRef = useRef(onAlertSelect);
  // 保存Three.js核心实例，方便后续更新标记点
  const threeInstanceRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: OrbitControls;
    markersGroup?: THREE.Group;
    alertMeshes?: THREE.Mesh[];
    raycaster?: THREE.Raycaster;
    mouse?: THREE.Vector2;
  }>({});

  // 单独更新ref保存最新props值，不触发主渲染逻辑
  useEffect(() => {
    alertsRef.current = alerts;
    onAlertSelectRef.current = onAlertSelect;
    
    // 当alerts变化时，更新3D标记点（不重建整个场景）
    if (threeInstanceRef.current.markersGroup && threeInstanceRef.current.alertMeshes) {
      const { markersGroup, alertMeshes } = threeInstanceRef.current;
      
      // 清空原有标记点
      alertMeshes.forEach(mesh => markersGroup.remove(mesh));
      markersGroup.children.forEach(child => {
        if ((child as any).userData.isRipple) markersGroup.remove(child);
      });
      threeInstanceRef.current.alertMeshes = [];

      // 创建新的标记点
      alertsRef.current.forEach(alert => {
        const height = alert.level === 'P1' ? 4 : 2;
        const color = alert.level === 'P1' ? 0xef4444 : 0xf59e0b;
        
        // Pulsating Tower
        const towerGeo = new THREE.CylinderGeometry(0.1, 0.5, height, 32, 1, true);
        const towerMat = new THREE.MeshBasicMaterial({ 
          color, transparent: true, opacity: 0.4, side: THREE.DoubleSide 
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(alert.position[0], height/2, alert.position[2]);
        tower.userData = { id: alert.id };
        markersGroup.add(tower);
        threeInstanceRef.current.alertMeshes?.push(tower);

        // Ground Ripple
        const ringGeo = new THREE.TorusGeometry(1, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI/2;
        ring.position.set(alert.position[0], 0.05, alert.position[2]);
        markersGroup.add(ring);
        (ring as any).userData = { isRipple: true, speed: 0.02 + Math.random() * 0.02 };
      });
    }
  }, [alerts, onAlertSelect]);

  console.log("===emergency useEffect===");

  // 主渲染逻辑：仅在挂载时执行一次（依赖仅为mountRef，引用稳定）
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 初始化Three.js核心对象
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 环境网格
    const grid = new THREE.GridHelper(20, 40, 0xef4444, 0x111827);
    grid.position.y = -0.01;
    scene.add(grid);

    // 底部基座
    const baseGeo = new THREE.CylinderGeometry(10, 10, 0.2, 6, 1);
    const baseMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, transparent: true, opacity: 0.8, wireframe: true 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.1;
    scene.add(base);

    // 告警标记组
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    const alertMeshes: THREE.Mesh[] = [];

    // 初始化告警标记点（使用ref中的初始值）
    alertsRef.current.forEach(alert => {
      const height = alert.level === 'P1' ? 4 : 2;
      const color = alert.level === 'P1' ? 0xef4444 : 0xf59e0b;
      
      // 告警塔体
      const towerGeo = new THREE.CylinderGeometry(0.1, 0.5, height, 32, 1, true);
      const towerMat = new THREE.MeshBasicMaterial({ 
        color, transparent: true, opacity: 0.4, side: THREE.DoubleSide 
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(alert.position[0], height/2, alert.position[2]);
      tower.userData = { id: alert.id };
      markersGroup.add(tower);
      alertMeshes.push(tower);

      // 地面波纹
      const ringGeo = new THREE.TorusGeometry(1, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI/2;
      ring.position.set(alert.position[0], 0.05, alert.position[2]);
      markersGroup.add(ring);
      (ring as any).userData = { isRipple: true, speed: 0.02 + Math.random() * 0.02 };
    });

    // 光源
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const redPoint = new THREE.PointLight(0xef4444, 10, 20);
    redPoint.position.set(0, 5, 0);
    scene.add(redPoint);

    // 射线检测（点击交互）
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      // 使用ref中最新的alertMeshes
      const targetMeshes = threeInstanceRef.current.alertMeshes || alertMeshes;
      const intersects = raycaster.intersectObjects(targetMeshes);
      if (intersects.length > 0) {
        // 调用ref中最新的回调函数
        onAlertSelectRef.current?.(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // 保存实例到ref，供后续更新使用
    threeInstanceRef.current = {
      scene, camera, renderer, controls, markersGroup, alertMeshes, raycaster, mouse
    };

    // 动画循环
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.05;

      // 波纹动画
      markersGroup.children.forEach((child: any) => {
        if (child.userData.isRipple) {
          child.scale.setScalar(1 + Math.sin(frame * child.userData.speed) * 0.5);
          child.material.opacity = 1 - (child.scale.x - 0.5) / 1.5;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小适配
    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
      // 清理Three.js资源，避免内存泄漏
      renderer.dispose();
      scene.clear();
    };
  }, [mountRef]); // 仅依赖稳定的mountRef，确保只执行一次

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
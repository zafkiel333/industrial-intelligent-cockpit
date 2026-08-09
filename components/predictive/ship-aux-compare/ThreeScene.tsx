
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AuxCompareAnimatables, AuxSystemNode } from './three-types';

interface ThreeSceneProps {
  systems: Array<{ id: string; name: string; health: number; status: any }>;
  activeId?: string;
  onNodeSelect?: (id: string) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  systems, 
  activeId,
  onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ship-aux-compare useEffect===");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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

    // --- 全息环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x0ea5e9, 20, 50);
    cyanPoint.position.set(-10, 5, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: AuxCompareAnimatables = { systemNodes: [] };
    const disposables: any[] = [];

    // --- 1. 创建系统节点阵列 (Circular Layout) ---
    const nodeCount = systems.length;
    const radius = 8;
    
    systems.forEach((sys, i) => {
        const angle = (i / nodeCount) * Math.PI * 2;
        const nodeGroup = new THREE.Group();
        
        // 计算位置
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        nodeGroup.position.set(x, 0, z);

        // 核心几何体 (根据健康度改变颜色)
        const healthColor = new THREE.Color();
        if (sys.health > 85) healthColor.setHex(0x10b981);
        else if (sys.health > 60) healthColor.setHex(0xf59e0b);
        else healthColor.setHex(0xef4444);

        // 不同的形状代表不同系统
        let geometry;
        if(i === 0) geometry = new THREE.IcosahedronGeometry(1.2, 1);
        else if (i === 1) geometry = new THREE.OctahedronGeometry(1.2, 0);
        else if (i === 2) geometry = new THREE.SphereGeometry(1.2, 16, 16);
        else geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

        const coreMat = new THREE.MeshStandardMaterial({ 
            color: 0x334155, 
            emissive: healthColor,
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1,
            wireframe: true
        });
        const core = new THREE.Mesh(geometry, coreMat);
        nodeGroup.add(core);

        // 外层全息光环
        const haloGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 50);
        haloGeo.rotateX(Math.PI / 2);
        const haloMat = new THREE.MeshBasicMaterial({ 
            color: healthColor, 
            transparent: true, 
            opacity: 0.3 
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        nodeGroup.add(halo);
        
        // 连接到中心的线
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(-x, 0, -z)]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.2 });
        const connector = new THREE.Line(lineGeo, lineMat);
        nodeGroup.add(connector);

        group.add(nodeGroup);
        animatables.systemNodes.push({
            id: sys.id,
            name: sys.name,
            group: nodeGroup,
            core,
            halo,
            status: sys.status,
            health: sys.health
        });
        
        disposables.push(geometry, coreMat, haloGeo, haloMat, lineGeo, lineMat);
    });

    // --- 2. 中心能量球 (Main Engine Hub) ---
    const hubGeo = new THREE.SphereGeometry(2, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.8,
        wireframe: true
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    group.add(hub);
    disposables.push(hubGeo, hubMat);

    // --- 3. 全局扫描波 (Scanning Grid) ---
    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -3;
    scene.add(grid);
    disposables.push(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 节点动态行为
      animatables.systemNodes.forEach((node, i) => {
          const isActive = node.id === activeId;
          
          // 悬浮晃动
          node.group.position.y = Math.sin(time * 2 + i) * 0.5;
          
          // 核心旋转
          node.core.rotation.y += 0.01;
          node.core.rotation.x += 0.005;

          // 激活状态增强
          if (isActive) {
              node.core.scale.setScalar(1.2 + Math.sin(time * 10) * 0.05);
              node.halo.scale.setScalar(1.2 + Math.cos(time * 5) * 0.1);
              node.halo.material.opacity = 0.6 + Math.sin(time * 5) * 0.2;
          } else {
              node.core.scale.setScalar(1.0);
              node.halo.scale.setScalar(1.0);
              node.halo.material.opacity = 0.2;
          }
      });

      // 中心球脉动
      hub.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
      hub.rotation.y -= 0.005;

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [systems, activeId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

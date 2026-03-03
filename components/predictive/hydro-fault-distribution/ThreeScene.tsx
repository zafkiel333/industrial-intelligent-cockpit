import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FaultDistSceneProps } from './three-types';

export const FaultDistThreeScene: React.FC<FaultDistSceneProps> = ({ 
  nodes, 
  activeFilter,
  scanProgress,
  showGrid
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Group | null>(null);
  const scannerRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-Fault-Distribution useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.03); // 降低雾的浓度（0.04→0.03），减少暗化效果
    // 新增：提升场景背景亮度（可选，若需要更亮的底色）
    scene.background = new THREE.Color(0x0a101f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.4; // 新增：提升全局曝光度，整体更亮
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // ========== 核心光线调整部分 ==========
    // 1. 环境光：大幅提升强度（0.8→1.2），作为全局基础光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
    scene.add(ambientLight);

    // 2. 主点光源：提升强度（5→7）+ 扩大照明范围（200→250）
    const pointLight = new THREE.PointLight(0xffffff, 7, 250); 
    pointLight.position.set(15, 30, 15);
    scene.add(pointLight);

    // 3. 辅助点光源：提升强度（3→5）+ 扩大范围（150→200），补充暗部
    const secondaryPointLight = new THREE.PointLight(0xffffff, 5, 200);
    secondaryPointLight.position.set(-15, 25, -15);
    scene.add(secondaryPointLight);

    // 4. 方向光：大幅提升强度（1.2→2.0）+ 优化位置，增强漫射光覆盖
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    // 新增：柔化阴影边缘，避免过暗的阴影区域
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // 5. 新增填充光（可选）：极低强度、超大范围，消除最后暗部死角
    const fillLight = new THREE.PointLight(0xffffff, 1.5, 300);
    fillLight.position.set(0, 15, 0); // 中心低位，均匀填充底部暗区
    scene.add(fillLight);
    // ========== 光线调整结束 ==========

    // 1. 坐标参考系
    if (showGrid) {
        const gridHelper = new THREE.GridHelper(30, 10, 0x1e293b, 0x0f172a);
        scene.add(gridHelper);
    }

    // 2. 数据节点组（完全保留原有逻辑，不修改材质/色彩）
    const pointGroup = new THREE.Group();
    pointsRef.current = pointGroup;
    scene.add(pointGroup);

    const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
    
    nodes.forEach(node => {
        let color = 0x0ea5e9; // TP: Blue
        if (node.type === 'FP') color = 0xf59e0b; // FP: Orange
        if (node.type === 'FN') color = 0xef4444; // FN: Red
        if (node.type === 'TN') color = 0x334155; // TN: Dark Slate

        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: node.type === 'TP' ? 0.2 : 0.8,
            transparent: true,
            opacity: 0.8
        });

        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(node.x, node.y, node.z);
        mesh.userData = { type: node.type };
        pointGroup.add(mesh);

        if (node.type === 'FP' || node.type === 'FN') {
            const glowGeo = new THREE.SphereGeometry(0.7, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);
        }
    });

    // 3. 审计扫描线 (Audit Scanner)
    const scanGeo = new THREE.BoxGeometry(32, 0.1, 32);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scannerRef.current = scanner;
    scene.add(scanner);

    // --- 动画 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      if (scannerRef.current) {
          scannerRef.current.position.y = Math.sin(time) * 10;
      }

      if (pointsRef.current) {
          pointsRef.current.children.forEach((mesh: any) => {
              const type = mesh.userData.type;
              if (activeFilter === 'all') {
                  mesh.visible = true;
              } else {
                  mesh.visible = type === activeFilter;
              }

              if (type === 'FN' || type === 'FP') {
                  mesh.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
              }
          });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [nodes, activeFilter, showGrid]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
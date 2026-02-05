
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

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
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

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    // 1. 坐标参考系
    if (showGrid) {
        const gridHelper = new THREE.GridHelper(30, 10, 0x1e293b, 0x0f172a);
        scene.add(gridHelper);
    }

    // 2. 数据节点组
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

        // 如果是异常点（误报或漏报），增加光晕
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

      // 扫描线上下移动
      if (scannerRef.current) {
          scannerRef.current.position.y = Math.sin(time) * 10;
      }

      // 根据过滤器隐藏/显示点
      if (pointsRef.current) {
          pointsRef.current.children.forEach((mesh: any) => {
              const type = mesh.userData.type;
              if (activeFilter === 'all') {
                  mesh.visible = true;
              } else {
                  mesh.visible = type === activeFilter;
              }

              // 呼吸动画
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

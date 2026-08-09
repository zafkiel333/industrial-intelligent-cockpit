import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HoistGearboxSceneProps } from './three-types';

export const HoistGearboxThreeScene: React.FC<HoistGearboxSceneProps> = ({
  inputRpm,
  gears,
  isVibrating,
  viewMode,
  activeComponentId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const gearsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-hoist-gearbox useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 优化雾效：降低雾的密度，让远处更亮
    scene.background = new THREE.Color(0x020610);
    scene.fog = new THREE.FogExp2(0x020610, 0.01); // 原0.05 → 0.01，雾更淡

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 提升曝光度：增强整体亮度
    renderer.toneMappingExposure = 3.0; // 原1.8 → 3.0，大幅提升曝光

    // 清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 灯光系统全面升级 ---
    // 1. 环境光：大幅提升强度，提供基础均匀照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // 原0.4 → 1.2
    scene.add(ambientLight);

    // 2. 新增半球光：模拟天空光，增强顶部到底部的自然过渡照明
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5); // 强度1.5
    hemisphereLight.position.set(0, 10, 0); // 顶部位置
    scene.add(hemisphereLight);

    // 3. 青色点光：提升强度+调整位置，增强主照明
    const cyanLight = new THREE.PointLight(0x0ea5e9, 12, 60); // 原5 → 12，范围扩大
    cyanLight.position.set(8, 12, 8); // 略上调，覆盖更全面
    scene.add(cyanLight);

    // 4. 红色点光：提升强度，作为辅助照明
    const redLight = new THREE.PointLight(0xef4444, 6, 60); // 原2 → 6，范围扩大
    redLight.position.set(-8, 8, -8); // 略上调，减少阴影
    scene.add(redLight);

    // 5. 新增底部补光：消除底部阴影，提升整体亮度
    const bottomFillLight = new THREE.PointLight(0xffffff, 8, 50); // 白色补光，强度8
    bottomFillLight.position.set(0, -10, 0); // 底部中心位置
    scene.add(bottomFillLight);

    // --- 材质（完全未修改颜色属性）---
    const steelMat = new THREE.MeshPhysicalMaterial({
        color: 0x64748b,
        metalness: 1.0,
        roughness: 0.2,
        clearcoat: 1.0,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.3 : 1.0
    });
    
    const housingMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.5,
        roughness: 0.8,
        transparent: true,
        opacity: viewMode === 'mechanical' ? 0.2 : 0.8
    });

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. 外部箱体 (Housing)
    const housingGeo = new THREE.BoxGeometry(8, 6, 4);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    mainGroup.add(housing);

    // 2. 内部齿轮链 (Gear Train)
    const gearGroup = new THREE.Group();
    mainGroup.add(gearGroup);
    gearsRef.current = [];

    const createGear = (id: string, radius: number, x: number, y: number, z: number, color: number) => {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.userData = { id, radius };

        // 齿轮主体
        const gearGeo = new THREE.CylinderGeometry(radius, radius, 0.8, 32);
        gearGeo.rotateX(Math.PI / 2);
        const gearMesh = new THREE.Mesh(gearGeo, steelMat.clone());
        group.add(gearMesh);

        // 齿痕效果 (LineSegments)
        const edges = new THREE.EdgesGeometry(gearGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 }));
        group.add(line);

        gearGroup.add(group);
        gearsRef.current.push(group);
        return group;
    };

    // 输入轴齿轮
    createGear('input', 1.2, -2.5, 0, 0, 0x64748b);
    // 中间二级齿轮
    createGear('intermediate', 2.0, 0, 0, 0, 0x64748b);
    // 输出轴齿轮
    createGear('output', 2.8, 3.5, 0, 0, 0x64748b);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 齿轮旋转动画
      const rotBase = (inputRpm / 60) * 0.1;
      gearsRef.current.forEach(g => {
          const id = g.userData.id;
          const ratio = id === 'input' ? 1 : id === 'intermediate' ? -0.6 : 0.3;
          g.rotation.z += rotBase * ratio;

          // 振动视觉模拟
          if (isVibrating) {
              const gearData = gears.find(item => item.id === id);
              const amp = gearData ? (gearData.vibrationX / 10) : 0.05;
              g.position.y = Math.sin(time * 50) * amp;
          }

          // 选中及异常状态颜色映射
          const mesh = g.children[0] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          const gearData = gears.find(item => item.id === id);
          
          if (id === activeComponentId) {
              mat.emissive.setHex(0x0ea5e9);
              mat.emissiveIntensity = 0.5;
          } else if (gearData?.status !== 'normal') {
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = 0.8 + Math.sin(time * 10) * 0.2;
          } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
          }
      });

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
  }, [inputRpm, gears, isVibrating, viewMode, activeComponentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto" />;
};
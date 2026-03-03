import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MultiUnitSceneProps } from './three-types';

export const MultiUnitThreeScene: React.FC<MultiUnitSceneProps> = ({
  units,
  globalRisk,
  connectionStrength,
  activeLinkIndex
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const unitMeshesRef = useRef<THREE.Group[]>([]);
  const linksRef = useRef<THREE.Line[]>([]);
  
  // 2026.03.03 bug修复：创建ref保存实时变量值，避免依赖项变化触发useEffect重渲染
  // bug情况：useEffect依赖项（units、globalRisk、connectionStrength、activeLinkIndex）频繁变化导致useEffect反复触发，3D模型重复创建渲染出现闪烁
  // bug原因：依赖项变量每次更新都会触发useEffect重新执行，重新创建场景/相机/渲染器/模型等，导致渲染闪烁
  // 解决方案：使用ref同步实时变量值，原初始化逻辑仅执行一次，动画循环中读取ref最新值更新视觉状态
  const unitsRef = useRef(units);
  const activeLinkIndexRef = useRef(activeLinkIndex);
  const globalRiskRef = useRef(globalRisk);
  const connectionStrengthRef = useRef(connectionStrength);

  // 同步最新的变量值到ref，仅更新ref不触发场景重建
  useEffect(() => {
    unitsRef.current = units;
    activeLinkIndexRef.current = activeLinkIndex;
    globalRiskRef.current = globalRisk;
    connectionStrengthRef.current = connectionStrength;
  }, [units, globalRisk, connectionStrength, activeLinkIndex]);

  // 核心渲染逻辑：依赖项改为空数组，仅初始化一次，避免反复重建场景
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-multi-unit useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 30);
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

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x0ea5e9, 1.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(20, 30, 10);
    scene.add(pointLight);

    // 材质
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });

    // 1. 厂房基座
    const floor = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 15), concreteMat);
    floor.position.y = -0.5;
    scene.add(floor);

    // 2. 机组集群生成（初始化时基于初始units创建）
    unitMeshesRef.current = [];
    units.forEach((unit, i) => {
        const unitGroup = new THREE.Group();
        const xPos = -15 + i * 10;
        unitGroup.position.set(xPos, 0, 0);

        // 发电机罩
        const housing = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2.5, 4, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0x334155, 
                emissive: 0x0ea5e9, 
                emissiveIntensity: 0 
            })
        );
        housing.position.y = 2;
        unitGroup.add(housing);

        // 顶盖装饰
        const topRing = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.1, 16, 64),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
        );
        topRing.rotation.x = Math.PI / 2;
        topRing.position.y = 4;
        unitGroup.add(topRing);

        scene.add(unitGroup);
        unitMeshesRef.current.push(unitGroup);
    });

    // 3. 关联路径 (Risk Links)
    linksRef.current = [];
    for(let i=0; i<units.length-1; i++) {
        const points = [];
        points.push(new THREE.Vector3(-15 + i * 10, 2, -3));
        points.push(new THREE.Vector3(-15 + (i+1) * 10, 2, -3));
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const link = new THREE.Line(geo, lineMat.clone());
        scene.add(link);
        linksRef.current.push(link);
    }

    // 动画
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 更新机组状态视觉：读取ref.current获取最新的units值
      unitMeshesRef.current.forEach((group, i) => {
          // 防止units长度变化导致越界
          if (i >= unitsRef.current.length) return;
          const unit = unitsRef.current[i];
          const housing = group.children[0] as THREE.Mesh;
          const mat = housing.material as THREE.MeshStandardMaterial;

          // 风险渲染：风险越高越红，并产生呼吸灯效果
          const riskColor = new THREE.Color().lerpColors(
              new THREE.Color(0x0ea5e9), 
              new THREE.Color(0xef4444), 
              unit.riskLevel
          );
          mat.emissive.copy(riskColor);
          mat.emissiveIntensity = 0.2 + (unit.isPulsing ? Math.sin(time * 5) * 0.8 : 0);
          
          // 振动模拟
          if (unit.riskLevel > 0.6) {
              group.position.x = (-15 + i * 10) + Math.sin(time * 30) * 0.02 * unit.riskLevel;
          } else {
              // 恢复初始位置，避免振动后位置偏移
              group.position.x = -15 + i * 10;
          }
      });

      // 更新路径视觉：读取ref.current获取最新的activeLinkIndex值
      linksRef.current.forEach((link, i) => {
          const mat = link.material as THREE.LineBasicMaterial;
          const isActive = activeLinkIndexRef.current === i;
          mat.opacity = isActive ? 1.0 : 0.2;
          mat.color.setHex(isActive ? 0xf59e0b : 0x22d3ee);
          if (isActive) {
              link.scale.set(1, 1 + Math.sin(time*10)*0.2, 1);
          } else {
              // 恢复初始缩放，避免激活后缩放偏移
              link.scale.set(1, 1, 1);
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
  }, []); // 依赖项改为空数组，仅初始化一次

  return <div ref={mountRef} className="w-full h-full" />;
};
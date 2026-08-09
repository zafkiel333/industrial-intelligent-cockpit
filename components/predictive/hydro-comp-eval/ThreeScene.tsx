import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CompEvalSceneProps } from './three-types';

export const HydroCompEvalThreeScene: React.FC<CompEvalSceneProps> = ({ 
  units, 
  selectedUnitId, 
  onUnitSelect,
  globalFlowIntensity,
  showRiskZones
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  // 存储3D机组组的引用
  const unitGroupsRef = useRef<THREE.Group[]>([]);
  const flowRef = useRef<THREE.Points | null>(null);
  // 2026.03.03 - Bug修复：创建实时值引用，替代useEffect依赖项
  // Bug情况：3D模型频繁闪烁，每次渲染都会重新创建场景和模型
  // Bug原因：useEffect依赖项(units/selectedUnitId/globalFlowIntensity)频繁变化，导致useEffect反复触发，重建整个3D场景
  const unitsDataRef = useRef<typeof units>(units);
  const selectedUnitIdRef = useRef<typeof selectedUnitId>(selectedUnitId);
  const globalFlowIntensityRef = useRef<typeof globalFlowIntensity>(globalFlowIntensity);
  const showRiskZonesRef = useRef<typeof showRiskZones>(showRiskZones);

  // 2026.03.03 - 同步props值到ref，避免直接作为useEffect依赖
  useEffect(() => {
    unitsDataRef.current = units;
    // 当机组数据变化时，更新3D机组模型而不重建整个场景
    updateUnitGroups();
  }, [units]);

  useEffect(() => {
    selectedUnitIdRef.current = selectedUnitId;
  }, [selectedUnitId]);

  useEffect(() => {
    globalFlowIntensityRef.current = globalFlowIntensity;
  }, [globalFlowIntensity]);

  useEffect(() => {
    showRiskZonesRef.current = showRiskZones;
  }, [showRiskZones]);

  // 更新机组集群（复用已有场景，避免重建）
  const updateUnitGroups = () => {
    if (!sceneRef.current) return;
    
    // 移除旧机组
    unitGroupsRef.current.forEach(group => {
      sceneRef.current?.remove(group);
      // 释放几何和材质资源
      group.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    });
    unitGroupsRef.current = [];

    // 创建新机组（完全保留原有材质/色彩逻辑，无任何修改）
    unitsDataRef.current.forEach((u, i) => {
      const unitGroup = new THREE.Group();
      unitGroup.position.set(...u.position);
      unitGroup.userData = { id: u.id };

      // 核心机组几何 (简化塔型)
      const geo = new THREE.CylinderGeometry(1.5, 2, 6, 16);
      const color = u.status === 'normal' ? 0x10b981 : u.status === 'warning' ? 0xf59e0b : 0xef4444;
      const mat = new THREE.MeshStandardMaterial({ 
          color: 0x334155, 
          emissive: color, 
          emissiveIntensity: 0.2,
          metalness: 0.9,
          roughness: 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      unitGroup.add(mesh);

      // 顶端全息环
      const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 3.5;
      unitGroup.add(ring);

      // 健康值光柱 (向上延伸)
      const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, u.health / 10, 16);
      beamGeo.translate(0, u.health / 20 + 3.5, 0);
      const beamMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      unitGroup.add(beam);

      sceneRef.current.add(unitGroup);
      unitGroupsRef.current.push(unitGroup);
    });
  };

  // 初始化3D场景（仅执行一次）
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-comp-eval useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 创建场景（仅一次）
    const scene = new THREE.Scene();
    // 调整1：降低雾的密度（0.03→0.02），减少雾对画面的暗化效果
    scene.fog = new THREE.FogExp2(0x020617, 0.02);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 25, 45);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 调整2：提升全局曝光度（1.5→2.5），整体提亮画面且不改变色彩
    renderer.toneMappingExposure = 2.5;
    
    // 清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controlsRef.current = controls;

    // ===================== 核心光线调整（仅改这里） =====================
    // 1. 环境光：强度从0.3→0.8，提升全局基础亮度
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambientLight);

    // 2. 主点光源：强度从2→6，范围从100→150，位置微调更居中
    const mainLight = new THREE.PointLight(0x0ea5e9, 6, 150);
    mainLight.position.set(25, 45, 25);
    scene.add(mainLight);

    // 3. 新增辅助点光源（补暗部），平衡对角区域亮度
    const secondaryLight = new THREE.PointLight(0xffffff, 3, 120);
    secondaryLight.position.set(-20, 35, -20);
    scene.add(secondaryLight);

    // 4. 新增方向光（模拟漫射光），进一步提亮整体场景
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(15, 50, 15);
    scene.add(dirLight);
    // ===================================================================

    // 地面网格 (电子感)（保留原有样式，无修改）
    const grid = new THREE.GridHelper(100, 40, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // 初始化机组集群
    updateUnitGroups();

    // 能量流动粒子 (水流 -> 电能)（保留原有材质/色彩，无修改）
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 80;
        pPos[i*3+1] = (Math.random()-0.5) * 5;
        pPos[i*3+2] = (Math.random()-0.5) * 80;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.15,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    flowRef.current = particles;
    scene.add(particles);

    // --- 交互逻辑 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect || !cameraRef.current) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraRef.current);
        const hits = raycaster.intersectObjects(scene.children, true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && !target.userData.id) target = target.parent;
            if (target.userData.id) onUnitSelect(target.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- 动画循环（读取实时ref值）---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      
      // 更新控制器
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 粒子流动（读取实时流量强度）
      if (flowRef.current) {
          const pos = flowRef.current.geometry.attributes.position.array as Float32Array;
          const currentFlowIntensity = globalFlowIntensityRef.current;
          for(let i=0; i<pCount; i++) {
              pos[i*3+2] += currentFlowIntensity * 0.1;
              if (pos[i*3+2] > 40) pos[i*3+2] = -40;
          }
          flowRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 机组动画（读取实时选中状态和机组数据）
      const currentSelectedId = selectedUnitIdRef.current;
      unitGroupsRef.current.forEach((group, i) => {
          const id = group.userData.id;
          const u = unitsDataRef.current.find(item => item.id === id);
          const isSelected = currentSelectedId === id;
          
          // 选中高亮
          if (isSelected) {
              group.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
              group.children[1].rotation.z += 0.05; // 加速旋转全息环
          } else {
              group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
              group.children[1].rotation.z += 0.01;
          }

          // 风险呼吸感
          if (u?.status === 'critical') {
              const mat = (group.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
          }
      });

      // 渲染场景
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      
      // 释放资源
      if (sceneRef.current) {
        sceneRef.current.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
      }
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []); // 空依赖：仅初始化一次，避免重复执行

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
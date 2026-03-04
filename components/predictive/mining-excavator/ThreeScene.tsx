import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExcavatorSceneProps } from './three-types';

export const ExcavatorThreeScene: React.FC<ExcavatorSceneProps> = ({
  components,
  boomAngle,
  armAngle,
  bucketAngle,
  swingAngle,
  oilFlowIntensity,
  viewMode,
  selectedId,
  onSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const hydraulicLinesRef = useRef<THREE.Points | null>(null);
  const partMeshesRef = useRef<{ [key: string]: THREE.Group }>({});

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-excavator useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 优化雾效：降低雾密度，提升整体视野亮度
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.015); // 原0.03 → 0.015，雾更淡

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 16, 20);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 提升曝光度：增强整体亮度
    renderer.toneMappingExposure = 2.2; // 原1.5 → 2.2，曝光度提升
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

    // --- 光影优化：大幅提升强度 + 新增半球光/底部补光 ---
    // 1. 环境光：大幅提升基础亮度
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // 原0.4 → 1.2
    scene.add(ambientLight);

    // 2. 新增半球光：提供更自然的环境照明，补充顶部/底部环境光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); // 天空色/地面色/强度
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // 3. 顶部方向光：提升强度 + 优化位置
    const topLight = new THREE.DirectionalLight(0x38bdf8, 4.0); // 原2 → 4，强度翻倍
    topLight.position.set(15, 30, 15); // 位置上移，照明范围更广
    scene.add(topLight);

    // 4. 新增底部补光：解决底部暗部问题，提升整体亮度
    const bottomFillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    bottomFillLight.position.set(0, -20, 0);
    bottomFillLight.target.position.set(0, 0, 0); // 指向场景中心
    scene.add(bottomFillLight);
    scene.add(bottomFillLight.target); // 必须添加target到场景

    // 5. 故障灯：保持原有逻辑，不修改
    const faultLight = new THREE.PointLight(0xff0000, 0, 15);
    scene.add(faultLight);

    // --- 材质：完全保留原有属性，不修改颜色 ---
    const metalMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, metalness: 0.9, roughness: 0.2, transparent: viewMode !== 'structural', opacity: viewMode === 'structural' ? 1 : 0.2 
    });
    const pipeMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });

    const group = new THREE.Group();
    mainGroupRef.current = group;
    scene.add(group);

    // 1. 底盘 (Undercarriage)
    const chassis = new THREE.Group();
    const trackBase = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 10), metalMat);
    chassis.add(trackBase);
    group.add(chassis);

    // 2. 旋转平台 (Upper Structure)
    const upperWorks = new THREE.Group();
    upperWorks.position.y = 1.5;
    group.add(upperWorks);
    partMeshesRef.current['swing'] = upperWorks;

    const engineHouse = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 8), metalMat);
    engineHouse.position.z = -1;
    upperWorks.add(engineHouse);

    // 3. 工作装置 (Front Attachments)
    const boom = new THREE.Group();
    boom.position.set(0, 1.5, 3);
    upperWorks.add(boom);
    partMeshesRef.current['boom'] = boom;

    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.5), metalMat);
    boomMesh.position.y = 5;
    boomMesh.rotation.x = -Math.PI / 4;
    boom.add(boomMesh);

    const arm = new THREE.Group();
    arm.position.set(0, 8, 7);
    boom.add(arm);
    partMeshesRef.current['arm'] = arm;

    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 1.2), metalMat);
    armMesh.position.y = -3;
    armMesh.rotation.x = Math.PI / 3;
    arm.add(armMesh);

    const bucket = new THREE.Group();
    bucket.position.set(0, -6, 4);
    arm.add(bucket);
    partMeshesRef.current['bucket'] = bucket;

    const bucketMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), metalMat);
    bucket.add(bucketMesh);

    // 4. 液压粒子流 (仅在 hydraulic 模式显示)
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*1;
        pPos[i*3+1] = Math.random()*15;
        pPos[i*3+2] = (Math.random()-0.5)*1;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const flow = new THREE.Points(pGeo, pMat);
    flow.visible = viewMode === 'hydraulic';
    hydraulicLinesRef.current = flow;
    scene.add(flow);

    // 5. 地面
    const grid = new THREE.GridHelper(100, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -0.5;
    scene.add(grid);

    // 交互逻辑
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            // 简单逻辑：点击寻找父级ID
            onSelect(obj.parent?.userData.id || 'main-pump');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- 动画 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 部件动作同步
      upperWorks.rotation.y = (swingAngle * Math.PI) / 180;
      boom.rotation.x = -0.2 + Math.sin(time) * 0.2; // 模拟微动
      arm.rotation.x = 0.5 + Math.cos(time) * 0.2;

      // 异常部件闪烁
      components.forEach(comp => {
          const group = partMeshesRef.current[comp.id];
          if (group && comp.riskLevel === 'critical') {
              faultLight.position.set(group.position.x, group.position.y + 5, group.position.z);
              faultLight.intensity = 2 + Math.sin(time * 15) * 2;
          }
      });

      // 粒子流动画
      if (flow.visible) {
          const pos = flow.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += 0.1 * oilFlowIntensity;
              if (pos[i*3+1] > 15) pos[i*3+1] = 0;
          }
          flow.geometry.attributes.position.needsUpdate = true;
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
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode, components, oilFlowIntensity]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
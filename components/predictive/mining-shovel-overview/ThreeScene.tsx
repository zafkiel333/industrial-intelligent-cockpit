import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShovelOverviewSceneProps } from './three-types';

export const ShovelOverviewThreeScene: React.FC<ShovelOverviewSceneProps> = ({
  parts,
  swingAngle,
  hoistExtension,
  crowdExtension,
  viewMode,
  activePartId,
  onPartClick,
  isScanning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const upperWorksRef = useRef<THREE.Group | null>(null);
  const boomRef = useRef<THREE.Group | null>(null);
  const handleRef = useRef<THREE.Group | null>(null);
  const scanPlaneRef = useRef<THREE.Mesh | null>(null);

  // 2026.03.03 - Bug修复：模型闪烁问题
  // Bug情况：3D模型渲染时出现频繁闪烁
  // 原因：useEffect依赖项（viewMode、swingAngle、hoistExtension等）反复变化，导致useEffect频繁执行，重新创建场景/渲染器/模型等资源，引发闪烁
  // 解决方案：将动态变化的变量存入ref，使useEffect仅初始化一次，动画循环中读取ref的实时值，变量变化时仅更新对应属性而非重建整个场景

  // 保存动态变量的ref，用于在useEffect内部读取实时值
  const viewModeRef = useRef(viewMode);
  const swingAngleRef = useRef(swingAngle);
  const hoistExtensionRef = useRef(hoistExtension);
  const crowdExtensionRef = useRef(crowdExtension);
  const isScanningRef = useRef(isScanning);
  const activePartIdRef = useRef(activePartId);
  const partsRef = useRef(parts);

  // 保存各Mesh的ref，用于动态更新材质
  const crawlerRef = useRef<THREE.Mesh | null>(null);
  const houseRef = useRef<THREE.Mesh | null>(null);
  const boomBodyRef = useRef<THREE.Mesh | null>(null);
  const handleMeshRef = useRef<THREE.Mesh | null>(null);
  const bucketRef = useRef<THREE.Mesh | null>(null);

  // 更新材质的回调函数
  const updateMaterials = useCallback(() => {
    const getUpdatedMat = (id: string, color: number) => {
      const currentParts = partsRef.current;
      const currentActivePartId = activePartIdRef.current;
      const currentViewMode = viewModeRef.current;
      const part = currentParts.find(p => p.id === id);
      const isCritical = part?.status === 'critical';
      const isActive = currentActivePartId === id;

      if (currentViewMode === 'hologram') {
        return new THREE.MeshStandardMaterial({
          color: isActive ? 0xffffff : color,
          metalness: 0.1,
          roughness: 0.1,
          transparent: true,
          opacity: 0.2,
          wireframe: true,
          emissive: isCritical ? 0xff0000 : color,
          emissiveIntensity: 0.5
        });
      }

      if (currentViewMode === 'thermal') {
        const heatColor = new THREE.Color().setHSL(0.7 * (1 - (part?.temp || 40) / 120), 1, 0.5);
        return new THREE.MeshStandardMaterial({
          color: heatColor,
          emissive: heatColor,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.8
        });
      }

      return new THREE.MeshStandardMaterial({
        color: isActive ? 0xffffff : color,
        metalness: 0.8,
        roughness: 0.3,
        emissive: isCritical ? 0xff0000 : 0x000000,
        emissiveIntensity: isCritical ? 1.0 : 0
      });
    };

    // 更新各部件材质
    if (crawlerRef.current) crawlerRef.current.material = getUpdatedMat('propel', 0x334155);
    if (houseRef.current) houseRef.current.material = getUpdatedMat('swing', 0x475569);
    if (boomBodyRef.current) boomBodyRef.current.material = getUpdatedMat('hoist', 0x64748b);
    if (handleMeshRef.current) handleMeshRef.current.material = getUpdatedMat('crowd', 0x94a3b8);
    if (bucketRef.current) bucketRef.current.material = getUpdatedMat('dipper', 0xfacc15);
  }, []);

  // 同步ref与最新的props值
  useEffect(() => {
    viewModeRef.current = viewMode;
    swingAngleRef.current = swingAngle;
    hoistExtensionRef.current = hoistExtension;
    crowdExtensionRef.current = crowdExtension;
    isScanningRef.current = isScanning;
    activePartIdRef.current = activePartId;
    partsRef.current = parts;

    // 更新材质和扫描平面可见性
    updateMaterials();
    if (scanPlaneRef.current) scanPlaneRef.current.visible = isScanning;
  }, [viewMode, swingAngle, hoistExtension, crowdExtension, isScanning, activePartId, parts, updateMaterials]);

  // 初始化3D场景（仅执行一次）
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-shovel-overview useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 优化1：微调背景色（更亮一点），雾效密度降低（减少暗部遮挡）
    scene.background = new THREE.Color(0x0a1028);
    scene.fog = new THREE.FogExp2(0x0a1028, 0.01); // 原0.02 → 0.01（雾更淡）

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(30, 20, 40);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 优化2：提升曝光度（核心亮度提升）
    renderer.toneMappingExposure = 2.2; // 原1.5 → 2.2
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
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // --- 光照系统（核心优化） ---
    // 优化3：提升环境光强度（基础亮度翻倍）
    const ambientLight = new THREE.AmbientLight(0xffffff, 4.0); // 原2.4 → 4.0
    scene.add(ambientLight);

    // 优化4：新增半球光（模拟天空/地面漫反射补光）
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3.0);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // 优化5：提升原有蓝色点光源强度
    const bluePoint = new THREE.PointLight(0x0ea5e9, 18, 60); // 原10 → 18
    bluePoint.position.set(10, 15, 10);
    scene.add(bluePoint);

    // 优化6：提升原有辅助点光源强度
    const accentLight = new THREE.PointLight(0x8b5cf6, 10, 50); // 原5 → 10
    accentLight.position.set(-15, 5, -10);
    scene.add(accentLight);

    // 优化7：新增底部补光（解决底部暗部问题）
    const bottomFillLight = new THREE.PointLight(0xffffff, 8, 60);
    bottomFillLight.position.set(0, -5, 0);
    scene.add(bottomFillLight);

    // 优化8：新增顶部全局补光（进一步提升整体亮度）
    const topFillLight = new THREE.PointLight(0xf8fafc, 6, 80);
    topFillLight.position.set(0, 30, 0);
    scene.add(topFillLight);

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. 下部机构 (Crawler)
    const crawler = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 12), updateMaterials());
    crawler.position.y = 1.25;
    mainGroup.add(crawler);
    crawlerRef.current = crawler;

    // 2. 上部旋转平台 (Upper Works)
    const upperWorks = new THREE.Group();
    upperWorks.position.y = 2.5;
    upperWorksRef.current = upperWorks;
    mainGroup.add(upperWorks);

    const house = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 11), updateMaterials());
    house.position.y = 3;
    house.position.z = -1;
    upperWorks.add(house);
    houseRef.current = house;

    // 3. 动臂 (Boom)
    const boom = new THREE.Group();
    boom.position.set(0, 1.5, 4.5);
    boom.rotation.x = -Math.PI / 4.5;
    boomRef.current = boom;
    upperWorks.add(boom);

    const boomBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 22, 2.5), updateMaterials());
    boomBody.position.y = 11;
    boom.add(boomBody);
    boomBodyRef.current = boomBody;

    // 4. 斗杆与铲斗 (Dipper & Bucket)
    const handleGroup = new THREE.Group();
    handleGroup.position.y = 11; 
    handleRef.current = handleGroup;
    boom.add(handleGroup);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 15, 1.2), updateMaterials());
    handle.position.z = 5;
    handle.rotation.x = Math.PI / 2;
    handleGroup.add(handle);
    handleMeshRef.current = handle;

    const bucket = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), updateMaterials());
    bucket.position.set(0, 0, 12.5);
    handleGroup.add(bucket);
    bucketRef.current = bucket;

    // 5. 扫描线平面
    const scanGeo = new THREE.PlaneGeometry(30, 30);
    const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.15, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending 
    });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    scanner.visible = isScanningRef.current;
    scene.add(scanner);
    scanPlaneRef.current = scanner;

    // 6. 地面网格
    const grid = new THREE.GridHelper(100, 40, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 读取ref中的实时值进行动作插值同步
      if (upperWorksRef.current) {
        upperWorksRef.current.rotation.y = THREE.MathUtils.lerp(
          upperWorksRef.current.rotation.y, 
          (swingAngleRef.current * Math.PI) / 180, 
          0.1
        );
      }
      if (handleRef.current) {
          handleRef.current.position.z = THREE.MathUtils.lerp(
            handleRef.current.position.z, 
            2 + crowdExtensionRef.current * 6, 
            0.1
          );
          handleRef.current.rotation.x = THREE.MathUtils.lerp(
            handleRef.current.rotation.x, 
            (Math.PI / 2) + (hoistExtensionRef.current * 0.5), 
            0.1
          );
      }

      // 扫描动画（读取ref中的实时扫描状态）
      if (scanPlaneRef.current && isScanningRef.current) {
        scanPlaneRef.current.position.y = 10 + Math.sin(time * 3) * 10;
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
  }, []); // 依赖数组为空，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
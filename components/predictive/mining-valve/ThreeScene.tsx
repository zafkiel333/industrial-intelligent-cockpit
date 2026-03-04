import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ValveSceneProps } from './three-types';

export const HydraulicValveThreeScene: React.FC<ValveSceneProps> = ({
  spoolPosition,
  commandSignal,
  oilQuality,
  stictionRisk,
  viewMode,
  isDithering
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spoolRef = useRef<THREE.Group | null>(null);
  const frictionGlowRef = useRef<THREE.Mesh | null>(null);
  
  // 2026.03.04 - Bug修复：创建ref保存实时变化的props，避免useEffect因依赖项频繁变化反复执行
  // Bug原因：原useEffect依赖viewMode/spoolPosition/stictionRisk/isDithering，这些变量实时变化导致场景反复重建，出现模型闪烁
  const viewModeRef = useRef(viewMode);
  const spoolPositionRef = useRef(spoolPosition);
  const stictionRiskRef = useRef(stictionRisk);
  const isDitheringRef = useRef(isDithering);
  // 保存阀体材质引用，用于实时更新属性
  const housingMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // 仅更新ref值，不触发场景重建
  useEffect(() => {
    viewModeRef.current = viewMode;
    spoolPositionRef.current = spoolPosition;
    stictionRiskRef.current = stictionRisk;
    isDitheringRef.current = isDithering;
  }, [viewMode, spoolPosition, stictionRisk, isDithering]);

  // 场景初始化：依赖项改为空数组，仅执行一次
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-valve useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 2026.03.04 - 光照优化：调浅雾色+降低雾密度，提升整体亮度且保留氛围
    scene.background = new THREE.Color(0x0a101a); // 原0x02040a，调浅背景色提升基础亮度
    scene.fog = new THREE.FogExp2(0x0a101a, 0.02); // 原密度0.05→0.02，雾更淡，远处模型更清晰

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 2026.03.04 - 光照优化：提升曝光度，最大化整体亮度
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3.0; // 原2.0→3.0，大幅提升曝光度
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

    // --- 高级工业光影系统（2026.03.04 大幅强化） ---
    // 1. 新增环境光：提升基础照明，避免暗部过黑
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 新增，基础亮度补充
    scene.add(ambientLight);

    // 2. 半球光（环境基调）：强度大幅提升
    const hemiLight = new THREE.HemisphereLight(0x0ea5e9, 0x0a101a, 2.5); // 原1.5→2.5
    scene.add(hemiLight);

    // 3. 主点光源（电子蓝）：强度翻倍+范围扩大
    const mainLight = new THREE.PointLight(0xffffff, 80, 80); // 原50→80，范围50→80
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // 4. 辅助光（强调金属质感）：强度提升+范围扩大
    const accentLight = new THREE.PointLight(0x0ea5e9, 50, 60); // 原30→50，范围40→60
    accentLight.position.set(-10, 5, -5);
    scene.add(accentLight);

    // 5. 底部补光：强度翻倍+范围扩大，强化底部照明
    const bottomLight = new THREE.PointLight(0x3b82f6, 40, 40); // 原20→40，范围20→40
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);

    // 6. 新增顶部补光：解决顶部暗角，让亮度分布更均匀
    const topFillLight = new THREE.PointLight(0xffffff, 30, 50);
    topFillLight.position.set(0, 15, 0);
    scene.add(topFillLight);

    // --- 材质定义（完全保留原有颜色/属性，未做任何修改） ---
    const steelMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0, // 亮白金属（未修改）
        metalness: 1.0,
        roughness: 0.15,
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.05
    });

    // 初始化阀体材质，保存到ref供后续更新
    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b, // 未修改
        metalness: 0.4,
        roughness: 0.6,
        transparent: viewModeRef.current !== 'standard',
        opacity: viewModeRef.current === 'standard' ? 1.0 : 0.2,
        side: THREE.DoubleSide
    });
    housingMatRef.current = housingMat;

    // --- 模型构建（完全保留原有几何/颜色，未做任何修改） ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 阀体 (Housing) - 剖切面视觉
    const bodyGeo = new THREE.BoxGeometry(10, 4, 4);
    const body = new THREE.Mesh(bodyGeo, housingMat);
    mainGroup.add(body);

    // 2. 阀芯 (Spool)
    const spoolGroup = new THREE.Group();
    spoolRef.current = spoolGroup;
    mainGroup.add(spoolGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    spoolGroup.add(shaft);

    // 阀盘 (Lands) - 关键接触部位
    [-3, 0, 3].forEach(x => {
        const landGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.5, 32);
        landGeo.rotateZ(Math.PI / 2);
        const land = new THREE.Mesh(landGeo, steelMat);
        land.position.x = x;
        spoolGroup.add(land);

        // 卡阻摩擦高亮层
        const glowGeo = new THREE.CylinderGeometry(1.45, 1.45, 1.55, 32);
        glowGeo.rotateZ(Math.PI / 2);
        const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ 
          color: 0xef4444, transparent: true, opacity: 0 
        }));
        glow.position.x = x;
        glow.name = "stiction_glow";
        spoolGroup.add(glow);
    });

    // 3. 地面
    const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 2026.03.04 - 读取ref中的实时值，而非直接使用props
      const currentViewMode = viewModeRef.current;
      const currentSpoolPos = spoolPositionRef.current;
      const currentStictionRisk = stictionRiskRef.current;
      const currentIsDithering = isDitheringRef.current;

      // 实时更新阀体材质属性（响应viewMode变化）
      if (housingMatRef.current) {
        housingMatRef.current.transparent = currentViewMode !== 'standard';
        housingMatRef.current.opacity = currentViewMode === 'standard' ? 1.0 : 0.2;
        housingMatRef.current.needsUpdate = true; // 标记材质需要更新
      }

      // 阀芯位移（使用ref中的实时值）
      if (spoolRef.current) {
          const targetX = (currentSpoolPos / 100) * 2;
          const dither = currentIsDithering ? Math.sin(time * 60) * 0.03 : 0;
          spoolRef.current.position.x = THREE.MathUtils.lerp(spoolRef.current.position.x, targetX + dither, 0.1);
          
          // 卡阻高亮（使用ref中的实时值）
          spoolRef.current.children.forEach(child => {
              if (child.name === "stiction_glow") {
                  (child as THREE.Mesh).visible = currentStictionRisk > 0.3;
                  const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                  m.opacity = currentStictionRisk * (0.6 + Math.sin(time * 10) * 0.4);
                  m.needsUpdate = true; // 标记材质需要更新
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
  }, []); // 2026.03.04 - 依赖项改为空数组，仅初始化一次场景

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
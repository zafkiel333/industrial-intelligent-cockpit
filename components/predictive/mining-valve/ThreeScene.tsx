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

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-valve useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // --- 核心修复：光照映射与曝光控制 ---
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0; 
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

    // --- 高级工业光影系统 ---
    // 1. 半球光（环境基调）
    const hemiLight = new THREE.HemisphereLight(0x0ea5e9, 0x02040a, 1.5);
    scene.add(hemiLight);

    // 2. 主点光源（电子蓝）
    const mainLight = new THREE.PointLight(0xffffff, 50, 50);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // 3. 辅助光（强调金属质感）
    const accentLight = new THREE.PointLight(0x0ea5e9, 30, 40);
    accentLight.position.set(-10, 5, -5);
    scene.add(accentLight);

    // 4. 底部反光
    const bottomLight = new THREE.PointLight(0x3b82f6, 20, 20);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);

    // --- 材质定义 ---
    const steelMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0, // 亮白金属
        metalness: 1.0,
        roughness: 0.15,
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.05
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.4,
        roughness: 0.6,
        transparent: viewMode !== 'standard',
        opacity: viewMode === 'standard' ? 1.0 : 0.2,
        side: THREE.DoubleSide
    });

    // --- 模型构建 ---
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

      // 阀芯位移
      if (spoolRef.current) {
          const targetX = (spoolPosition / 100) * 2;
          const dither = isDithering ? Math.sin(time * 60) * 0.03 : 0;
          spoolRef.current.position.x = THREE.MathUtils.lerp(spoolRef.current.position.x, targetX + dither, 0.1);
          
          // 卡阻高亮
          spoolRef.current.children.forEach(child => {
              if (child.name === "stiction_glow") {
                  (child as THREE.Mesh).visible = stictionRisk > 0.3;
                  const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                  m.opacity = stictionRisk * (0.6 + Math.sin(time * 10) * 0.4);
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
  }, [viewMode, spoolPosition, stictionRisk, isDithering]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-shovel-overview useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(30, 20, 40);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
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

    // --- 光照系统 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const bluePoint = new THREE.PointLight(0x0ea5e9, 10, 60);
    bluePoint.position.set(10, 15, 10);
    scene.add(bluePoint);

    const accentLight = new THREE.PointLight(0x8b5cf6, 5, 50);
    accentLight.position.set(-15, 5, -10);
    scene.add(accentLight);

    // --- 材质生成器 ---
    const getMat = (id: string, color: number) => {
      const part = parts.find(p => p.id === id);
      const isCritical = part?.status === 'critical';
      const isActive = activePartId === id;

      if (viewMode === 'hologram') {
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

      if (viewMode === 'thermal') {
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

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. 下部机构 (Crawler)
    const crawler = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 12), getMat('propel', 0x334155));
    crawler.position.y = 1.25;
    mainGroup.add(crawler);

    // 2. 上部旋转平台 (Upper Works)
    const upperWorks = new THREE.Group();
    upperWorks.position.y = 2.5;
    upperWorksRef.current = upperWorks;
    mainGroup.add(upperWorks);

    const house = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 11), getMat('swing', 0x475569));
    house.position.y = 3;
    house.position.z = -1;
    upperWorks.add(house);

    // 3. 动臂 (Boom)
    const boom = new THREE.Group();
    boom.position.set(0, 1.5, 4.5);
    boom.rotation.x = -Math.PI / 4.5;
    boomRef.current = boom;
    upperWorks.add(boom);

    const boomBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 22, 2.5), getMat('hoist', 0x64748b));
    boomBody.position.y = 11;
    boom.add(boomBody);

    // 4. 斗杆与铲斗 (Dipper & Bucket)
    const handleGroup = new THREE.Group();
    handleGroup.position.y = 11; 
    handleRef.current = handleGroup;
    boom.add(handleGroup);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 15, 1.2), getMat('crowd', 0x94a3b8));
    handle.position.z = 5;
    handle.rotation.x = Math.PI / 2;
    handleGroup.add(handle);

    const bucket = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), getMat('dipper', 0xfacc15));
    bucket.position.set(0, 0, 12.5);
    handleGroup.add(bucket);

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
    scanner.visible = isScanning;
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

      // 动作插值同步
      if (upperWorksRef.current) upperWorksRef.current.rotation.y = THREE.MathUtils.lerp(upperWorksRef.current.rotation.y, (swingAngle * Math.PI) / 180, 0.1);
      if (handleRef.current) {
          handleRef.current.position.z = THREE.MathUtils.lerp(handleRef.current.position.z, 2 + crowdExtension * 6, 0.1);
          handleRef.current.rotation.x = THREE.MathUtils.lerp(handleRef.current.rotation.x, (Math.PI / 2) + (hoistExtension * 0.5), 0.1);
      }

      // 扫描动画
      if (scanPlaneRef.current && isScanning) {
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
  }, [viewMode, swingAngle, hoistExtension, crowdExtension, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

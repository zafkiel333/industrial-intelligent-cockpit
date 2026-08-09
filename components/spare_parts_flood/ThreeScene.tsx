import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FloodThreeProps } from './three-types';

export const FloodThreeScene: React.FC<FloodThreeProps> = ({ 
  waterLevel, 
  rainIntensity, 
  hotspots, 
  activePointId, 
  onPointClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // 2026.03.05 bug修复：使用ref存储实时值，避免依赖项变化触发useEffect重复执行导致模型闪烁
  // bug情况：原代码中useEffect依赖waterLevel/rainIntensity/hotspots/activePointId等变量，这些变量频繁变化会触发useEffect重新执行，导致整个Three场景反复创建和渲染，出现模型闪烁问题
  // bug原因：useEffect依赖项数组包含易变的基础类型/引用类型变量，每次变量变化都会重新执行useEffect，重建场景、相机、渲染器等核心对象，引发闪烁
  // 修复方案：使用ref存储实时值，主渲染逻辑的useEffect依赖置空，仅初始化一次；通过独立useEffect更新ref值，在动画循环中读取ref.current获取最新值
  const waterLevelRef = useRef(waterLevel);
  const rainIntensityRef = useRef(rainIntensity);
  const hotspotsRef = useRef(hotspots);
  const activePointIdRef = useRef(activePointId);

  // 存储Three.js核心对象的ref，方便跨useEffect访问
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const markerMeshesRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // 独立更新水位值ref
  useEffect(() => {
    waterLevelRef.current = waterLevel;
  }, [waterLevel]);

  // 独立更新降雨强度ref
  useEffect(() => {
    rainIntensityRef.current = rainIntensity;
  }, [rainIntensity]);

  // 独立更新激活点ID ref
  useEffect(() => {
    activePointIdRef.current = activePointId;
  }, [activePointId]);

  // 处理热点数据更新，重建标记点
  useEffect(() => {
    if (!sceneRef.current) return;
    hotspotsRef.current = hotspots;
    
    // 移除旧标记点
    markerMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    markerMeshesRef.current = [];

    // 创建新标记点
    hotspots.forEach(hp => {
      const color = hp.type === 'danger' ? 0xef4444 : 0x10b981;
      const markerGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const markerMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.5 
      });
      const mesh = new THREE.Mesh(markerGeo, markerMat);
      mesh.position.set(...hp.position);
      mesh.userData = { id: hp.id };
      
      // 增加雷达扩散圈
      const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      sceneRef.current?.add(mesh);
      markerMeshesRef.current.push(mesh);
    });
  }, [hotspots]);

  // 主渲染逻辑：仅初始化一次，依赖置空
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1a2a, 0.04);
    sceneRef.current = scene;

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 初始化控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.2;
    controlsRef.current = controls;

    // --- 1. 地形与堤坝模型 ---
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // 抽象河床
    const groundGeo = new THREE.PlaneGeometry(40, 40, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      wireframe: true,
      transparent: true,
      opacity: 0.2 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    terrainGroup.add(ground);

    // 堤坝主体 (Dam)
    const damGeo = new THREE.BoxGeometry(30, 8, 4);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(0, 2, 0);
    terrainGroup.add(dam);

    // --- 2. 动态水体 ---
    const waterGeo = new THREE.PlaneGeometry(30, 15);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transmission: 0.6,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0, -8); // 堤坝上游
    scene.add(water);
    waterRef.current = water;

    // --- 3. 降雨粒子系统 ---
    const rainCount = 1000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i+=3) {
      rainPos[i] = (Math.random() - 0.5) * 40;
      rainPos[i+1] = Math.random() * 20;
      rainPos[i+2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.05, transparent: true, opacity: 0.5 });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
    rainParticlesRef.current = rainParticles;

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0x0ea5e9, 2);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // 交互 - 点击监测点
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect || !cameraRef.current) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(markerMeshesRef.current);
      if (intersects.length > 0) {
        onPointClick(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // 动画循环
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // 读取实时水位值 - 模拟水位上涨 (y轴映射)
      if (waterRef.current) {
        const targetWaterY = -2 + waterLevelRef.current * 6;
        waterRef.current.position.y += (targetWaterY - waterRef.current.position.y) * 0.05;
        waterRef.current.position.y += Math.sin(time * 2) * 0.02; // 水面波动
      }

      // 读取实时降雨强度 - 降雨动画
      const currentRainIntensity = rainIntensityRef.current;
      if (rainParticlesRef.current && currentRainIntensity > 0) {
        const posArr = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<rainCount; i++) {
          posArr[i*3+1] -= 0.2 * currentRainIntensity; // 下落速度
          if (posArr[i*3+1] < -2) posArr[i*3+1] = 20;
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        rainParticlesRef.current.visible = true;
      } else if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
      }

      // 读取实时激活点ID - 节点动画
      const currentActiveId = activePointIdRef.current;
      markerMeshesRef.current.forEach(m => {
        const isActive = m.userData.id === currentActiveId;
        m.scale.setScalar(isActive ? 1.5 + Math.sin(time * 8) * 0.2 : 1);
        m.children[0].scale.setScalar(1 + Math.sin(time * 4) * 0.5);
      });

      controlsRef.current?.update();
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        const canvas = mountRef.current.querySelector('canvas');
        if (canvas) mountRef.current.removeChild(canvas);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // 释放Three.js资源
      sceneRef.current?.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
      rendererRef.current?.dispose();
    };
  }, []); // 依赖置空，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
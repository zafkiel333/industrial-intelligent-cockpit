import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BrakeSceneProps } from './three-types';

export const MiningBrakeScene: React.FC<BrakeSceneProps> = ({
  rotationSpeed,
  brakePressure,
  temperature,
  isBraking,
  wearLevel,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const wheelGroupRef = useRef<THREE.Group | null>(null);
  const discsRef = useRef<THREE.Group | null>(null);
  const caliperRef = useRef<THREE.Group | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);

  // 2026.03.04 - 修复useEffect反复触发导致模型闪烁问题
  // Bug情况：依赖项变量（rotationSpeed/brakePressure/temperature/isBraking/wearLevel/viewMode）反复变化，
  //         导致主渲染逻辑的useEffect频繁执行，3D模型被重复创建和渲染，出现闪烁现象
  // 解决方案：使用ref存储实时props值，主渲染useEffect仅挂载时执行一次，动画循环读取ref.current获取最新值
  const rotationSpeedRef = useRef(rotationSpeed);
  const brakePressureRef = useRef(brakePressure);
  const temperatureRef = useRef(temperature);
  const isBrakingRef = useRef(isBraking);
  const wearLevelRef = useRef(wearLevel);
  const viewModeRef = useRef(viewMode);

  // 同步props到ref，确保ref始终持有最新的props值
  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
    brakePressureRef.current = brakePressure;
    temperatureRef.current = temperature;
    isBrakingRef.current = isBraking;
    wearLevelRef.current = wearLevel;
    viewModeRef.current = viewMode;
  }, [rotationSpeed, brakePressure, temperature, isBraking, wearLevel, viewMode]);

  // 主渲染逻辑：仅在组件挂载/卸载时执行，剔除所有频繁变化的依赖项
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-brake useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 2026.03.04 - 优化：调亮背景色（非材质/模型颜色），提升基础亮度
    scene.background = new THREE.Color(0x100808); 
    // 2026.03.04 - 优化：降低雾密度+调亮雾色，减少亮度遮挡，提升通透感
    scene.fog = new THREE.FogExp2(0x100808, 0.01); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 2026.03.04 - 优化：大幅提升曝光度，最大化亮度表现（1.5→2.0）
    renderer.toneMappingExposure = 2.0;
    
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights --- 2026.03.04 全面优化光照系统，提升亮度且不修改材质/模型颜色
    // 1. 环境光：大幅提升强度，保证基础亮度全覆盖（0.2→0.8）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 2. 新增半球光：模拟天空/地面环境光，提升明暗层次和整体亮度
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    // 3. 主聚光灯：大幅提升强度，作为核心照明源（1.5→6）
    const spotLight = new THREE.SpotLight(0xffffff, 6);
    spotLight.position.set(10, 10, 10);
    scene.add(spotLight);

    // 4. 新增底部补光：解决模型底部暗部问题，提升亮度均匀性
    const bottomFillLight = new THREE.PointLight(0xffffff, 3.0, 40);
    bottomFillLight.position.set(0, -8, 0);
    scene.add(bottomFillLight);

    // Heat Glow Light (Dynamic) - 保留原有逻辑，不修改颜色/强度规则
    const heatLight = new THREE.PointLight(0xff4500, 0, 20);
    heatLight.position.set(0, 0, 1);
    scene.add(heatLight);

    // --- Materials --- 完全保留原有配置，不修改任何颜色/发光属性
    const rubberMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 
    });
    
    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x71717a, roughness: 0.4, metalness: 0.8 
    });

    const discMat = new THREE.MeshStandardMaterial({
        color: 0x555555, roughness: 0.6, metalness: 0.7,
        emissive: 0xff0000, emissiveIntensity: 0
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x3f3f46, metalness: 0.5, roughness: 0.2,
        transparent: true, opacity: 0.3, side: THREE.DoubleSide
    });

    const caliperMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c, metalness: 0.6, roughness: 0.4
    });

    // --- Geometry --- 完全保留原有模型结构，无任何修改
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Wheel & Tire (Rotating)
    const wheelGroup = new THREE.Group();
    wheelGroupRef.current = wheelGroup;
    mainGroup.add(wheelGroup);

    // Tire
    const tireGeo = new THREE.TorusGeometry(4, 1.5, 32, 64);
    const tire = new THREE.Mesh(tireGeo, rubberMat);
    wheelGroup.add(tire);
    
    // Rim
    const rimGeo = new THREE.CylinderGeometry(2.5, 2.5, 2, 32);
    rimGeo.rotateX(Math.PI/2);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({color: 0xf59e0b, metalness: 0.6}));
    wheelGroup.add(rim);

    // 2. Brake Discs (Rotating inside hub) - Wet Multi-Disc
    const discsGroup = new THREE.Group();
    discsRef.current = discsGroup;
    wheelGroup.add(discsGroup); // Attached to wheel

    for(let i=0; i<5; i++) {
        const dGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 32);
        dGeo.rotateX(Math.PI/2);
        const dMesh = new THREE.Mesh(dGeo, discMat.clone());
        dMesh.position.z = -0.5 + i * 0.25;
        discsGroup.add(dMesh);
    }

    // 3. Stationary Housing / Caliper / Hub (Static)
    const staticGroup = new THREE.Group();
    mainGroup.add(staticGroup);

    // Axle Housing
    const axleGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 16);
    axleGeo.rotateX(Math.PI/2);
    const axle = new THREE.Mesh(axleGeo, steelMat);
    axle.position.z = -2;
    staticGroup.add(axle);

    // Brake Housing (Transparent in some modes)
    const brakeHouseGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.5, 32);
    brakeHouseGeo.rotateX(Math.PI/2);
    const brakeHouse = new THREE.Mesh(brakeHouseGeo, housingMat);
    staticGroup.add(brakeHouse);

    // Caliper / Piston Mechanism
    const calGroup = new THREE.Group();
    caliperRef.current = calGroup;
    staticGroup.add(calGroup);

    // Hydraulic Pistons (Visual)
    for(let i=0; i<4; i++) {
        const pGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        pGeo.rotateX(Math.PI/2);
        const piston = new THREE.Mesh(pGeo, caliperMat);
        const angle = (i / 4) * Math.PI * 2;
        piston.position.set(Math.cos(angle)*1.5, Math.sin(angle)*1.5, 0.8);
        calGroup.add(piston);
    }

    // 4. Sparks / Brake Dust
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3] = -1000; // Hide
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaa00, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparksRef.current = sparks;
    mainGroup.add(sparks);

    // --- Animation ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // Rotation - 读取ref中最新的旋转速度
      if (wheelGroupRef.current) {
          wheelGroupRef.current.rotation.z -= (rotationSpeedRef.current / 60) * 0.1;
      }

      // Thermal Visuals - 读取ref中最新的温度和视图模式
      const tNorm = Math.min(1, Math.max(0, (temperatureRef.current - 100) / 400));
      if (discsRef.current) {
          discsRef.current.children.forEach((mesh: any) => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (viewModeRef.current === 'thermal' || tNorm > 0.2) {
                  const heatColor = new THREE.Color().setHSL(0.1 - tNorm * 0.1, 1.0, 0.5); // Orange to White
                  mat.emissive.copy(heatColor);
                  mat.emissiveIntensity = tNorm * 2.0;
              } else {
                  mat.emissive.setHex(0x000000);
              }
              // Wear Visual (Darkening) - 读取ref中最新的磨损等级
              if (viewModeRef.current === 'wear') {
                   const wearColor = new THREE.Color(0x333333); // Darker
                   mat.color.lerp(wearColor, wearLevelRef.current);
                   mat.emissiveIntensity = 0;
              }
          });
      }
      
      // Light - 读取ref中最新的温度值
      heatLight.intensity = tNorm * 5;

      // Pistons (Breathing with pressure) - 读取ref中最新的制动状态
      if (caliperRef.current) {
           const squeeze = isBrakingRef.current ? 0.1 : 0;
           caliperRef.current.position.z = -0.2 + squeeze; 
           // Add vibration if braking
           if (isBrakingRef.current) {
               caliperRef.current.position.x = (Math.random()-0.5) * 0.02;
               caliperRef.current.position.y = (Math.random()-0.5) * 0.02;
           }
      }

      // Sparks - 读取ref中最新的制动状态和旋转速度
      if (sparksRef.current) {
          const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
          if (isBrakingRef.current && rotationSpeedRef.current > 10) {
              // Emit
              for(let i=0; i<10; i++) {
                  const idx = Math.floor(Math.random() * pCount);
                  const angle = Math.random() * Math.PI * 2;
                  positions[idx*3] = Math.cos(angle) * 2;
                  positions[idx*3+1] = Math.sin(angle) * 2;
                  positions[idx*3+2] = 0;
              }
          }
          
          // Move
          for(let i=0; i<pCount; i++) {
              if (positions[i*3] > -500) {
                  positions[i*3+2] += 0.2; // Fly out
                  positions[i*3] *= 1.02; // Spread
                  positions[i*3+1] *= 1.02;
                  if (positions[i*3+2] > 5) positions[i*3] = -1000; // Kill
              }
          }
          sparksRef.current.geometry.attributes.position.needsUpdate = true;
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
  }, []); // 剔除所有频繁变化的依赖项，仅在组件挂载时执行一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
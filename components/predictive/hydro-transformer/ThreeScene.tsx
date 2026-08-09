import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformerSceneProps } from './three-types';

export const TransformerScene: React.FC<TransformerSceneProps> = ({ 
  oilTemp, 
  windingTempHV, 
  windingTempLV, 
  oilLevel,
  isFansRunning,
  coreVibration,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const tankRef = useRef<THREE.Mesh | null>(null);
  const windingsRef = useRef<THREE.Group | null>(null);
  const fansRef = useRef<THREE.Group[]>([]);

  // 2026.03.02 - 新增ref存储实时props值，避免主渲染useEffect依赖项变化
  // 原因：原逻辑将实时变化的props作为useEffect依赖项，导致useEffect反复触发重建3D场景，引发模型闪烁
  const oilTempRef = useRef(oilTemp);
  const windingTempHVRef = useRef(windingTempHV);
  const windingTempLVRef = useRef(windingTempLV);
  const oilLevelRef = useRef(oilLevel);
  const isFansRunningRef = useRef(isFansRunning);
  const coreVibrationRef = useRef(coreVibration);
  const viewModeRef = useRef(viewMode);

  // 2026.03.02 - 同步props到ref，保证实时性的同时不触发主渲染useEffect重新执行
  useEffect(() => {
    oilTempRef.current = oilTemp;
    windingTempHVRef.current = windingTempHV;
    windingTempLVRef.current = windingTempLV;
    oilLevelRef.current = oilLevel;
    isFansRunningRef.current = isFansRunning;
    coreVibrationRef.current = coreVibration;
    viewModeRef.current = viewMode;
  }, [oilTemp, windingTempHV, windingTempLV, oilLevel, isFansRunning, coreVibration, viewMode]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-transformer useEffect===");

    // 2026.03.02 - Bug修复：3D模型渲染时出现频繁闪烁
    // Bug情况：模型在渲染过程中反复闪烁、重绘
    // 原因：原useEffect依赖项包含多个实时变化的props变量（如温度、振动值、运行状态等），
    // 这些变量频繁更新导致useEffect反复触发，重新创建3D场景、几何体、材质和渲染逻辑，引发闪烁
    // 修复方案：剔除主渲染useEffect的动态依赖项，改用ref存储实时props值，仅在挂载/卸载时执行一次

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050308, 0.03); // Deep purple fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // 2026.03.02 - 相机位置调整：提升y轴高度，让模型回到视野中央
    // 原参数：(12, 8, 12) → 新参数：(12, 16, 12)
    // 调整逻辑：y轴从8提升到16（抬高视角），保证模型完整显示在视野中央
    camera.position.set(12, 16, 12); 
    camera.lookAt(0, 2, 0); // 保持指向模型中心（y=2是变压器主体中心）不变

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // 2026.03.02 - 光线优化：提升渲染器曝光度，全局提亮（不修改材质/色彩）
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3; // 曝光度从默认1.0提升，全局提亮且不改变色彩基调
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // --- Lights ---
    // 2026.03.02 - 光线优化：提升环境光强度（从0.3→0.7），均匀提亮整个场景
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // 2026.03.02 - 光线优化：提升紫色点光源强度（从2→3.5）、扩大照射范围（从20→30）
    const violetLight = new THREE.PointLight(0x8b5cf6, 3.5, 30);
    violetLight.position.set(5, 10, 5); // 位置不变，保证原有光影层次
    scene.add(violetLight);

    // 2026.03.02 - 光线优化：提升暖色点光源强度（从1→2.5）、扩大照射范围（从20→30）
    const warmLight = new THREE.PointLight(0xf59e0b, 2.5, 30); // Represents heat
    warmLight.position.set(-5, 5, -5); // 位置不变，保留热感光影
    scene.add(warmLight);

    // 2026.03.02 - 光线优化：新增定向补光，专门提亮模型暗部（不改变原有色彩）
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(0, 15, 8); // 从斜上方照射，避免产生新的阴影死角
    fillLight.target.position.set(0, 2, 0); // 指向变压器中心
    scene.add(fillLight);
    scene.add(fillLight.target);

    // --- Materials ---
    // 完全保留原有材质，无任何修改
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.6, roughness: 0.4 
    });
    
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, metalness: 0.1, roughness: 0.1 // Brown bushings
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, metalness: 0.7, roughness: 0.3
    });

    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      transmission: 0.1
    });

    // --- Geometry ---
    // 完全保留原有模型几何逻辑，无任何修改
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Main Tank
    const tankGeo = new THREE.BoxGeometry(6, 5, 4);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 2.5;
    tankRef.current = tank;
    mainGroup.add(tank);

    // 2. Bushings (HV & LV)
    const bushingGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 16);
    // HV Bushings (3 Tall)
    [-1.5, 0, 1.5].forEach(x => {
        const bush = new THREE.Mesh(bushingGeo, porcelainMat);
        bush.position.set(x, 6.25, 1);
        
        // Rings
        for(let i=0; i<5; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 16), porcelainMat);
            ring.rotation.x = Math.PI/2;
            ring.position.y = -1 + i*0.5;
            bush.add(ring);
        }
        mainGroup.add(bush);
    });
    // LV Bushings (4 Short)
    [-1.5, -0.5, 0.5, 1.5].forEach(x => {
        const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16), porcelainMat);
        bush.position.set(x, 5.75, -1);
        mainGroup.add(bush);
    });

    // 3. Conservator (Oil Pillow)
    const conservatorGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
    conservatorGeo.rotateZ(Math.PI/2);
    const conservator = new THREE.Mesh(conservatorGeo, steelMat);
    conservator.position.set(0, 6.5, -2.5);
    mainGroup.add(conservator);
    
    // Connection Pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), steelMat);
    pipe.position.set(2, 5.5, -2);
    mainGroup.add(pipe);

    // 4. Radiators / Cooling Fins
    fansRef.current = [];
    [-2.2, 0, 2.2].forEach(zOffset => {
        // Left Side
        const radGroup = new THREE.Group();
        radGroup.position.set(-3.2, 2.5, zOffset);
        mainGroup.add(radGroup);
        
        // Fins
        const fins = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 1.5), steelMat);
        radGroup.add(fins);
        
        // Fan
        const fanGroup = new THREE.Group();
        fanGroup.position.set(-0.3, -1, 0);
        fanGroup.rotation.z = Math.PI / 2;
        radGroup.add(fanGroup);
        
        const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.2), new THREE.MeshBasicMaterial({color: 0x000000}));
        const fanBlade2 = fanBlade.clone();
        fanBlade2.rotation.x = Math.PI / 2;
        fanGroup.add(fanBlade);
        fanGroup.add(fanBlade2);
        fansRef.current.push(fanGroup);
    });

    // 5. Internal Windings (Core)
    const windingsGroup = new THREE.Group();
    windingsRef.current = windingsGroup;
    windingsGroup.position.set(0, 2.5, 0);
    mainGroup.add(windingsGroup);

    [-1.5, 0, 1.5].forEach(x => {
        const coreLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4, 32), new THREE.MeshStandardMaterial({color: 0x333333}));
        coreLeg.position.x = x;
        windingsGroup.add(coreLeg);

        const winding = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.5, 32), copperMat);
        winding.position.x = x;
        windingsGroup.add(winding);
    });

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // Fan Rotation - 从ref读取实时值
      if (isFansRunningRef.current) {
          fansRef.current.forEach(fan => {
              fan.rotation.x += 0.2;
          });
      }

      // Vibration Effect - 从ref读取实时值
      if (coreVibrationRef.current > 0) {
          mainGroup.position.x = (Math.random() - 0.5) * 0.01 * coreVibrationRef.current;
      }

      // View Mode Logic - 从ref读取实时值
      if (tankRef.current && windingsRef.current) {
          const tMat = tankRef.current.material as THREE.MeshPhysicalMaterial;
          
          if (viewModeRef.current === 'internal') {
              tMat.opacity = 0.1;
              tMat.wireframe = true;
              windingsRef.current.visible = true;
          } else if (viewModeRef.current === 'thermal') {
              tMat.opacity = 0.9;
              tMat.wireframe = false;
              windingsRef.current.visible = false;
              // Heat map effect on tank color
              const heatColor = new THREE.Color().setHSL(0.0 + (100 - oilTempRef.current)/200, 1.0, 0.5); // Red to Greenish
              tMat.color.lerp(heatColor, 0.1);
              tMat.emissive.lerp(heatColor, 0.1);
              tMat.emissiveIntensity = 0.5;
          } else {
              // Standard
              tMat.opacity = 0.9;
              tMat.wireframe = false;
              tMat.color.setHex(0x334155);
              tMat.emissive.setHex(0x000000);
              windingsRef.current.visible = false;
          }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // 2026.03.02 - 清空依赖项，避免因props变化反复触发

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
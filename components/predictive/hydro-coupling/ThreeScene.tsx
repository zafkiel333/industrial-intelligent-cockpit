import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CouplingSceneProps } from './three-types';

export const CouplingThreeScene: React.FC<CouplingSceneProps> = ({ 
  fluidVelocity,
  vibrationAmp,
  electromagneticStress,
  couplingIntensity,
  isResonating,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const waterFlowRef = useRef<THREE.Points | null>(null);
  const unitGroupRef = useRef<THREE.Group | null>(null);
  const fieldRef = useRef<THREE.Mesh | null>(null);

  // 2026.03.03 - Bug修复：创建ref存储实时props值，避免主渲染useEffect因依赖项变化反复触发
  // Bug情况：3D模型出现闪烁问题；原因：原useEffect依赖了fluidVelocity/vibrationAmp等频繁变化的props，
  // 导致useEffect反复触发，重新创建3D场景、渲染逻辑，引发模型闪烁
  const fluidVelocityRef = useRef(fluidVelocity);
  const vibrationAmpRef = useRef(vibrationAmp);
  const electromagneticStressRef = useRef(electromagneticStress);
  const couplingIntensityRef = useRef(couplingIntensity);
  const isResonatingRef = useRef(isResonating);
  const viewModeRef = useRef(viewMode);

  // 2026.03.03 - 同步props值到ref，确保动画循环能读取到实时值，且不触发主渲染useEffect重新执行
  useEffect(() => {
    fluidVelocityRef.current = fluidVelocity;
    vibrationAmpRef.current = vibrationAmp;
    electromagneticStressRef.current = electromagneticStress;
    couplingIntensityRef.current = couplingIntensity;
    isResonatingRef.current = isResonating;
    viewModeRef.current = viewMode;
  }, [fluidVelocity, vibrationAmp, electromagneticStress, couplingIntensity, isResonating, viewMode]);

  // 2026.03.03 - 主渲染逻辑移除所有props依赖，仅初始化执行一次，避免反复创建场景导致闪烁
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-coupling useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 调整1：提升渲染器曝光度，整体提亮画面（原1.5 → 2.2）
    renderer.toneMappingExposure = 2.2;
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
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    // 调整2：提升环境光强度，增强基础亮度（原0.2 → 0.8）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 调整3：新增半球光，补充环境光层次感，模拟自然光照差异（不改变材质色彩）
    const hemisphereLight = new THREE.HemisphereLight(0xe0f2fe, 0x075985, 1.6);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    // 调整4：提升主点光源强度，扩大光照覆盖（原3 → 8），优化衰减让光照更均匀
    const topLight = new THREE.PointLight(0x38bdf8, 8, 80); // 强度提升+光照距离从50→80
    topLight.position.set(0, 20, 0);
    topLight.decay = 1.2; // 减缓衰减，让远处也能获得足够光照
    scene.add(topLight);

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    unitGroupRef.current = mainGroup;

    // 1. 机械结构 (半透明全息感)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });

    const bodyGeo = new THREE.CylinderGeometry(4, 5, 12, 32, 1, true);
    const body = new THREE.Mesh(bodyGeo, glassMat);
    mainGroup.add(body);

    const wireGeo = new THREE.EdgesGeometry(bodyGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    mainGroup.add(wireframe);

    // 2. 流体粒子 (蜗壳与转轮区)
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 2;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 10;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    waterFlowRef.current = particles;
    mainGroup.add(particles);

    // 3. 电磁场云 (顶部发电机区)
    const fieldGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const fieldMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.position.y = 4;
    fieldRef.current = field;
    mainGroup.add(field);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 模拟流体运动 - 读取ref中的实时值
      if (waterFlowRef.current) {
          const positions = waterFlowRef.current.geometry.attributes.position.array as Float32Array;
          const speed = fluidVelocityRef.current * 0.01; // 使用ref读取实时值
          for(let i=0; i<pCount; i++) {
              // 螺旋下沉运动
              const x = positions[i*3];
              const z = positions[i*3+2];
              const angle = 0.05 + couplingIntensityRef.current * 0.05; // 使用ref读取实时值
              positions[i*3] = x * Math.cos(angle) - z * Math.sin(angle);
              positions[i*3+2] = x * Math.sin(angle) + z * Math.cos(angle);
              positions[i*3+1] -= speed;
              if (positions[i*3+1] < -6) positions[i*3+1] = 6;
          }
          waterFlowRef.current.geometry.attributes.position.needsUpdate = true;
          waterFlowRef.current.visible = viewModeRef.current === 'total' || viewModeRef.current === 'fluid'; // 使用ref读取实时值
      }

      // 模拟机械振动 (微小抖动) - 读取ref中的实时值
      if (unitGroupRef.current) {
          const shake = (vibrationAmpRef.current / 500) * (isResonatingRef.current ? 2 : 1); // 使用ref读取实时值
          unitGroupRef.current.position.x = Math.sin(time * 50) * shake;
          unitGroupRef.current.position.z = Math.cos(time * 50) * shake;
          unitGroupRef.current.visible = viewModeRef.current === 'total' || viewModeRef.current === 'mechanical'; // 使用ref读取实时值
      }

      // 模拟电磁应力脉动 - 读取ref中的实时值
      if (fieldRef.current) {
          const scale = 1 + Math.sin(time * 10) * 0.05 * electromagneticStressRef.current; // 使用ref读取实时值
          fieldRef.current.scale.set(scale, scale, scale);
          (fieldRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + electromagneticStressRef.current * 0.2; // 使用ref读取实时值
          fieldRef.current.visible = viewModeRef.current === 'total' || viewModeRef.current === 'electrical'; // 使用ref读取实时值
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
  }, []); // 移除所有props依赖，仅初始化执行一次

  return <div ref={mountRef} className="w-full h-full" />;
};
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BrakingSceneProps } from './three-types';

export const BrakingThreeScene: React.FC<BrakingSceneProps> = ({
  speed,
  brakePressure,
  discTemperature,
  isEmergencyBraking,
  pads,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const wheelGroupRef = useRef<THREE.Group | null>(null);
  const discRef = useRef<THREE.Mesh | null>(null);
  const caliperGroupRef = useRef<THREE.Group | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);

  // 2026.03.04 - Bug修复：创建ref存储实时状态值，避免主useEffect因依赖项频繁变化反复执行
  // Bug情况：3D模型出现闪烁问题，原因是speed/brakePressure等依赖项频繁变化导致useEffect反复触发，场景被重复创建和销毁
  const speedRef = useRef(speed);
  const brakePressureRef = useRef(brakePressure);
  const discTemperatureRef = useRef(discTemperature);
  const isEmergencyBrakingRef = useRef(isEmergencyBraking);
  const viewModeRef = useRef(viewMode);

  // 仅更新ref值，不触发场景重建
  useEffect(() => {
    speedRef.current = speed;
    brakePressureRef.current = brakePressure;
    discTemperatureRef.current = discTemperature;
    isEmergencyBrakingRef.current = isEmergencyBraking;
    viewModeRef.current = viewMode;
  }, [speed, brakePressure, discTemperature, isEmergencyBraking, viewMode]);

  // 主渲染逻辑：仅在挂载/卸载时执行，依赖项清空
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-locomotive-braking useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 2026.03.04 - 光照优化：降低雾的浓度，提升场景可视度（不修改颜色）
    scene.background = new THREE.Color(0x050202);
    scene.fog = new THREE.FogExp2(0x050202, 0.005); // 原0.02 → 0.005，雾更淡

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 2026.03.04 - 光照优化：提升曝光度，增强整体亮度（原1.2 → 2.0）
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
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // --- Lights ---
    // 2026.03.04 - 光照优化：大幅提升环境光强度（原0.2 → 0.8）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 2026.03.04 - 光照优化：新增半球光，提供自然的环境漫反射补光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    // 2026.03.04 - 光照优化：大幅提升主聚光灯强度（原2 → 8），扩大照射范围
    const mainLight = new THREE.SpotLight(0xffffff, 8);
    mainLight.position.set(10, 10, 10);
    mainLight.angle = Math.PI / 3; // 扩大照射角度
    mainLight.penumbra = 0.2; // 柔化边缘
    scene.add(mainLight);

    // 2026.03.04 - 光照优化：新增底部补光，消除底部阴影
    const bottomFillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    bottomFillLight.position.set(0, -5, 0);
    bottomFillLight.target.position.set(0, 0, 0);
    scene.add(bottomFillLight);
    scene.add(bottomFillLight.target);

    // 2026.03.04 - 光照优化：提升热光源基础强度（原0 → 1），保留动态逻辑
    const heatLight = new THREE.PointLight(0xff4500, 1, 20); // Glow from heat
    heatLight.position.set(0, 0, 1);
    scene.add(heatLight);

    // --- Materials ---
    // 完全保留原有材质属性，不修改任何颜色相关配置
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x475569, metalness: 0.8, roughness: 0.4
    });

    const discMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 0.7, roughness: 0.3,
        emissive: 0x000000
    });

    const padMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, roughness: 0.9, metalness: 0.1
    });

    const wheelMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155, metalness: 0.5, roughness: 0.5, clearcoat: 0.5
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Wheel Assembly (Rotates)
    const wheelGroup = new THREE.Group();
    wheelGroupRef.current = wheelGroup;
    mainGroup.add(wheelGroup);

    // Wheel
    const wheelGeo = new THREE.CylinderGeometry(3, 3, 1.5, 64);
    wheelGeo.rotateX(Math.PI/2);
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.z = -1;
    wheelGroup.add(wheel);

    // Flange
    const flangeGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.2, 64);
    flangeGeo.rotateX(Math.PI/2);
    const flange = new THREE.Mesh(flangeGeo, wheelMat);
    flange.position.z = -1.7;
    wheelGroup.add(flange);

    // Axle
    const axleGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 32);
    axleGeo.rotateX(Math.PI/2);
    const axle = new THREE.Mesh(axleGeo, steelMat);
    wheelGroup.add(axle);

    // Brake Disc (Attached to Axle/Wheel)
    const discGeo = new THREE.CylinderGeometry(2, 2, 0.4, 64);
    discGeo.rotateX(Math.PI/2);
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.z = 1.5;
    discRef.current = disc;
    wheelGroup.add(disc);

    // 2. Caliper Assembly (Stationary)
    const caliperGroup = new THREE.Group();
    caliperGroup.position.z = 1.5;
    caliperGroupRef.current = caliperGroup;
    mainGroup.add(caliperGroup);

    // Housing
    const caliperHousingGeo = new THREE.BoxGeometry(2, 4, 1.2);
    const caliperHousing = new THREE.Mesh(caliperHousingGeo, new THREE.MeshStandardMaterial({color: 0x9f1239, metalness: 0.6, roughness: 0.4}));
    caliperHousing.position.x = -2;
    caliperHousing.position.y = 0;
    caliperGroup.add(caliperHousing);

    // Pads (Moveable)
    const padL = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.2), padMat);
    padL.name = 'padL';
    padL.position.set(-1.2, 0, -0.3); // Inner
    caliperGroup.add(padL);

    const padR = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.2), padMat);
    padR.name = 'padR';
    padR.position.set(-1.2, 0, 0.3); // Outer
    caliperGroup.add(padR);

    // 3. Sparks Particle System
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3] = -1000;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparksRef.current = sparks;
    mainGroup.add(sparks);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Rotation - 读取ref中的实时speed值
      if (wheelGroupRef.current) {
          // Speed km/h -> Rad/frame approx
          const rotSpeed = speedRef.current * 0.02;
          wheelGroupRef.current.rotation.z -= rotSpeed;
      }

      // 2. Caliper Action (Squeeze) - 读取ref中的实时brakePressure值
      if (caliperGroupRef.current) {
          const padL = caliperGroupRef.current.getObjectByName('padL');
          const padR = caliperGroupRef.current.getObjectByName('padR');
          
          // Max gap = 0.3 offset. Closed = 0.2 offset (touching disc which is 0.4 thick, center at 0)
          // Disc Z range: 1.5 - 0.2 to 1.5 + 0.2 => 1.3 to 1.7 in world, but local to wheel.
          // Caliper is at Z=1.5. Pads relative Z: -0.3 and 0.3
          // Target Closed: -0.21 and 0.21
          
          const pressureFactor = Math.min(1, brakePressureRef.current / 300); // 300kPa max visual squeeze
          const offset = 0.3 - (0.09 * pressureFactor);
          
          if (padL) padL.position.z = -offset;
          if (padR) padR.position.z = offset;
      }

      // 3. Thermal Glow - 读取ref中的实时discTemperature和viewMode值
      if (discRef.current) {
          const mat = discRef.current.material as THREE.MeshStandardMaterial;
          if (viewModeRef.current === 'thermal' || discTemperatureRef.current > 300) {
              const tNorm = Math.min(1, Math.max(0, (discTemperatureRef.current - 100) / 700));
              const heatColor = new THREE.Color().setHSL(0.1 - tNorm * 0.1, 1.0, 0.3 + tNorm * 0.7); // Dark Red to Bright Yellow
              mat.emissive.copy(heatColor);
              mat.emissiveIntensity = tNorm * 2;
              heatLight.intensity = 1 + (tNorm * 4); // 保留热光源动态逻辑，基础强度已提升
              heatLight.color = heatColor;
          } else {
              mat.emissive.setHex(0x000000);
              heatLight.intensity = 1; // 保留基础强度
          }
      }

      // 4. Sparks - 读取ref中的实时isEmergencyBraking和speed值
      if (sparksRef.current) {
          const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
          if (isEmergencyBrakingRef.current && speedRef.current > 5) {
              for(let i=0; i<5; i++) {
                  const idx = Math.floor(Math.random() * pCount);
                  // Spawn at caliper contact: x=-2, y=0, z=1.5 +/- 0.2
                  positions[idx*3] = -1.5 + (Math.random()-0.5)*0.5;
                  positions[idx*3+1] = (Math.random()-0.5)*0.5;
                  positions[idx*3+2] = 1.5 + (Math.random()-0.5)*0.3;
              }
          }
          
          for(let i=0; i<pCount; i++) {
              if (positions[i*3] > -100) {
                  // Fly tangential (down and back)
                  positions[i*3] += (Math.random()) * 0.1; 
                  positions[i*3+1] -= 0.2 + Math.random()*0.1;
                  positions[i*3+2] += (Math.random()-0.5) * 0.1;
                  
                  if (positions[i*3+1] < -5) positions[i*3] = -1000;
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
  }, []); // 清空依赖项，仅在组件挂载/卸载时执行

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
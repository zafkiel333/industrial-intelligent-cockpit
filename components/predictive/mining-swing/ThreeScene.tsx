import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SwingSceneProps } from './three-types';

export const SwingThreeScene: React.FC<SwingSceneProps> = ({
  parts,
  rpm,
  torque,
  viewMode,
  activePartId,
  onPartSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const motorRef = useRef<THREE.Group | null>(null);
  const gearRingRef = useRef<THREE.Mesh | null>(null);
  const pinionRef = useRef<THREE.Mesh | null>(null);
  const fieldRef = useRef<THREE.Points | null>(null);

  const viewModeRef = useRef(viewMode);
  const rpmRef = useRef(rpm);
  const activePartIdRef = useRef(activePartId);
  
  useEffect(() => {
    viewModeRef.current = viewMode;
    rpmRef.current = rpm;
    activePartIdRef.current = activePartId;
  }, [viewMode, rpm, activePartId]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-swing useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050208);
    // 优化雾效：降低密度减少暗雾遮挡，提升整体通透感
    scene.fog = new THREE.FogExp2(0x050208, 0.02); // 原0.04 → 0.02

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 提升曝光度：增强全局亮度，不改变色彩基调
    renderer.toneMappingExposure = 2.5; // 原1.8 → 2.5
    
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 光照系统大幅升级 ---
    // 1. 环境光：大幅提升基础亮度，让暗部不再过暗
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // 原0.8 → 1.5
    scene.add(ambientLight);

    // 新增：半球光 - 补充顶部/地面反射光，提升自然度和整体亮度
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemisphereLight.position.set(0, 20, 0); // 顶部高位置，覆盖全局
    scene.add(hemisphereLight);
    
    // 2. 紫色点光源：进一步提升强度+扩大照射范围
    const purpleLight = new THREE.PointLight(0xa855f7, 20, 100); // 原12→20，距离80→100
    purpleLight.position.set(8, 12, 8);
    // 新增：开启光源阴影，增强立体感同时提升亮度
    purpleLight.castShadow = true;
    purpleLight.shadow.radius = 8; // 柔化阴影边缘
    scene.add(purpleLight);

    // 3. 蓝色点光源：大幅提升强度+扩大照射范围
    const blueLight = new THREE.PointLight(0x0ea5e9, 15, 100); // 原8→15，距离80→100
    blueLight.position.set(-8, 8, -8);
    blueLight.castShadow = true;
    scene.add(blueLight);

    // 4. 方向光：提升强度，增强全局均匀照明
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 原0.6 → 1.0
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    // 扩大方向光阴影范围，避免局部过暗
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // 新增：底部补光 - 消除模型底部阴影，提升整体亮度
    const bottomLight = new THREE.PointLight(0xffffff, 8, 80);
    bottomLight.position.set(0, -10, 0); // 底部中心位置
    bottomLight.color.setHex(0xffffff); // 中性白光，不干扰原有色彩
    scene.add(bottomLight);

    // --- 材质（完全未修改颜色属性）---
    const getMetalMat = (color: number) => new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.3,
      transparent: viewModeRef.current !== 'mechanical',
      opacity: viewModeRef.current === 'mechanical' ? 1.0 : 0.3
    });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 大齿圈 (Main Ring Gear)
    const ringGeo = new THREE.TorusGeometry(6, 0.4, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, getMetalMat(0x475569));
    gearRingRef.current = ring;
    mainGroup.add(ring);

    // 2. 驱动装置 (Drive Unit)
    const driveUnit = new THREE.Group();
    driveUnit.position.set(3.5, 0, 0);
    mainGroup.add(driveUnit);

    // 牵引电机 (Motor)
    const motorGroup = new THREE.Group();
    motorGroup.position.y = 3.5;
    driveUnit.add(motorGroup);
    motorRef.current = motorGroup;

    const motorCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 32), getMetalMat(0x1e293b));
    motorGroup.add(motorCyl);
    
    // 电机散热片
    const finGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.8, 16, 1, true);
    const fins = new THREE.Mesh(finGeo, new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.2 }));
    motorGroup.add(fins);

    // 3. 小齿轮 (Pinion)
    const pinionGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    pinionGeo.rotateX(Math.PI/2);
    const pinion = new THREE.Mesh(pinionGeo, getMetalMat(0x94a3b8));
    pinionRef.current = pinion;
    driveUnit.add(pinion);

    // 4. 电磁场粒子 (Magnetic Field)
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 1.5 + Math.random() * 1.5;
        const th = Math.random() * Math.PI * 2;
        pPos[i*3] = Math.cos(th) * r;
        pPos[i*3+1] = (Math.random()-0.5) * 6;
        pPos[i*3+2] = Math.sin(th) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xd946ef, 
        size: 0.06, 
        transparent: true, 
        opacity: viewModeRef.current === 'magnetic' ? 0.6 : 0,
        blending: THREE.AdditiveBlending 
    });
    const field = new THREE.Points(pGeo, pMat);
    fieldRef.current = field;
    motorGroup.add(field);

    // 5. 地面投影网格
    const grid = new THREE.GridHelper(30, 20, 0x2e1065, 0x0a0510);
    grid.position.y = -1;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      const speed = rpmRef.current * 0.01;
      if (motorRef.current) motorRef.current.rotation.y += speed;
      if (pinionRef.current) pinionRef.current.rotation.x += speed;
      if (gearRingRef.current) gearRingRef.current.rotation.y -= speed * 0.15;

      if (fieldRef.current && viewModeRef.current === 'magnetic') {
          const pos = fieldRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time*5 + i)*0.02;
          }
          fieldRef.current.geometry.attributes.position.needsUpdate = true;
          (fieldRef.current.material as THREE.PointsMaterial).opacity = 0.6;
      } else if (fieldRef.current) {
          (fieldRef.current.material as THREE.PointsMaterial).opacity = 0;
      }

      if (viewModeRef.current === 'thermal') {
          parts.forEach(p => {
              const tNorm = Math.min(1, (p.temp - 40) / 60);
              const heatColor = new THREE.Color().setHSL(0.7 * (1-tNorm), 1.0, 0.5);
              if (p.id === 'motor' && motorRef.current) {
                  (motorRef.current.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                      color: heatColor, 
                      emissive: heatColor, 
                      emissiveIntensity: 0.5
                  });
              }
          });
      } else if (viewModeRef.current === 'mechanical' && motorRef.current) {
          (motorRef.current.children[0] as THREE.Mesh).material = getMetalMat(0x1e293b);
      }

      if (gearRingRef.current) {
          (gearRingRef.current.material as THREE.MeshStandardMaterial).transparent = viewModeRef.current !== 'mechanical';
          (gearRingRef.current.material as THREE.MeshStandardMaterial).opacity = viewModeRef.current === 'mechanical' ? 1.0 : 0.3;
      }
      if (pinionRef.current) {
          (pinionRef.current.material as THREE.MeshStandardMaterial).transparent = viewModeRef.current !== 'mechanical';
          (pinionRef.current.material as THREE.MeshStandardMaterial).opacity = viewModeRef.current === 'mechanical' ? 1.0 : 0.3;
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
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
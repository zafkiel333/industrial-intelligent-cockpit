import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EconomySceneProps } from './three-types';

export const EconomyEvaluationScene: React.FC<EconomySceneProps> = ({ 
  roiLevel,
  savingsSpeed,
  investmentFactor,
  showValueStream,
  activeMetric
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);

  // 2026.03.03 - Bug修复：创建ref存储动态props值，避免依赖项变化触发useEffect重建3D场景导致闪烁
  // Bug原因：原代码将roiLevel/savingsSpeed/showValueStream作为useEffect依赖项，这些值频繁变化会导致useEffect反复执行，重建整个3D场景，表现为模型闪烁
  const roiLevelRef = useRef(roiLevel);
  const savingsSpeedRef = useRef(savingsSpeed);
  const showValueStreamRef = useRef(showValueStream);

  // 2026.03.03 - 同步props值到ref，仅更新值不触发3D场景重建
  useEffect(() => {
    roiLevelRef.current = roiLevel;
    savingsSpeedRef.current = savingsSpeed;
    showValueStreamRef.current = showValueStream;
  }, [roiLevel, savingsSpeed, showValueStream]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-economy useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 2026.03.04 - 调整光线参数提亮显示效果，不修改材质/模型色彩
    // 1. 提升环境光强度，增强基础全局照明（原强度0.2 → 0.6）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 2. 增强金色点光源强度+调整衰减，提升核心区域亮度（原强度2 → 5，距离50 → 80，增加衰减参数1.2）
    const goldLight = new THREE.PointLight(0xfacc15, 5, 80, 1.2);
    goldLight.position.set(5, 5, 5);
    scene.add(goldLight);

    // 3. 新增主方向光，提升整体场景亮度（模拟自然顶光，不影响原有色彩）
    const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainDirectionalLight.position.set(10, 15, 10); // 高位光源避免局部过暗
    mainDirectionalLight.castShadow = true; // 增加阴影层次感（可选，不改变色彩）
    scene.add(mainDirectionalLight);

    // 4. 新增补光，平衡暗部区域亮度（避免局部过暗，保持色彩一致性）
    const fillLight = new THREE.PointLight(0xffffff, 1, 60);
    fillLight.position.set(-8, 8, -8); // 与主光源对角布置，平衡光照
    scene.add(fillLight);

    // 1. 核心几何体 (Value Core)
    const coreGeo = new THREE.IcosahedronGeometry(3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xeab308,
        emissiveIntensity: 0.5,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreRef.current = core;
    scene.add(core);

    // 内部实体核心
    const innerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2, 0),
        new THREE.MeshStandardMaterial({ color: 0x854d0e, metalness: 0.9, roughness: 0.1 })
    );
    core.add(innerCore);

    // 2. 价值环绕轨道
    const rings = new THREE.Group();
    ringsRef.current = rings;
    scene.add(rings);
    for(let i=0; i<3; i++) {
        const ringGeo = new THREE.TorusGeometry(5 + i * 1.2, 0.05, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.2 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.rotation.y = (Math.random() - 0.5) * 1;
        rings.add(ring);
    }

    // 3. 价值粒子流 (Value Particles)
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pMeta = [];
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*30;
        pPos[i*3+1] = (Math.random()-0.5)*30;
        pPos[i*3+2] = (Math.random()-0.5)*30;
        pMeta.push({ speed: 0.01 + Math.random()*0.05 });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xfacc15,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 动画循环
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 核心脉动
      if (coreRef.current) {
          const scale = 1 + Math.sin(time * 3) * 0.1 * roiLevelRef.current;
          coreRef.current.scale.set(scale, scale, scale);
          coreRef.current.rotation.y += 0.01;
          (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + roiLevelRef.current;
      }

      // 轨道旋转
      if (ringsRef.current) {
          ringsRef.current.children.forEach((r, i) => {
              r.rotation.z += 0.01 * (i + 1);
          });
      }

      // 粒子向核心流动
      if (particlesRef.current && showValueStreamRef.current) {
          const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              const x = pos[i*3];
              const y = pos[i*3+1];
              const z = pos[i*3+2];
              
              const vec = new THREE.Vector3(x, y, z);
              const dist = vec.length();
              
              if (dist < 1) {
                  // 重新生成在远处
                  const r = 20;
                  const theta = Math.random() * Math.PI * 2;
                  const phi = Math.random() * Math.PI;
                  pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
                  pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
                  pos[i*3+2] = r * Math.cos(phi);
              } else {
                  vec.multiplyScalar(0.98 - (savingsSpeedRef.current * 0.01));
                  pos[i*3] = vec.x;
                  pos[i*3+1] = vec.y;
                  pos[i*3+2] = vec.z;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          particlesRef.current.visible = true;
      } else if (particlesRef.current) {
          particlesRef.current.visible = false;
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
  }, []); // 依赖项改为空数组，确保3D场景只初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
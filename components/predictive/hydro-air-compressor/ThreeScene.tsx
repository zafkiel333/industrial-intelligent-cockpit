import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CompressorSceneProps } from './three-types';

export const AirCompressorThreeScene: React.FC<CompressorSceneProps> = ({
  parts,
  motorRpm,
  airFlowIntensity,
  oilCirculationSpeed,
  compressionRatio,
  viewMode,
  selectedId,
  onSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);
  const screwsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-air-compare useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 核心提亮：降低雾效密度（从0.03→0.01），减少雾对画面的暗化压制
    scene.fog = new THREE.FogExp2(0x02040a, 0.01); 

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(18, 18, 18); // 微调相机位置，让模型更居中受光
    camera.lookAt(0, 2, 0); // 聚焦模型核心区域，避免边缘暗化

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 核心提亮：大幅提升曝光度（从1.2→2.0），全局提亮且不修改材质
    renderer.toneMappingExposure = 2.0;
    // 新增：开启伽马校正，非线性提升暗部亮度
    renderer.gammaOutput = true;
    renderer.gammaFactor = 1.2;
    
    // 保留原有canvas清理逻辑
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ================ 终极光线调整：全维度提亮 ================
    // 1. 环境光拉满（基础补光），从0.7→1.2，彻底消除暗部死黑
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // 2. 青色主光源：强度翻倍+超广范围，核心区域强光覆盖
    const cyanLight = new THREE.PointLight(0x0ea5e9, 18, 120); // 强度9→18，范围80→120
    cyanLight.position.set(8, 22, 10); // 更高更居中，覆盖模型全区域
    scene.add(cyanLight);

    // 3. 琥珀色补光：强度翻倍+超广范围，暖色平衡冷光
    const amberLight = new THREE.PointLight(0xf59e0b, 12, 100); // 强度6→12，范围70→100
    amberLight.position.set(-10, 15, -10); // 高位补光，减少暗角
    scene.add(amberLight);

    // 4. 方向光：强度翻倍+无阴影，全局均匀提亮（关闭阴影避免暗部）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); // 强度0.9→1.8
    directionalLight.position.set(10, 25, 15); // 更高位打光，无死角
    directionalLight.castShadow = false; // 关闭阴影，避免局部暗化
    scene.add(directionalLight);

    // 5. 新增半球光：补充环境反射光，提升透明/金属材质亮度
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.0);
    scene.add(hemisphereLight);

    // 6. 新增第二辅助补光：覆盖模型底部/背面暗区
    const fillLight2 = new THREE.PointLight(0xe2e8f0, 5, 80);
    fillLight2.position.set(0, 5, 15); // 底部补光，消除下方暗区
    scene.add(fillLight2);
    // ==========================================================

    // Materials（完全未修改，一行都没动）
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.9, roughness: 0.3,
      transparent: viewMode === 'xray',
      opacity: viewMode === 'xray' ? 0.2 : 1.0
    });

    const innerMetalMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 1.0, roughness: 0.1
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, transmission: 0.5, transparent: true, opacity: 0.6
    });

    // 模型几何部分（完全未修改）
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 32), metalMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -4;
    mainGroup.add(motor);

    const airEndGroup = new THREE.Group();
    const housingGeo = new THREE.BoxGeometry(3, 3, 4);
    const housing = new THREE.Mesh(housingGeo, metalMat);
    airEndGroup.add(housing);
    
    const screws = new THREE.Group();
    screwsRef.current = screws;
    for(let i=0; i<2; i++) {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 8), innerMetalMat);
        screw.rotation.x = Math.PI/2;
        screw.position.x = i === 0 ? -0.7 : 0.7;
        screws.add(screw);
    }
    airEndGroup.add(screws);
    mainGroup.add(airEndGroup);

    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 6, 32), metalMat);
    tank.position.set(4, 1.5, 0);
    mainGroup.add(tank);

    // 粒子系统（完全未修改）
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*20;
        pPos[i*3+1] = Math.random()*10;
        pPos[i*3+2] = (Math.random()-0.5)*10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    const opCount = 300;
    const opGeo = new THREE.BufferGeometry();
    const opPos = new Float32Array(opCount * 3);
    for(let i=0; i<opCount; i++) {
        opPos[i*3] = 4 + (Math.random()-0.5)*3.8;
        opPos[i*3+1] = 1.5 + (Math.random()-0.5)*5.8;
        opPos[i*3+2] = (Math.random()-0.5)*3.8;
    }
    opGeo.setAttribute('position', new THREE.BufferAttribute(opPos, 3));
    const opMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.15, transparent: true, opacity: 0.8 });
    const oilParticles = new THREE.Points(opGeo, opMat);
    oilParticlesRef.current = oilParticles;
    mainGroup.add(oilParticles);

    const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -1.5;
    scene.add(grid);

    // 交互逻辑（完全未修改）
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    mountRef.current.addEventListener('mousemove', onMouseMove);

    // 动画逻辑（完全未修改）
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      if (screwsRef.current) {
          screwsRef.current.children[0].rotation.y += motorRpm * 0.001;
          screwsRef.current.children[1].rotation.y -= motorRpm * 0.0015;
          screwsRef.current.visible = viewMode !== 'standard';
      }

      if (particlesRef.current) {
          const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] -= 0.05 * airFlowIntensity;
              if (pos[i*3+1] < -1.5) pos[i*3+1] = 10;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (oilParticlesRef.current) {
          const pos = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<opCount; i++) {
              pos[i*3+1] += 0.02 * oilCirculationSpeed;
              if (pos[i*3+1] > 4.5) pos[i*3+1] = -1.5;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          oilParticlesRef.current.visible = viewMode === 'xray';
      }

      if (selectedId && mainGroupRef.current) {
          // 选中高亮逻辑（保留）
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
      mountRef.current?.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode, motorRpm, airFlowIntensity, oilCirculationSpeed]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
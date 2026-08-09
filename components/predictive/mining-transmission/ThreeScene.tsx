import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransmissionSceneProps } from './three-types';

export const TransmissionThreeScene: React.FC<TransmissionSceneProps> = ({
  inputRpm,
  outputRpm,
  currentGear,
  clutches,
  oilTemp,
  vibrationLevel,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gearGroupsRef = useRef<THREE.Group[]>([]);
  const shaftRef = useRef<THREE.Mesh | null>(null);
  const housingRef = useRef<THREE.Mesh | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);

  // 2026.03.04 - Bug修复：创建Ref存储实时变化的状态值，避免依赖项变化触发useEffect重建场景
  // Bug情况：3D模型频繁闪烁，渲染不稳定
  // Bug原因：useEffect依赖项（inputRpm/outputRpm等）频繁变化，导致整个Three.js场景反复销毁重建
  const inputRpmRef = useRef(inputRpm);
  const outputRpmRef = useRef(outputRpm);
  const currentGearRef = useRef(currentGear);
  const clutchesRef = useRef(clutches);
  const oilTempRef = useRef(oilTemp);
  const vibrationLevelRef = useRef(vibrationLevel);
  const viewModeRef = useRef(viewMode);

  // 仅更新Ref值，不触发场景重建
  useEffect(() => {
    inputRpmRef.current = inputRpm;
    outputRpmRef.current = outputRpm;
    currentGearRef.current = currentGear;
    clutchesRef.current = clutches;
    oilTempRef.current = oilTemp;
    vibrationLevelRef.current = vibrationLevel;
    viewModeRef.current = viewMode;
  }, [inputRpm, outputRpm, currentGear, clutches, oilTemp, vibrationLevel, viewMode]);

  // 核心渲染逻辑：仅执行一次（无依赖项），通过Ref读取实时值
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-transmission useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // 2026.03.04 - 优化：调亮雾色+降低雾密度，减少亮度遮挡，提升整体通透感
    scene.fog = new THREE.FogExp2(0x100800, 0.01); // 雾色调亮，密度从0.03→0.01

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights --- 2026.03.04 全面优化光照系统，提升亮度且不修改材质/模型颜色
    // 1. 环境光：大幅提升强度，保证基础亮度全覆盖（0.3→0.8）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 2. 新增半球光：模拟天空/地面环境光，提升明暗层次和整体亮度
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemisphereLight.position.set(0, 15, 0);
    scene.add(hemisphereLight);

    // 3. 主琥珀光：大幅提升强度，作为核心照明源（3→6）
    const mainLight = new THREE.PointLight(0xf59e0b, 6, 50); // Amber light
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    // 4. 蓝色背光：提升强度，补充侧面亮度（5→8）
    const backLight = new THREE.SpotLight(0x3b82f6, 8); // Blue rim light
    backLight.position.set(-10, 5, -5);
    scene.add(backLight);

    // 5. 新增底部补光：解决模型底部暗部问题，提升亮度均匀性
    const bottomFillLight = new THREE.PointLight(0xffffff, 3.0, 40);
    bottomFillLight.position.set(0, -8, 0);
    scene.add(bottomFillLight);

    // --- Materials --- 完全保留原有配置，不修改任何颜色/发光属性
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, metalness: 0.9, roughness: 0.3 
    });
    
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0xb45309, metalness: 0.7, roughness: 0.4 
    });
    
    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const clutchPlateMat = new THREE.MeshStandardMaterial({
        color: 0x44403c, metalness: 0.5, roughness: 0.9
    });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Transmission Housing
    const housingGeo = new THREE.CylinderGeometry(4, 4, 12, 32, 1, true);
    housingGeo.rotateZ(Math.PI / 2);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housingRef.current = housing;
    mainGroup.add(housing);

    // 2. Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 16);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    shaftRef.current = shaft;
    mainGroup.add(shaft);

    // 3. Planetary Gear Sets & Clutches
    gearGroupsRef.current = [];
    const setPositions = [-3, 0, 3]; 

    setPositions.forEach((x, i) => {
        const setGroup = new THREE.Group();
        setGroup.position.x = x;
        mainGroup.add(setGroup);
        gearGroupsRef.current.push(setGroup);

        // Sun Gear (Center)
        const sunGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 24);
        sunGeo.rotateZ(Math.PI/2);
        const sun = new THREE.Mesh(sunGeo, steelMat);
        setGroup.add(sun);

        // Planet Gears (3)
        const planetGroup = new THREE.Group();
        setGroup.add(planetGroup);
        
        for(let p=0; p<3; p++) {
            const angle = (p / 3) * Math.PI * 2;
            const planetGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 16);
            planetGeo.rotateZ(Math.PI/2);
            const planet = new THREE.Mesh(planetGeo, steelMat);
            planet.position.set(0, Math.cos(angle)*2.2, Math.sin(angle)*2.2);
            planetGroup.add(planet);
        }

        // Ring Gear (Outer)
        const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 16, 64);
        ringGeo.rotateY(Math.PI/2);
        const ring = new THREE.Mesh(ringGeo, bronzeMat);
        setGroup.add(ring);

        // Clutch Pack (Surrounding)
        for(let c=0; c<5; c++) {
            const clutchGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 32);
            clutchGeo.rotateZ(Math.PI/2);
            const clutchMesh = new THREE.Mesh(clutchGeo, clutchPlateMat.clone());
            clutchMesh.position.x = (c - 2) * 0.2;
            clutchMesh.name = `clutch-plate-${i}-${c}`;
            setGroup.add(clutchMesh);
        }
    });

    // 4. Oil Particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 10;
        pPos[i*3+1] = -2 + Math.random() * 2;
        pPos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 0.1,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    oilParticlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      const currentInputRpm = inputRpmRef.current;
      const currentOutputRpm = outputRpmRef.current;
      const currentClutches = clutchesRef.current;
      const currentVibration = vibrationLevelRef.current;
      const currentViewMode = viewModeRef.current;

      // 1. Shaft Rotation
      if (shaftRef.current) {
          shaftRef.current.rotation.x -= (currentInputRpm / 60) * 0.1;
      }

      // 2. Gear Set Animation & Clutch State
      gearGroupsRef.current.forEach((group, i) => {
          const carrier = group.children[1];
          const sun = group.children[0];
          
          const speedFactor = 1 / (i + 1);
          
          sun.rotation.x -= (currentInputRpm/60) * 0.1;
          carrier.rotation.x -= (currentOutputRpm/60) * 0.1 * speedFactor;
          
          const clutchData = currentClutches[i];
          if (clutchData) {
              const isEngaged = clutchData.isEngaged;
              const heat = Math.min(1, (clutchData.temp - 60)/100);
              
              for(let c=0; c<5; c++) {
                  const plate = group.getObjectByName(`clutch-plate-${i}-${c}`) as THREE.Mesh;
                  if (plate) {
                      const mat = plate.material as THREE.MeshStandardMaterial;
                      
                      if (currentViewMode === 'thermal') {
                          mat.color.setHSL(0.7 - heat*0.7, 1.0, 0.5);
                          mat.emissive.setHSL(0.7 - heat*0.7, 1.0, 0.5);
                          mat.emissiveIntensity = 0.5;
                      } else {
                          if (isEngaged) {
                              mat.color.setHex(0xf59e0b);
                              mat.emissive.setHex(0xf59e0b);
                              mat.emissiveIntensity = 0.3;
                              plate.position.x = (c - 2) * 0.15; 
                          } else {
                              mat.color.setHex(0x44403c);
                              mat.emissive.setHex(0x000000);
                              mat.emissiveIntensity = 0;
                              plate.position.x = (c - 2) * 0.2;
                          }
                      }
                  }
              }
          }
      });

      // 3. Vibration Shake
      if (mainGroup && currentVibration > 0) {
          mainGroup.position.y = Math.sin(time * 50) * currentVibration * 0.05;
          mainGroup.position.z = Math.cos(time * 50) * currentVibration * 0.05;
      }

      // 4. Housing Visibility
      if (housingRef.current) {
          const mat = housingRef.current.material as THREE.MeshPhysicalMaterial;
          if (currentViewMode === 'solid') {
              mat.opacity = 0.9;
              mat.color.setHex(0x475569);
          } else {
              mat.opacity = 0.2;
              mat.color.setHex(0x1c1917);
          }
      }

      // 5. Oil Particles Animation
      if (oilParticlesRef.current) {
          const pos = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3] += (currentInputRpm > 0 ? 0.05 : 0) * (Math.random() > 0.5 ? 1 : -1);
              if (Math.abs(pos[i*3]) > 6) pos[i*3] *= -0.9;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          oilParticlesRef.current.visible = currentViewMode !== 'solid';
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
  }, []); // 清空依赖项，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
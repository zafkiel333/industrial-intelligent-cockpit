import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpVibrationProps } from './three-types';

export const PumpVibrationScene: React.FC<PumpVibrationProps> = ({ 
  rpm, 
  pressure, 
  vibration, 
  temperature,
  cavitation,
  flowRate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gearsRef = useRef<THREE.Group[]>([]);
  const housingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  // 2026.03.02 修复bug：因useEffect依赖项（rpm/pressure等）频繁变化导致useEffect反复触发，场景重建引发模型闪烁
  // bug原因：原逻辑中初始化场景的useEffect依赖实时变化的props变量，每次props更新都会重新执行useEffect，
  // 重建整个Three.js场景、相机、渲染器、几何体等，导致视觉上的模型闪烁/重绘问题
  // 修复方案：使用refs保存实时props值，初始化场景的useEffect仅执行一次（依赖数组为空），
  // 动画循环中读取refs的current值获取最新props，避免场景反复重建
  // 2026.03.02 补充修复：Props初始值无容错导致NaN阻塞动画，Canvas清理逻辑不彻底
  const rpmRef = useRef(rpm);
  const pressureRef = useRef(pressure);
  const vibrationRef = useRef(vibration);
  const temperatureRef = useRef(temperature);
  const cavitationRef = useRef(cavitation);
  const flowRateRef = useRef(flowRate);

  // 仅更新ref值，不触发场景重建
  useEffect(() => {
    rpmRef.current = rpm;
    pressureRef.current = pressure;
    vibrationRef.current = vibration;
    temperatureRef.current = temperature;
    cavitationRef.current = cavitation;
    flowRateRef.current = flowRate;
  }, [rpm, pressure, vibration, temperature, cavitation, flowRate]);

  // 初始化Three.js场景，仅执行一次（依赖数组为空）
  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050202, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    console.log("=== hydro-pump-vibrration excute clear canvas ===");
    
    // 2026.03.02 修复：彻底清空所有旧canvas，避免残留导致渲染层覆盖
    const allCanvas = mountRef.current.querySelectorAll('canvas');
    allCanvas.forEach(canvas => mountRef.current!.removeChild(canvas));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.update(); // 初始化时强制更新控制器

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff0000, 1, 20);
    redLight.position.set(5, 5, 5);
    scene.add(redLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 1, 20);
    cyanLight.position.set(-5, -5, -5);
    scene.add(cyanLight);

    // --- Geometry: Gear Pump ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.8, 
      roughness: 0.3 
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7, // Glassy
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    // 1. Gears
    const createGear = (x: number) => {
        const gearGroup = new THREE.Group();
        gearGroup.position.x = x;
        
        const coreGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
        const core = new THREE.Mesh(coreGeo, metalMat);
        core.rotation.x = Math.PI / 2;
        gearGroup.add(core);

        // Teeth
        const teethCount = 8;
        const toothGeo = new THREE.BoxGeometry(0.4, 2.4, 1);
        for(let i=0; i<teethCount; i++) {
            const tooth = new THREE.Mesh(toothGeo, metalMat);
            tooth.rotation.z = (i / teethCount) * Math.PI * 2;
            gearGroup.add(tooth);
        }
        return gearGroup;
    };

    const gear1 = createGear(-1.1);
    const gear2 = createGear(1.1);
    // Offset rotation for meshing
    gear2.rotation.z = (Math.PI * 2 / 8) / 2;
    
    mainGroup.add(gear1);
    mainGroup.add(gear2);
    gearsRef.current = [gear1, gear2];

    // 2. Housing
    const housingGeo = new THREE.BoxGeometry(5.5, 3.5, 2);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housingRef.current = housing;
    mainGroup.add(housing);

    // Inlet/Outlet pipes
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const inlet = new THREE.Mesh(pipeGeo, metalMat);
    inlet.position.y = 2.5;
    mainGroup.add(inlet);
    
    const outlet = new THREE.Mesh(pipeGeo, metalMat);
    outlet.position.y = -2.5;
    mainGroup.add(outlet);

    // 3. Flow Particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 4;
        pPos[i*3+1] = (Math.random() - 0.5) * 6; // Vertical flow range
        pPos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update(); // 必须持续更新控制器才能启用阻尼/自动旋转

      // 2026.03.02 修复：添加容错处理，确保所有值为有效数字，避免NaN
      const currentRpm = Number(rpmRef.current) || 100; // 默认100rpm保证初始旋转
      const currentPressure = Number(pressureRef.current) || 2.5; // 默认压力值
      const currentVibration = Number(vibrationRef.current) || 1; // 默认轻微振动
      const currentCavitation = Boolean(cavitationRef.current) || false;
      const currentFlowRate = Number(flowRateRef.current) || 50; // 默认流速

      // 1. Rotate Gears
      const rotSpeed = currentRpm / 60 * 0.1; // 转速转成每秒旋转速度
      if (gearsRef.current.length === 2) {
          gearsRef.current[0].rotation.z -= rotSpeed;
          gearsRef.current[1].rotation.z += rotSpeed;
      }

      // 2. Vibration Shake
      if (mainGroupRef.current) {
          const shake = currentVibration * 0.01; // 缩放振动幅度
          mainGroupRef.current.position.x = (Math.random() - 0.5) * shake;
          mainGroupRef.current.position.y = (Math.random() - 0.5) * shake;
          mainGroupRef.current.position.z = (Math.random() - 0.5) * shake; // 补充Z轴振动更自然
      }

      // 3. Pressure Color Effect on Housing
      if (housingRef.current) {
          const mat = housingRef.current.material as THREE.MeshPhysicalMaterial;
          // 压力范围 2.5-6.0 MPa 映射到颜色（红→蓝）
          const pNorm = Math.min(1, Math.max(0, (currentPressure - 2.5) / 3.5));
          const targetColor = new THREE.Color().lerpColors(
              new THREE.Color(0x475569), // 初始蓝色
              new THREE.Color(0xff0000), // 高压红色
              pNorm
          );
          mat.color.lerp(targetColor, 0.1); // 平滑过渡颜色
          mat.emissive.lerp(targetColor, 0.1);
          mat.emissiveIntensity = pNorm * 0.5;
      }

      // 4. Particle Flow
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const flowSpeed = currentFlowRate * 0.001; 
          for(let i=0; i<pCount; i++) {
              // 粒子从上到下流动（泵进口→出口）
              positions[i*3+1] -= flowSpeed;
              
              // 气蚀效果：粒子随机抖动
              if (currentCavitation) {
                  positions[i*3] += (Math.random()-0.5)*0.05;
                  positions[i*3+2] += (Math.random()-0.5)*0.05;
              }

              // 粒子流出底部后重置到顶部
              if (positions[i*3+1] < -3) {
                  positions[i*3+1] = 3;
                  positions[i*3] = (Math.random() - 0.5) * 4;
                  positions[i*3+2] = (Math.random() - 0.5) * 1.5;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // 气蚀时粒子变白色，正常时黄色
          (particlesRef.current.material as THREE.PointsMaterial).color.setHex(
              currentCavitation ? 0xffffff : 0xffaa00
          );
      }

      renderer.render(scene, camera);
    };
    animate(); // 启动动画循环

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
      cancelAnimationFrame(frameId); // 销毁时终止动画循环
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // 释放Three.js资源，避免内存泄漏
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    };
  }, []); // 依赖数组为空，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" style={{ minHeight: '400px' }} />;
};
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LighthouseAnimatables, PowerViewMode } from './three-types';

interface ThreeSceneProps {
  windSpeed?: number; // m/s
  solarIntensity?: number; // 0-1
  batteryTemp?: number; // 0-1
  viewMode?: PowerViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  windSpeed = 12,
  solarIntensity = 0.8,
  batteryTemp = 0.3,
  viewMode = 'energy-flow'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // 2026.03.18 - 修复：使用ref存储实时props值，避免依赖项触发useEffect重建3D场景
  // Bug情况：3D模型出现频繁闪烁问题，表现为场景反复销毁和重建
  // Bug原因：原代码中渲染3D场景的useEffect依赖了windSpeed/solarIntensity/batteryTemp/viewMode，这些变量实时变化会触发useEffect重新执行，销毁原有3D场景并重建，造成视觉闪烁
  const windSpeedRef = useRef(windSpeed);
  const solarIntensityRef = useRef(solarIntensity);
  const batteryTempRef = useRef(batteryTemp);
  const viewModeRef = useRef(viewMode);

  // 2026.03.18 - 仅更新ref值以保留最新props，不触发3D场景重建
  useEffect(() => {
    windSpeedRef.current = windSpeed;
    solarIntensityRef.current = solarIntensity;
    batteryTempRef.current = batteryTemp;
    viewModeRef.current = viewMode;
  }, [windSpeed, solarIntensity, batteryTemp, viewMode]);

  // 2026.03.18 - 移除原依赖项，改为空依赖，仅初始化一次3D场景
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===lighthouse-power useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b14);
    // 海雾效果
    scene.fog = new THREE.FogExp2(0x050b14, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    
    // 模拟太阳/月亮 - 初始值使用ref
    const skyLight = new THREE.DirectionalLight(0xffffff, solarIntensityRef.current > 0.1 ? 1.5 : 0.2);
    skyLight.position.set(-10, 20, -10);
    scene.add(skyLight);

    // 信号灯发光模拟
    const signalGlow = new THREE.PointLight(0xf59e0b, 2, 20);
    signalGlow.position.set(0, 12, 0);
    scene.add(signalGlow);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: LighthouseAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 礁石基座 (Rock Base) ---
    const rockGeo = new THREE.DodecahedronGeometry(8, 1);
    // 压扁一点做岛屿
    rockGeo.scale(1.5, 0.6, 1.5);
    const rockMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.9, 
        metalness: 0.1,
        flatShading: true
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = -2;
    group.add(rock);
    disposables.push(rockGeo, rockMat);

    // --- 2. 灯塔塔身 (Lighthouse Body) ---
    const towerGeo = new THREE.CylinderGeometry(1.5, 2.5, 12, 8);
    const towerMat = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0, // White
        roughness: 0.5,
        metalness: 0.2
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 4;
    group.add(tower);
    
    // 红白相间条纹 (通过多材质或简单的环模拟)
    const stripeGeo = new THREE.CylinderGeometry(1.9, 2.1, 2, 8);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 4;
    group.add(stripe);
    disposables.push(towerGeo, towerMat, stripeGeo, stripeMat);

    // --- 3. 灯笼室与光源 (Lantern Room) ---
    const lanternGeo = new THREE.CylinderGeometry(1.8, 1.8, 2, 8, 1, true);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.5 });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 11;
    group.add(lantern);

    // 旋转射灯
    const spotLight = new THREE.SpotLight(0xffaa00, 100, 60, 0.3, 0.5, 1);
    spotLight.position.set(0, 11, 0);
    // 创建一个目标点让灯光跟随旋转
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(10, 11, 0);
    group.add(spotTarget);
    spotLight.target = spotTarget;
    group.add(spotLight);
    
    // 光束实体化 (Volumetric Beam Fake)
    const beamGeo = new THREE.ConeGeometry(2, 30, 32, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 15, 0);
    const beamMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00, 
        transparent: true, 
        opacity: 0.1, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    // 将光束挂载到旋转中心
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 11, 0);
    beamPivot.add(beamMesh);
    group.add(beamPivot);

    animatables.beaconLight = spotLight;
    animatables.beaconMesh = beamPivot; // Use pivot for rotation
    disposables.push(lanternGeo, lanternMat, beamGeo, beamMat);

    // --- 4. 风力发电机 (Wind Turbine) ---
    const turbineGroup = new THREE.Group();
    turbineGroup.position.set(-6, 2, 4);
    group.add(turbineGroup);

    // 塔杆
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.2, 6, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3;
    turbineGroup.add(pole);

    // 叶片组
    const bladeGroup = new THREE.Group();
    bladeGroup.position.y = 6;
    turbineGroup.add(bladeGroup);
    animatables.turbineBlades = bladeGroup;

    const bladeGeo = new THREE.BoxGeometry(0.2, 2.5, 0.05);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for(let i=0; i<3; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.z = i * (Math.PI * 2 / 3);
        blade.translateY(1.25);
        bladeGroup.add(blade);
    }
    disposables.push(poleGeo, poleMat, bladeGeo, bladeMat);

    // --- 5. 光伏板 (Solar Panels) ---
    const panelGroup = new THREE.Group();
    panelGroup.position.set(5, 1, 3);
    panelGroup.rotation.x = -0.3; // Tilt
    panelGroup.rotation.y = -0.5; // Face Sun
    group.add(panelGroup);
    animatables.solarPanels = panelGroup;

    const panelGeo = new THREE.BoxGeometry(3, 0.1, 2);
    const panelMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e3a8a, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: 0x1e3a8a,
        emissiveIntensity: solarIntensityRef.current * 0.5
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panelGroup.add(panel);
    
    // 支架
    const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
    const stand = new THREE.Mesh(standGeo, poleMat);
    stand.position.y = -0.7;
    panelGroup.add(stand);
    disposables.push(panelGeo, panelMat);

    // --- 6. 电池舱 (Battery Bunker) ---
    // 可视化为半透明盒子，显示热力
    const battGeo = new THREE.BoxGeometry(2, 1.5, 1.5);
    const battMat = new THREE.MeshBasicMaterial({ 
        color: 0x10b981, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.5
    });
    const battery = new THREE.Mesh(battGeo, battMat);
    battery.position.set(0, 0.8, 5); // 位于基座上
    group.add(battery);
    
    // 内部热力核心
    const heatCoreGeo = new THREE.BoxGeometry(1.8, 1.3, 1.3);
    const heatCoreMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0 // 初始透明
    });
    const heatCore = new THREE.Mesh(heatCoreGeo, heatCoreMat);
    battery.add(heatCore);
    animatables.batteryBank = battery; // Store group ref, use children for anim
    disposables.push(battGeo, battMat, heatCoreGeo, heatCoreMat);

    // --- 7. 海浪 (Sea Surface) ---
    const seaGeo = new THREE.PlaneGeometry(100, 100, 60, 60);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshStandardMaterial({ 
        color: 0x0c4a6e, 
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.8,
        wireframe: false
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.y = -1;
    scene.add(sea);
    animatables.waves = sea;
    disposables.push(seaGeo, seaMat);

    // --- 8. 能量粒子流 (Energy Particles) ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    // 随机分布在风机和光伏板到电池的路径上
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.15, transparent: true, opacity: 0 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.energyParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 2026.03.18 - 读取ref最新值：更新太阳/月亮光强度
      skyLight.intensity = solarIntensityRef.current > 0.1 ? 1.5 : 0.2;
      // 2026.03.18 - 读取ref最新值：更新光伏板发光强度
      (panel.material as THREE.MeshStandardMaterial).emissiveIntensity = solarIntensityRef.current * 0.5;

      // 灯塔旋转
      if (animatables.beaconMesh) {
          animatables.beaconMesh.rotation.y -= 0.02; // 光束旋转
          // 聚光灯目标随之旋转
          const angle = animatables.beaconMesh.rotation.y;
          spotTarget.position.set(Math.cos(angle) * 10, 11, Math.sin(angle) * 10);
      }

      // 2026.03.18 - 读取ref最新值：风机旋转速度
      if (animatables.turbineBlades) {
          animatables.turbineBlades.rotation.z -= windSpeedRef.current * 0.02;
      }

      // 海浪波动
      if (animatables.waves) {
         // 简单模拟: 整体上下微动，实际应使用顶点着色器
         animatables.waves.position.y = -1 + Math.sin(time) * 0.2;
      }

      // 2026.03.18 - 读取ref最新值：电池热力视图模式
      if (viewModeRef.current === 'battery-thermal') {
          // 电池热力显现
          if (animatables.batteryBank && animatables.batteryBank.children[0]) {
              const core = animatables.batteryBank.children[0] as THREE.Mesh;
              (core.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 2) * 0.2;
              // 2026.03.18 - 读取ref最新值：电池温度对应颜色
              (core.material as THREE.MeshBasicMaterial).color.setHSL(0.3 - batteryTempRef.current * 0.3, 1, 0.5);
          }
      } else {
          if (animatables.batteryBank && animatables.batteryBank.children[0]) {
            (animatables.batteryBank.children[0] as THREE.Mesh).material.opacity = 0;
          }
      }

      // 2026.03.18 - 读取ref最新值：能量流视图模式
      if (viewModeRef.current === 'energy-flow' && animatables.energyParticles) {
          (animatables.energyParticles.material as THREE.PointsMaterial).opacity = 0.8;
          const pos = animatables.energyParticles.geometry.attributes.position.array as Float32Array;
          // 简单的粒子飞向电池动画
          const target = new THREE.Vector3(0, 0.8, 5); // Battery pos
          for(let i=0; i<pCount; i++) {
              // Reset if close
              const x = pos[i*3];
              const y = pos[i*3+1];
              const z = pos[i*3+2];
              const dist = Math.sqrt((x-target.x)**2 + (y-target.y)**2 + (z-target.z)**2);
              
              if (dist < 0.5 || (x===0 && y===0 && z===0)) {
                  // Respawn at sources
                  const source = Math.random() > 0.5 ? 
                      new THREE.Vector3(-6, 8, 4) : // Wind
                      new THREE.Vector3(5, 1, 3);   // Solar
                  pos[i*3] = source.x + (Math.random()-0.5);
                  pos[i*3+1] = source.y + (Math.random()-0.5);
                  pos[i*3+2] = source.z + (Math.random()-0.5);
              } else {
                  // Move towards target
                  pos[i*3] += (target.x - x) * 0.05;
                  pos[i*3+1] += (target.y - y) * 0.05;
                  pos[i*3+2] += (target.z - z) * 0.05;
              }
          }
          animatables.energyParticles.geometry.attributes.position.needsUpdate = true;
      } else if (animatables.energyParticles) {
          (animatables.energyParticles.material as THREE.PointsMaterial).opacity = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, []); // 2026.03.18 - 空依赖，仅初始化一次3D场景

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
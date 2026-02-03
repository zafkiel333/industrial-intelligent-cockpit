import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SwitchStationSceneProps } from './three-types';

export const SwitchStationScene: React.FC<SwitchStationSceneProps> = ({ 
  weather, 
  activeFaultId,
  loadPercentage,
  gridVoltage
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);
  const faultEffectRef = useRef<THREE.PointLight | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020409);
    scene.fog = new THREE.FogExp2(0x020409, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 30);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // --- 核心修复：光照映射与亮度设置 ---
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2; 
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !activeFaultId;
    controls.autoRotateSpeed = 0.5;

    // --- 增强光影系统 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 增加基础环境光
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x4c6ef5, 1.2); // 增强模拟月光/背景光
    moonLight.position.set(20, 50, -20);
    scene.add(moonLight);

    const keyLight = new THREE.PointLight(0x0ea5e9, 5, 50); // 电子蓝主光源
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    const faultLight = new THREE.PointLight(0xff0000, 0, 30); // 故障报警红光
    faultLight.position.set(0, 5, 0);
    scene.add(faultLight);
    faultEffectRef.current = faultLight;

    // --- 材质定义 ---
    const steelMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x94a3b8, metalness: 0.9, roughness: 0.1, clearcoat: 1.0 
    });
    const porcelainMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x451a03, metalness: 0.2, roughness: 0.1, clearcoat: 0.8 // 瓷质绝缘子
    });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // --- 几何体构建 ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. 地面
    const grid = new THREE.GridHelper(100, 50, 0x334155, 0x0f172a);
    grid.position.y = 0;
    mainGroup.add(grid);

    // 2. 构架 (Gantry Structures)
    const createGantry = (z: number) => {
        const gantry = new THREE.Group();
        gantry.position.z = z;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(20, 0.6, 0.6), steelMat);
        beam.position.y = 10;
        gantry.add(beam);
        [-8, 8].forEach(x => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10, 0.8), steelMat);
            leg.position.set(x, 5, 0);
            gantry.add(leg);
        });
        mainGroup.add(gantry);
    };
    createGantry(-10);
    createGantry(10);

    // 3. 核心设备：断路器与隔离开关
    const createPole = (x: number, z: number, id: string) => {
        const pole = new THREE.Group();
        pole.position.set(x, 0, z);
        pole.userData = { id };

        // 绝缘支柱
        for(let i=0; i<3; i++) {
            const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16), porcelainMat);
            ins.position.y = 0.6 + i*1.2;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), porcelainMat);
            ring.rotation.x = Math.PI/2;
            ring.position.y = 0.6 + i*1.2;
            pole.add(ins);
            pole.add(ring);
        }

        // 顶部导电体
        const conductor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 3), steelMat);
        conductor.position.y = 4.0;
        pole.add(conductor);
        
        mainGroup.add(pole);
    };

    [-4, 0, 4].forEach(x => {
        createPole(x, -5, `ds-a-${x}`);
        createPole(x, 0, `cb-${x}`);
        createPole(x, 5, `ds-b-${x}`);
    });

    // 4. 雨水粒子系统
    const pCount = 5000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 60;
        pPos[i*3+1] = Math.random() * 40;
        pPos[i*3+2] = (Math.random()-0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.4 });
    const rain = new THREE.Points(pGeo, pMat);
    rain.visible = false;
    rainSystemRef.current = rain;
    scene.add(rain);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 天气逻辑
      if (weather !== 'clear' && rainSystemRef.current) {
          rainSystemRef.current.visible = true;
          const pos = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] -= (weather === 'storm' ? 1.2 : 0.6);
              if (pos[i*3+1] < 0) pos[i*3+1] = 40;
          }
          rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
          
          if (weather === 'storm' && Math.random() > 0.98) {
              moonLight.intensity = 10;
              setTimeout(() => moonLight.intensity = 1.2, 50);
          }
      } else if (rainSystemRef.current) {
          rainSystemRef.current.visible = false;
      }

      // 故障特效
      if (activeFaultId && faultEffectRef.current) {
          faultEffectRef.current.intensity = 5 + Math.sin(time * 30) * 5;
          faultEffectRef.current.position.y = 4 + Math.sin(time * 10) * 0.5;
      } else if (faultEffectRef.current) {
          faultEffectRef.current.intensity = 0;
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
    // Fix: Remove undefined variable 'viewMode' from the dependency array.
  }, [weather, activeFaultId]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
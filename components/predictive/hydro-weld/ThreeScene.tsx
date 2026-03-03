import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WeldSceneProps } from './three-types';

export const WeldThreeScene: React.FC<WeldSceneProps> = ({ 
  pipeDiameter,
  weldWidth,
  cracks,
  stressFactor,
  isScanning,
  scanProgress,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const weldRef = useRef<THREE.Mesh | null>(null);
  const scanRingRef = useRef<THREE.Group | null>(null);
  const crackGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pipeMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const scannerLightRef = useRef<THREE.PointLight | null>(null);

  // 2026.03.03 - Bug修复：创建refs存储动态props，避免依赖项变化触发useEffect重建场景
  // Bug情况：原代码useEffect依赖频繁变化的props，导致反复触发重建3D场景，模型出现闪烁
  // Bug原因：依赖项数组包含cracks/stressFactor/isScanning/scanProgress/viewMode等实时变化的变量，
  // 每次变量更新都会重新执行useEffect，销毁并重建整个3D场景，引发视觉闪烁
  const cracksRef = useRef(cracks);
  const stressFactorRef = useRef(stressFactor);
  const isScanningRef = useRef(isScanning);
  const scanProgressRef = useRef(scanProgress);
  const viewModeRef = useRef(viewMode);

  // 2026.03.03 - 单独更新动态props的ref，不触发场景重建
  useEffect(() => {
    cracksRef.current = cracks;
    stressFactorRef.current = stressFactor;
    isScanningRef.current = isScanning;
    scanProgressRef.current = scanProgress;
    viewModeRef.current = viewMode;

    // 处理裂缝变化：销毁旧裂缝模型，创建新的
    if (crackGroupRef.current) {
      // 清空旧裂缝
      crackGroupRef.current.clear();
      const crackMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
      // 创建新裂缝
      cracks.forEach(c => {
        const rad = c.angle * (Math.PI / 180);
        const crackGeo = new THREE.TorusGeometry(4.06, 0.05, 8, 16, (c.length / 100));
        const crack = new THREE.Mesh(crackGeo, crackMat);
        crack.rotation.y = Math.PI / 2;
        crack.rotation.x = -rad;
        crackGroupRef.current?.add(crack);
      });
    }
  }, [cracks, stressFactor, isScanning, scanProgress, viewMode]);

  // 2026.03.03 - 主场景初始化useEffect，依赖项清空，仅挂载时执行一次
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-weld useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);
    sceneRef.current = scene;

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    
    // 清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 初始化控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // 初始化灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const scannerLight = new THREE.PointLight(0x22d3ee, 0, 10);
    scene.add(scannerLight);
    scannerLightRef.current = scannerLight;

    // 初始化材质
    const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.9 
    });
    pipeMatRef.current = pipeMat;
    
    const weldMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, metalness: 0.9, roughness: 0.4, emissive: 0x000000 
    });

    // 初始化几何体
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 管道模型
    const pipeGeo = new THREE.CylinderGeometry(4, 4, 10, 64, 1, true);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    mainGroup.add(pipe);

    // 2. 焊缝模型
    const weldGeo = new THREE.CylinderGeometry(4.05, 4.05, 0.8, 64, 1, true);
    weldGeo.rotateZ(Math.PI / 2);
    const weld = new THREE.Mesh(weldGeo, weldMat);
    weldRef.current = weld;
    mainGroup.add(weld);

    // 3. 裂缝组（初始为空，后续通过ref更新）
    const crackGroup = new THREE.Group();
    crackGroupRef.current = crackGroup;
    mainGroup.add(crackGroup);

    // 4. 扫描环模型
    const scanGroup = new THREE.Group();
    scanRingRef.current = scanGroup;
    scene.add(scanGroup);

    const probe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1), new THREE.MeshStandardMaterial({color: 0x22d3ee}));
    probe.position.set(0, 4.3, 0);
    scanGroup.add(probe);

    // 扫描光束模型
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.5, 4, 16);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({color: 0x22d3ee, transparent: true, opacity: 0.2}));
    beam.position.y = 2.3;
    probe.add(beam);

    // 动画循环
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // 更新控制器
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 扫描逻辑 - 读取ref中的实时值
      if (isScanningRef.current && scanRingRef.current) {
        scanRingRef.current.rotation.x = scanProgressRef.current * Math.PI * 2;
        if (scannerLightRef.current) {
          scannerLightRef.current.intensity = 5;
          scannerLightRef.current.position.copy(probe.getWorldPosition(new THREE.Vector3()));
        }
      } else if (scannerLightRef.current) {
        scannerLightRef.current.intensity = 0;
      }

      // 应力发光效果 - 读取ref中的实时值
      if (weldRef.current) {
        const mat = weldRef.current.material as THREE.MeshStandardMaterial;
        const stressColor = new THREE.Color(0xff0000);
        mat.emissive.lerpColors(new THREE.Color(0x000000), stressColor, stressFactorRef.current);
        mat.emissiveIntensity = stressFactorRef.current * 0.5;
      }

      // 视图模式切换 - 读取ref中的实时值
      if (pipeMatRef.current) {
        if (viewModeRef.current === 'xray') {
          pipeMatRef.current.opacity = 0.1;
          pipeMatRef.current.wireframe = true;
        } else {
          pipeMatRef.current.opacity = 0.9;
          pipeMatRef.current.wireframe = false;
        }
      }

      // 渲染场景
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      // 额外清理3D资源
      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (obj.material instanceof THREE.Material) {
              obj.material.dispose();
            }
          }
        });
      }
    };
  }, []); // 2026.03.03 - 清空依赖项，仅挂载时执行一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
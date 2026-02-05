
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShovelSceneProps } from './three-types';

export const ShovelThreeScene: React.FC<ShovelSceneProps> = ({
  parts,
  swingAngle,
  hoistHeight,
  crowdDistance,
  bucketAngle,
  activePartId,
  onPartClick,
  showXRay,
  isScanning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shovelRef = useRef<THREE.Group | null>(null);
  const upperWorksRef = useRef<THREE.Group | null>(null);
  const boomRef = useRef<THREE.Group | null>(null);
  const dipperRef = useRef<THREE.Group | null>(null);
  const scannerPlaneRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 25, 45);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 确保控制器绑定在 renderer.domElement 上
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- 灯光系统 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const blueLight = new THREE.PointLight(0x0ea5e9, 3, 100);
    blueLight.position.set(20, 20, 20);
    scene.add(blueLight);

    const sideLight = new THREE.PointLight(0x8b5cf6, 2, 100);
    sideLight.position.set(-20, 10, -10);
    scene.add(sideLight);

    // --- 材质定义 ---
    const mainColor = showXRay ? 0x334155 : 0x475569;
    const metalMat = new THREE.MeshStandardMaterial({
        color: mainColor,
        metalness: 0.9,
        roughness: 0.2,
        transparent: showXRay,
        opacity: showXRay ? 0.4 : 1.0,
        side: THREE.DoubleSide
    });

    // --- 电铲高保真模型构建 ---
    const shovelGroup = new THREE.Group();
    shovelRef.current = shovelGroup;
    scene.add(shovelGroup);

    // 1. 下部行走机构 (Tracks)
    const trackGroup = new THREE.Group();
    const trackBase = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 12), metalMat);
    trackBase.position.y = 1;
    trackGroup.add(trackBase);

    // 履带细节
    const crawlerGeo = new THREE.BoxGeometry(3, 2.5, 14);
    const crawlL = new THREE.Mesh(crawlerGeo, metalMat);
    crawlL.position.set(-4.5, 1.25, 0);
    trackGroup.add(crawlL);
    const crawlR = crawlL.clone();
    crawlR.position.x = 4.5;
    trackGroup.add(crawlR);
    shovelGroup.add(trackGroup);

    // 2. 上部旋转平台 (Upper Works)
    const upperWorks = new THREE.Group();
    upperWorks.position.y = 2;
    upperWorksRef.current = upperWorks;
    shovelGroup.add(upperWorks);

    // 机舱房 (House)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 11), metalMat);
    cabin.position.set(0, 3, -1.5);
    upperWorks.add(cabin);

    // 操作室 (Operator Cab) - 侧边突出
    const opCab = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 3), metalMat);
    opCab.position.set(4, 4.5, 3.5);
    upperWorks.add(opCab);

    // 3. 动臂 (Boom) - 桁架结构模拟
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 2, 4.5);
    boomGroup.rotation.x = -Math.PI / 4.5; 
    boomRef.current = boomGroup;
    upperWorks.add(boomGroup);

    // 动臂梁
    const beamL = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 20), metalMat);
    beamL.position.set(-2.5, 0, 10);
    boomGroup.add(beamL);
    const beamR = beamL.clone();
    beamR.position.x = 2.5;
    boomGroup.add(beamR);

    // 顶部横梁
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 1), metalMat);
    topBar.position.set(0, 0, 20);
    boomGroup.add(topBar);

    // 4. 斗杆与铲斗 (Dipper & Bucket)
    const dipperGroup = new THREE.Group();
    dipperGroup.position.set(0, 0, 10); // 动臂中间的支点
    dipperRef.current = dipperGroup;
    boomGroup.add(dipperGroup);

    // 斗杆
    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 14), metalMat);
    handle.position.z = 4;
    dipperGroup.add(handle);

    // 铲斗 (Bucket) - 增加细节
    const bucketGroup = new THREE.Group();
    bucketGroup.position.z = 11;
    dipperGroup.add(bucketGroup);

    const bucketMain = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), metalMat);
    bucketGroup.add(bucketMain);
    
    // 斗齿
    const toothGeo = new THREE.BoxGeometry(0.5, 0.2, 1);
    for(let i=0; i<5; i++) {
        const tooth = new THREE.Mesh(toothGeo, metalMat);
        tooth.position.set(-2 + i, -2.4, 2.8);
        bucketGroup.add(tooth);
    }

    // 5. 钢丝绳 (Cables) - 动态线条
    const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const cableGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 6, -1), // 起升机位置
        new THREE.Vector3(0, 0, 20), // 动臂顶端
        new THREE.Vector3(0, 3, 11)  // 铲斗连接点 (大致)
    ]);
    const cable = new THREE.Line(cableGeo, cableMat);
    boomGroup.add(cable);

    // 6. 地面网格
    const grid = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // 7. 扫描面特效
    const scanGeo = new THREE.PlaneGeometry(30, 30);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.2, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending 
    });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    scanner.visible = isScanning;
    scene.add(scanner);
    scannerPlaneRef.current = scanner;

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 1. 实时姿态控制 (线性插值平滑)
      if (upperWorksRef.current) {
          const targetRad = (swingAngle * Math.PI) / 180;
          upperWorksRef.current.rotation.y = THREE.MathUtils.lerp(upperWorksRef.current.rotation.y, targetRad, 0.05);
      }
      
      if (dipperRef.current) {
          // 提升运动
          const targetRot = -0.5 + (hoistHeight * 1.2);
          dipperRef.current.rotation.x = THREE.MathUtils.lerp(dipperRef.current.rotation.x, targetRot, 0.05);
          
          // 推压运动
          const targetExtend = -2 + (crowdDistance * 5);
          dipperRef.current.position.z = THREE.MathUtils.lerp(dipperRef.current.position.z, 10 + targetExtend, 0.05);
      }

      // 2. 扫描特效
      if (scannerPlaneRef.current && isScanning) {
          scannerPlaneRef.current.position.y = 10 + Math.sin(time * 2) * 10;
      }

      // 3. 故障部位报警 (通过灯光和材质颜色变色)
      parts.forEach(p => {
          if (p.riskLevel === 'critical' && shovelRef.current) {
              blueLight.intensity = 2 + Math.sin(time * 10) * 2;
              blueLight.color.setHex(0xef4444);
          }
      });

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
  }, [swingAngle, hoistHeight, crowdDistance, showXRay, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

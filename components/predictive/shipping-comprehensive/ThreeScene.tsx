import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipOverviewAnimatables, ShipSystemNode } from './three-types';

interface ThreeSceneProps {
  systemHealth: Record<string, number>; // 0-100
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  systemHealth
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 2026.03.18 - Bug修复：创建ref保存实时systemHealth值，避免渲染逻辑依赖项频繁变化
  // Bug情况：3D模型出现闪烁，原因是useEffect依赖项systemHealth频繁变化导致渲染逻辑反复触发
  const systemHealthRef = useRef<Record<string, number>>(systemHealth);

  // 单独更新ref值，不触发渲染逻辑重执行
  useEffect(() => {
    systemHealthRef.current = systemHealth;
  }, [systemHealth]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===shipping-comprehensive useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(35, 20, 35);

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

    // --- 全息光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 50, 20);
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight(0x0ea5e9, 20, 100);
    bluePoint.position.set(-20, 10, 20);
    scene.add(bluePoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ShipOverviewAnimatables = { nodes: new Map(), connectionLines: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 抽象船体 (Holographic Hull) ---
    const hullGroup = new THREE.Group();
    
    // 主船体几何
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0,0);
    hullShape.lineTo(40, 0); // Length
    hullShape.lineTo(45, 8); // Bow
    hullShape.lineTo(40, 10);
    hullShape.lineTo(0, 10); // Stern height
    hullShape.lineTo(-2, 8);
    hullShape.lineTo(0, 0);

    const extrudeSettings = { depth: 10, bevelEnabled: false };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeo.translate(-20, 0, -5); // Center it roughly

    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0x334155, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    
    const fillMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.8
    });

    const mainHull = new THREE.Mesh(hullGeo, fillMat);
    const mainHullWire = new THREE.Mesh(hullGeo, wireMat);
    hullGroup.add(mainHull);
    hullGroup.add(mainHullWire);

    // 船楼 (Superstructure)
    const towerGeo = new THREE.BoxGeometry(8, 12, 10);
    const tower = new THREE.Mesh(towerGeo, fillMat);
    const towerWire = new THREE.Mesh(towerGeo, wireMat);
    tower.position.set(-15, 16, 0);
    towerWire.position.set(-15, 16, 0);
    hullGroup.add(tower);
    hullGroup.add(towerWire);

    group.add(hullGroup);
    animatables.hull = mainHull;
    disposables.push(hullGeo, wireMat, fillMat, towerGeo);

    // --- 2. 关键系统节点 (System Nodes) ---
    // 定义系统节点基础配置（不含动态状态）
    const systemConfigs: Omit<ShipSystemNode, 'status'>[] = [
        { id: 'main-engine', name: '主机 (ME)', position: [-5, 5, 0] },
        { id: 'aux-engine', name: '辅机 (AE)', position: [-5, 8, 3] },
        { id: 'propulsion', name: '轴系 (Shaft)', position: [10, 2, 0] },
        { id: 'deck', name: '甲板机械', position: [15, 11, 0] },
        { id: 'bridge', name: '舰桥通导', position: [-15, 20, 0] },
        { id: 'cargo', name: '货舱监控', position: [5, 8, 0] },
    ];

    const nodeGeo = new THREE.IcosahedronGeometry(0.8, 1);
    // 存储节点材质引用，用于实时更新颜色
    const nodeMaterialMap = new Map<string, THREE.MeshStandardMaterial>();
    const ringMaterialMap = new Map<string, THREE.MeshBasicMaterial>();
    
    systemConfigs.forEach(sys => {
        // 初始状态从ref获取
        const healthValue = systemHealthRef.current[sys.id.split('-')[0]] ?? 100;
        const status = healthValue < 80 ? 'warning' : 'optimal';
        const color = status === 'optimal' ? 0x10b981 : 0xf59e0b;
        
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(...sys.position);

        const coreMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        const core = new THREE.Mesh(nodeGeo, coreMat);
        nodeGroup.add(core);

        // 脉冲光环
        const ringGeo = new THREE.RingGeometry(1.2, 1.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.4, 
            side: THREE.DoubleSide 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        nodeGroup.add(ring);

        // 垂直指示线
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, -sys.position[1], 0)]);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
        const lineObj = new THREE.Line(lineGeo, lineMat);
        nodeGroup.add(lineObj);

        group.add(nodeGroup);
        animatables.nodes?.set(sys.id, nodeGroup);
        // 存储材质引用用于实时更新
        nodeMaterialMap.set(sys.id, coreMat);
        ringMaterialMap.set(sys.id, ringMat);
        disposables.push(nodeGeo, coreMat, ringGeo, ringMat, lineGeo, lineMat);
    });

    // --- 3. 水面网格 (Digital Water) ---
    const waterGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 2;
    scene.add(water);
    disposables.push(waterGeo, waterMat);

    // --- 4. 扫描光幕 ---
    const scanGeo = new THREE.BoxGeometry(1, 20, 20);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    group.add(scanner);
    animatables.scanningPlane = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 船舶浮动
      group.position.y = Math.sin(time * 0.5) * 0.5;
      group.rotation.z = Math.sin(time * 0.3) * 0.01; // Pitch
      group.rotation.x = Math.cos(time * 0.2) * 0.01; // Roll

      // 扫描移动
      if (animatables.scanningPlane) {
          animatables.scanningPlane.position.x = Math.sin(time * 0.5) * 20;
      }

      // 节点动态 - 实时读取systemHealthRef.current的值更新状态
      animatables.nodes?.forEach((node, id) => {
          const ring = node.children[1];
          ring.lookAt(camera.position);
          
          // 从ref获取实时健康值
          const sysKey = id.split('-')[0];
          const healthValue = systemHealthRef.current[sysKey] ?? 100;
          const sysStatus = healthValue < 80 ? 'warning' : 'optimal';
          
          // 实时更新节点颜色
          const color = sysStatus === 'optimal' ? 0x10b981 : 0xf59e0b;
          const coreMat = nodeMaterialMap.get(id);
          const ringMat = ringMaterialMap.get(id);
          if (coreMat) {
              coreMat.color.setHex(color);
              coreMat.emissive.setHex(color);
          }
          if (ringMat) {
              ringMat.color.setHex(color);
          }

          // 警告节点脉动更快
          const speed = sysStatus === 'warning' ? 10 : 3;
          
          const scale = 1 + Math.sin(time * speed) * 0.1;
          node.children[0].scale.setScalar(scale);
          ring.scale.setScalar(scale * 1.2);
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.4 - Math.sin(time * speed) * 0.2;
      });

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
  }, []); // 2026.03.18 - Bug修复：剔除systemHealth依赖项，避免频繁触发渲染

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
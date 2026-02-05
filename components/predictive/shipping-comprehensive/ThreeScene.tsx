
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

  useEffect(() => {
    if (!mountRef.current) return;

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
    const systems: ShipSystemNode[] = [
        { id: 'main-engine', name: '主机 (ME)', position: [-5, 5, 0], status: systemHealth['main'] < 80 ? 'warning' : 'optimal' },
        { id: 'aux-engine', name: '辅机 (AE)', position: [-5, 8, 3], status: systemHealth['aux'] < 80 ? 'warning' : 'optimal' },
        { id: 'propulsion', name: '轴系 (Shaft)', position: [10, 2, 0], status: systemHealth['shaft'] < 80 ? 'warning' : 'optimal' },
        { id: 'deck', name: '甲板机械', position: [15, 11, 0], status: 'optimal' },
        { id: 'bridge', name: '舰桥通导', position: [-15, 20, 0], status: 'optimal' },
        { id: 'cargo', name: '货舱监控', position: [5, 8, 0], status: 'optimal' },
    ];

    const nodeGeo = new THREE.IcosahedronGeometry(0.8, 1);
    
    systems.forEach(sys => {
        const color = sys.status === 'optimal' ? 0x10b981 : sys.status === 'warning' ? 0xf59e0b : 0xef4444;
        
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
        const line = new THREE.Mesh(lineGeo as any, lineMat); // Use Mesh for simplicity or Line
        // Actually Line is better
        const lineObj = new THREE.Line(lineGeo, lineMat);
        nodeGroup.add(lineObj);

        group.add(nodeGroup);
        animatables.nodes?.set(sys.id, nodeGroup);
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

      // 节点动态
      animatables.nodes?.forEach((node, id) => {
          const ring = node.children[1];
          ring.lookAt(camera.position);
          
          // 警告节点脉动更快
          const sysStatus = systems.find(s => s.id === id)?.status;
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
  }, [systemHealth]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

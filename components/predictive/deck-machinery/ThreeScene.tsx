
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DeckFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  healthScore?: number;
  activeFailureMode?: string;
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 85, 
  activeFailureMode,
  isScanning = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===deck-machinery useEffect===");

    const scene = new THREE.Scene();
    scene.background = null; 
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(38, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 8, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
    controls.maxDistance = 30;
    controls.minDistance = 5;

    // --- 高动态全息照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 15, 50);
    blueLight.position.set(-10, 5, 5);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: DeckFailureAnimatables = { failureNodes: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 数字化机架 (Frame) ---
    const frameGeo = new THREE.BoxGeometry(10, 1.5, 6);
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.8, 
        roughness: 0.4,
        transparent: true,
        opacity: 0.6
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -2;
    group.add(frame);

    // --- 2. 主卷筒组件 (Main Drum) ---
    const drumGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 64);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: healthScore < 70 ? 0xff0000 : 0x000000,
        emissiveIntensity: (100 - healthScore) / 100
    });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    group.add(drum);
    animatables.mainDrum = new THREE.Group();
    animatables.mainDrum.add(drum);
    group.add(animatables.mainDrum);

    // --- 3. 故障热点点位 (Failure Nodes) ---
    const nodes = [
        { id: 'f-01', pos: [-3.5, 0, 0], color: 0xef4444, name: '减速机齿面' },
        { id: 'f-02', pos: [3.5, 0, 0], color: 0xf59e0b, name: '制动器' },
        { id: 'f-03', pos: [0, 2.8, 1.5], color: 0x10b981, name: '排绳器' },
        { id: 'f-04', pos: [-4.5, -1, 2], color: 0x0ea5e9, name: '主电机' }
    ];

    const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
    nodes.forEach(n => {
        const mat = new THREE.MeshStandardMaterial({ 
            color: n.color, 
            emissive: n.color, 
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(sphereGeo, mat);
        node.position.set(n.pos[0], n.pos[1], n.pos[2]);
        
        // 外部扫描环
        const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        node.add(ring);

        animatables.failureNodes?.add(node);
        disposables.push(sphereGeo, mat, ringGeo, ringMat);
    });
    group.add(animatables.failureNodes!);

    // --- 4. 扫描激光面 (Scanning Plane) ---
    const scanGeo = new THREE.PlaneGeometry(12, 8);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x22d3ee, 
        transparent: true, 
        opacity: 0.05, 
        side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    group.add(scanPlane);
    animatables.scanningFringe = scanPlane;

    // --- 5. 背景网格 ---
    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -3;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟
      if (animatables.mainDrum) {
          animatables.mainDrum.rotation.x += 0.01;
      }

      // 扫描移动
      if (isScanning && animatables.scanningFringe) {
          animatables.scanningFringe.position.y = Math.sin(time * 1.5) * 4;
      }

      // 节点动态脉动
      animatables.failureNodes?.children.forEach((node, i) => {
          const pulse = 1 + Math.sin(time * 4 + i) * 0.15;
          node.scale.setScalar(pulse);
          node.children[0].rotation.z += 0.02;
      });

      group.rotation.y += 0.001;
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
      grid.dispose();
      renderer.dispose();
    };
  }, [healthScore, activeFailureMode, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

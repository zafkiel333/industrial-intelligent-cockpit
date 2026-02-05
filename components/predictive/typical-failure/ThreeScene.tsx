import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TypicalFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  activeFailureId?: string;
  intensity?: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  activeFailureId,
  intensity = 0.5
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    // --- 全息实验室光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const topLight = new THREE.DirectionalLight(0xffffff, 2);
    topLight.position.set(5, 20, 10);
    scene.add(topLight);

    const cyanPoint = new THREE.PointLight(0x22d3ee, 20, 50);
    cyanPoint.position.set(-10, 5, 5);
    scene.add(cyanPoint);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: TypicalFailureAnimatables = { failureNodes: new Map() };
    const disposables: any[] = [];

    // --- 1. 数字化透明机体 (Hologram Shell) ---
    const shellGeo = new THREE.BoxGeometry(12, 6, 4);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    mainGroup.add(shell);
    disposables.push(shellGeo, shellMat);

    // --- 2. 关键系统节点与点位 (Risk Nodes) ---
    const failurePoints = [
        { id: 'f-01', name: '喷油器', pos: [2, 3.5, 0], color: 0xef4444 },
        { id: 'f-02', name: '增压器', pos: [6, 4, 1.5], color: 0xf59e0b },
        { id: 'f-03', name: '活塞环', pos: [-2, 2, 0], color: 0x0ea5e9 },
        { id: 'f-04', name: '主轴承', pos: [0, -2, 0], color: 0x8b5cf6 },
        { id: 'f-05', name: '扫气口', pos: [-4, 0, -1.5], color: 0x10b981 }
    ];

    failurePoints.forEach(point => {
        const pGroup = new THREE.Group();
        pGroup.position.set(point.pos[0], point.pos[1], point.pos[2]);
        
        const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ 
            color: point.color, 
            emissive: point.color, 
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        pGroup.add(sphere);

        // 装饰性数据环
        const ringGeo = new THREE.TorusGeometry(0.7, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: point.color, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        pGroup.add(ring);

        mainGroup.add(pGroup);
        animatables.failureNodes?.set(point.id, pGroup);
        disposables.push(sphereGeo, sphereMat, ringGeo, ringMat);
    });

    // --- 3. 动态数据流通道 (Data Pipes) ---
    const pipePoints = [];
    pipePoints.push(new THREE.Vector3(-4, 0, -1.5));
    pipePoints.push(new THREE.Vector3(-2, 2, 0));
    pipePoints.push(new THREE.Vector3(2, 3.5, 0));
    pipePoints.push(new THREE.Vector3(6, 4, 1.5));
    const pipeGeo = new THREE.BufferGeometry().setFromPoints(pipePoints);
    const pipeMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2 });
    const pipes = new THREE.Line(pipeGeo, pipeMat);
    mainGroup.add(pipes);
    disposables.push(pipeGeo, pipeMat);

    // --- 4. 扫描面与底座 ---
    const scanGeo = new THREE.PlaneGeometry(16, 8);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    mainGroup.add(scanner);
    animatables.scanningLight = scanner;
    disposables.push(scanGeo, scanMat);

    const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体浮动
      mainGroup.position.y = Math.sin(time * 0.5) * 0.3;
      mainGroup.rotation.y += 0.002;

      // 节点动态反馈
      animatables.failureNodes?.forEach((node, id) => {
          const isSelected = id === activeFailureId;
          const pulse = 1 + Math.sin(time * (isSelected ? 10 : 3)) * 0.15;
          node.scale.setScalar(pulse);
          node.children[1].rotation.z += 0.05;
          if (isSelected) {
              node.children[0].scale.setScalar(1.2);
          } else {
              node.children[0].scale.setScalar(1.0);
          }
      });

      // 扫描仪上下移动
      if (animatables.scanningLight) {
          animatables.scanningLight.position.y = Math.sin(time * 1.5) * 5;
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
      grid.dispose();
      renderer.dispose();
    };
  }, [activeFailureId]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
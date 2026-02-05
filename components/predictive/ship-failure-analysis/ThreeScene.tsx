import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FailureAnalysisAnimatables } from './three-types';

interface ThreeSceneProps {
  failureSeverity?: number; // 0-1
  activeFailureMode?: string;
  isSimulating?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  failureSeverity = 0.2, 
  activeFailureMode,
  isSimulating = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

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

    // --- 高级全息照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const mainLight = new THREE.PointLight(0x8b5cf6, 20, 50);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FailureAnalysisAnimatables = { 
        nodeGroup: new THREE.Group(),
        flowLines: new THREE.Group()
    };
    const disposables: any[] = [];

    // --- 1. 创建电网拓扑节点 (Abstract Grid Nodes) ---
    const nodes = [
        { id: 'gen1', pos: [-6, 2, 0], color: 0x22d3ee, label: 'G1' },
        { id: 'gen2', pos: [-6, -2, 0], color: 0x22d3ee, label: 'G2' },
        { id: 'msb', pos: [0, 0, 0], color: 0x8b5cf6, label: 'MSB' },
        { id: 'prop', pos: [6, 0, 0], color: 0x0ea5e9, label: 'PROP' },
        { id: 'aux', pos: [4, 4, -2], color: 0x10b981, label: 'AUX' },
        { id: 'esb', pos: [0, 5, 2], color: 0xf43f5e, label: 'ESB' }
    ];

    const nodeGeo = new THREE.IcosahedronGeometry(0.6, 2);
    nodes.forEach(n => {
        const mat = new THREE.MeshStandardMaterial({ 
            color: n.color, 
            emissive: n.color, 
            emissiveIntensity: 0.5,
            wireframe: true 
        });
        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
        mesh.name = n.id;
        
        // 外部光环
        const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);

        animatables.nodeGroup?.add(mesh);
        disposables.push(nodeGeo, mat, ringGeo, ringMat);
    });
    group.add(animatables.nodeGroup!);

    // --- 2. 能量传输路径 (Power Flow Paths) ---
    const connections = [
        ['gen1', 'msb'], ['gen2', 'msb'], ['msb', 'prop'], ['msb', 'aux'], ['msb', 'esb']
    ];

    const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.2 });
    connections.forEach(([fromId, toId]) => {
        const from = nodes.find(n => n.id === fromId)!.pos;
        const to = nodes.find(n => n.id === toId)!.pos;
        const curve = new THREE.LineCurve3(new THREE.Vector3(...from), new THREE.Vector3(...to));
        const points = curve.getPoints(10);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMat);
        animatables.flowLines?.add(line);
        disposables.push(geometry);
    });
    group.add(animatables.flowLines!);

    // --- 3. 故障溢出粒子 (Failure Leakage) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 20;
        pPos[i*3+1] = (Math.random() - 0.5) * 20;
        pPos[i*3+2] = (Math.random() - 0.5) * 20;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf43f5e, size: 0.05, transparent: true, opacity: 0 });
    const glitchParticles = new THREE.Points(pGeo, pMat);
    scene.add(glitchParticles);
    animatables.dataPoints = glitchParticles;
    disposables.push(pGeo, pMat);

    // --- 4. 扫描环 (Scanner Ring) ---
    const scannerGeo = new THREE.TorusGeometry(12, 0.05, 16, 100);
    const scannerMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.1 });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.rotation.x = Math.PI / 2;
    scene.add(scanner);
    animatables.hologramScanner = scanner;
    disposables.push(scannerGeo, scannerMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体缓慢自转
      group.rotation.y += 0.0015;
      group.position.y = Math.sin(time * 0.5) * 0.2;

      // 节点动态脉动
      animatables.nodeGroup?.children.forEach((node, i) => {
          const mesh = node as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const scale = 1 + Math.sin(time * 3 + i) * 0.05;
          mesh.scale.setScalar(scale);

          // 如果该区域属于失效焦点，变红并剧烈跳动
          if (activeFailureMode && i === 2) { // 假设MSB是焦点
              mat.emissive.setHex(0xef4444);
              mat.emissiveIntensity = 1 + Math.sin(time * 20) * 0.5;
              mesh.scale.setScalar(scale * (1 + failureSeverity * 0.5));
          } else {
              mat.emissiveIntensity = 0.5;
              mat.emissive.setHex(nodes[i].color);
          }
      });

      // 故障粒子流
      if (animatables.dataPoints) {
          const mat = animatables.dataPoints.material as THREE.PointsMaterial;
          mat.opacity = failureSeverity > 0.5 ? (0.2 + Math.sin(time * 10) * 0.1) : 0;
          animatables.dataPoints.rotation.y -= 0.005;
      }

      // 扫描环
      if (animatables.hologramScanner) {
          animatables.hologramScanner.position.y = Math.sin(time * 1.2) * 8;
          animatables.hologramScanner.scale.setScalar(1 + Math.sin(time * 1.2) * 0.1);
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
  }, [failureSeverity, activeFailureMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
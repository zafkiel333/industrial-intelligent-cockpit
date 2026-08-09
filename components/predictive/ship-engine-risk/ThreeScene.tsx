
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineRiskAnimatables, RiskViewMode } from './three-types';

interface ThreeSceneProps {
  globalRiskLevel?: number; // 0-1
  viewMode?: RiskViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  globalRiskLevel = 0.3,
  viewMode = 'probability'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ship-engine-risk useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 18);

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

    // --- 全息科技光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 15, 5);
    scene.add(topLight);

    const purplePoint = new THREE.PointLight(0x8b5cf6, 10, 40);
    purplePoint.position.set(-10, 5, 5);
    scene.add(purplePoint);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: EngineRiskAnimatables = { riskNodes: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 抽象主机骨架 (Engine Abstract Skeleton) ---
    const skeletonGeo = new THREE.BoxGeometry(10, 4, 3);
    const skeletonMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.2 
    });
    const skeleton = new THREE.Mesh(skeletonGeo, skeletonMat);
    mainGroup.add(skeleton);
    disposables.push(skeletonGeo, skeletonMat);

    // --- 2. 风险探测节点 (Risk Nodes) ---
    const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const nodePositions = [
        { pos: [-4, 2, 0], label: '增压器', risk: 0.1 },
        { pos: [0, 2, 0], label: '高压油泵', risk: 0.8 }, // 高风险
        { pos: [3, 1, 1.2], label: '十字头轴承', risk: 0.4 },
        { pos: [-2, -1, -1.2], label: '润滑油出口', risk: 0.2 },
        { pos: [4, -1.5, 0], label: '止推轴承', risk: 0.6 }
    ];

    nodePositions.forEach(item => {
        const color = item.risk > 0.7 ? 0xef4444 : item.risk > 0.4 ? 0xf59e0b : 0x10b981;
        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 1 
        });
        const node = new THREE.Mesh(nodeGeo, mat);
        node.position.set(item.pos[0], item.pos[1], item.pos[2]);
        
        // 外部扫描环
        const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        node.add(ring);
        
        animatables.riskNodes?.add(node);
        disposables.push(nodeGeo, mat, ringGeo, ringMat);
    });
    mainGroup.add(animatables.riskNodes!);

    // --- 3. 故障传播路径 (Propagation Lines) ---
    const lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.3 });
    const points = [];
    points.push(new THREE.Vector3(-4, 2, 0));
    points.push(new THREE.Vector3(0, 2, 0));
    points.push(new THREE.Vector3(3, 1, 1.2));
    points.push(new THREE.Vector3(4, -1.5, 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, lineMat);
    mainGroup.add(line);
    disposables.push(lineGeo, lineMat);

    // --- 4. 动态扫描切面 (Scanning Plane) ---
    const scanGeo = new THREE.PlaneGeometry(12, 6);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.1, 
        side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    mainGroup.add(scanPlane);
    animatables.scanPlane = scanPlane;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 主体缓慢漂浮
      mainGroup.position.y = Math.sin(time * 0.5) * 0.2;
      mainGroup.rotation.y += 0.002;

      // 风险节点跳动
      if (animatables.riskNodes) {
          animatables.riskNodes.children.forEach((node, i) => {
              const pulse = 1 + Math.sin(time * 5 + i) * 0.1;
              node.scale.setScalar(pulse);
              node.children[0].rotation.z += 0.02;
              node.children[0].scale.setScalar(1 + Math.sin(time * 8) * 0.5);
          });
      }

      // 扫描面移动
      if (animatables.scanPlane) {
          animatables.scanPlane.position.x = Math.sin(time) * 6;
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
  }, [globalRiskLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

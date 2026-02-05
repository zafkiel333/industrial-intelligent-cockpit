
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FaultProbAnimatables, ProbViewMode } from './three-types';

interface ThreeSceneProps {
  overallRisk?: number; // 0-1
  viewMode?: ProbViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  overallRisk = 0.18,
  viewMode = 'bayesian'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // 增加环境遮蔽感
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 精密工业级光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 15, 10);
    scene.add(topLight);

    const purpleGlow = new THREE.PointLight(0x8b5cf6, 10, 50);
    purpleGlow.position.set(-8, 5, 5);
    scene.add(purpleGlow);

    const orangeWarning = new THREE.PointLight(0xf97316, 15 * overallRisk, 30);
    orangeWarning.position.set(0, 2, 0);
    scene.add(orangeWarning);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: FaultProbAnimatables = { riskNodes: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 透明主机骨架 (Engine Hologram) ---
    const skeletonGeo = new THREE.BoxGeometry(8, 4, 3);
    const skeletonMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.2 
    });
    const skeleton = new THREE.Mesh(skeletonGeo, skeletonMat);
    mainGroup.add(skeleton);
    disposables.push(skeletonGeo, skeletonMat);

    // --- 2. 风险决策节点 (Probabilistic Nodes) ---
    const nodesData = [
        { id: 'fuel', pos: [-3, 1.5, 0], risk: 0.72, label: '燃油喷射' },
        { id: 'bearing', pos: [0, -1.5, 0], risk: 0.24, label: '主轴承' },
        { id: 'turbo', pos: [3.5, 1.2, 1], risk: 0.45, label: '增压器' },
        { id: 'cooling', pos: [-2, -1, -1.2], risk: 0.15, label: '冷却循环' },
        { id: 'liner', pos: [0, 1, 0], risk: 0.35, label: '气缸套' }
    ];

    nodesData.forEach(item => {
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(item.pos[0], item.pos[1], item.pos[2]);
        
        // 核心风险球
        const color = item.risk > 0.6 ? 0xef4444 : item.risk > 0.3 ? 0xf59e0b : 0x22d3ee;
        const sphereGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        nodeGroup.add(sphere);

        // 外部扫描环
        const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 16, 100);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        nodeGroup.add(ring);
        
        animatables.riskNodes?.add(nodeGroup);
        disposables.push(sphereGeo, sphereMat, ringGeo, ringMat);
    });
    mainGroup.add(animatables.riskNodes!);

    // --- 3. 环境地毯网格 ---
    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -3.5;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体浮动动画
      mainGroup.position.y = Math.sin(time * 0.5) * 0.2;
      mainGroup.rotation.y += 0.001;

      // 风险节点脉动
      if (animatables.riskNodes) {
          animatables.riskNodes.children.forEach((node, i) => {
              const pulse = 1 + Math.sin(time * 3 + i) * 0.1;
              node.scale.setScalar(pulse);
              node.children[1].rotation.z += 0.02; // 扫描环旋转
              node.children[1].scale.setScalar(1 + Math.sin(time * 5) * 0.2);
          });
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
  }, [overallRisk, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

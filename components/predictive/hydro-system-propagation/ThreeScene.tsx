import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropagationSceneProps } from './three-types';

export const PropagationThreeScene: React.FC<PropagationSceneProps> = ({
  nodes,
  activePropagationPath,
  flowIntensity,
  isEmergency,
  propagationSpeed
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const nodeMeshesRef = useRef<THREE.Group[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeGroupRef = useRef<THREE.Group | null>(null);
  const pMetaRef = useRef<Array<{ pathIdx: number; progress: number; speed: number }>>([]);
  const pCount = 2000;

  // 2026.03.03 - Bug修复：使用ref存储实时更新的props值，避免因props频繁变化导致useEffect反复触发
  // Bug情况：原代码中useEffect依赖项包含nodes、activePropagationPath等易变变量，导致每次变量变化都会重建整个3D场景，引发模型闪烁
  // Bug原因：useEffect依赖项中的props变量频繁更新，触发useEffect重新执行，重复创建场景、相机、渲染器等核心对象，造成视觉闪烁
  // 解决方案：将需要实时读取的props值存入ref，主渲染逻辑的useEffect仅初始化一次，动画循环中通过ref读取最新值
  const nodesRef = useRef<PropagationSceneProps['nodes']>(nodes);
  const activePropagationPathRef = useRef<PropagationSceneProps['activePropagationPath']>(activePropagationPath);
  const flowIntensityRef = useRef<PropagationSceneProps['flowIntensity']>(flowIntensity);
  const isEmergencyRef = useRef<PropagationSceneProps['isEmergency']>(isEmergency);
  const propagationSpeedRef = useRef<PropagationSceneProps['propagationSpeed']>(propagationSpeed);

  // 同步props值到ref，确保动画循环中能获取最新值
  useEffect(() => {
    nodesRef.current = nodes;
    activePropagationPathRef.current = activePropagationPath;
    flowIntensityRef.current = flowIntensity;
    isEmergencyRef.current = isEmergency;
    propagationSpeedRef.current = propagationSpeed;
  }, [nodes, activePropagationPath, flowIntensity, isEmergency, propagationSpeed]);

  // 核心渲染逻辑：仅初始化一次，避免反复重建场景导致闪烁
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-system-propagation useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);
    sceneRef.current = scene;

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    
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

    // 灯光环境
    const ambientLight = new THREE.AmbientLight(0x1a2e4c, 2.5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0x3b82f6, 2, 100);
    topLight.position.set(0, 50, 0);
    scene.add(topLight);

    // 初始化节点组
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    nodeGroupRef.current = nodeGroup;

    // 初始化粒子系统
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pMeta = [];
    for(let i=0; i<pCount; i++) {
      pMeta.push({
        pathIdx: Math.floor(Math.random() * (nodesRef.current.length - 1)),
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.005
      });
    }
    pMetaRef.current = pMeta;

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 更新节点模型的方法（处理nodes变化）
    const updateNodeMeshes = () => {
      const currentNodes = nodesRef.current;
      const currentNodeGroup = nodeGroupRef.current;
      if (!currentNodeGroup) return;

      // 清空原有节点
      currentNodeGroup.clear();
      nodeMeshesRef.current = [];

      // 创建新节点
      currentNodes.forEach(node => {
        const group = new THREE.Group();
        group.position.set(...node.pos);
        group.userData = { id: node.id };

        // 核心几何体
        const geo = node.type === 'machine' ? new THREE.IcosahedronGeometry(2, 1) : new THREE.BoxGeometry(3, 3, 3);
        const mat = new THREE.MeshStandardMaterial({ 
          color: 0x1e293b, 
          emissive: 0x0ea5e9, 
          emissiveIntensity: 0.2,
          metalness: 0.9,
          roughness: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        // 外层全息框
        const wireGeo = new THREE.EdgesGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        group.add(wire);

        currentNodeGroup.add(group);
        nodeMeshesRef.current.push(group);
      });
    };

    // 首次初始化节点
    updateNodeMeshes();

    // 动画循环
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      
      // 更新控制器
      controlsRef.current?.update();

      const currentNodes = nodesRef.current;
      const currentFlowIntensity = flowIntensityRef.current;
      const currentIsEmergency = isEmergencyRef.current;
      const currentActivePath = activePropagationPathRef.current;

      // 更新粒子位置 (沿路径流动)
      if (particlesRef.current && currentNodes.length > 1) {
        const particles = particlesRef.current;
        const pos = particles.geometry.attributes.position.array as Float32Array;
        const mat = particles.material as THREE.PointsMaterial;
        const pMeta = pMetaRef.current;
        
        for(let i=0; i<pCount; i++) {
          const meta = pMeta[i];
          // 使用最新的flowIntensity计算速度
          meta.progress += meta.speed * currentFlowIntensity;
          if(meta.progress > 1) meta.progress = 0;

          // 确保pathIdx不越界
          const pathIdx = Math.min(meta.pathIdx, currentNodes.length - 2);
          const start = new THREE.Vector3(...currentNodes[pathIdx].pos);
          const end = new THREE.Vector3(...currentNodes[pathIdx + 1].pos);
          const currentPos = new THREE.Vector3().lerpVectors(start, end, meta.progress);
          
          // 添加随机抖动
          pos[i*3] = currentPos.x + (Math.random()-0.5);
          pos[i*3+1] = currentPos.y + (Math.random()-0.5);
          pos[i*3+2] = currentPos.z + (Math.random()-0.5);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // 紧急状态粒子变红
        mat.color.lerp(new THREE.Color(currentIsEmergency ? 0xef4444 : 0x0ea5e9), 0.05);
      }

      // 更新节点视觉反馈
      nodeMeshesRef.current.forEach(group => {
        const id = group.userData.id;
        const node = currentNodes.find(n => n.id === id);
        if (!node) return;
        
        const mesh = group.children[0] as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        
        const isAtRisk = currentActivePath.includes(id);
        const targetColor = new THREE.Color(isAtRisk ? 0xef4444 : 0x0ea5e9);
        
        mat.emissive.lerp(targetColor, 0.1);
        mat.emissiveIntensity = isAtRisk ? (0.5 + Math.sin(time * 10) * 0.5) : 0.2;
        
        if(isAtRisk) {
          group.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
        } else {
          group.scale.setScalar(1);
        }
      });

      // 渲染场景
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // 监听nodes变化（通过ref对比）
    const checkNodesChange = () => {
      const oldNodes = nodeMeshesRef.current.map(g => g.userData.id);
      const newNodes = nodesRef.current.map(n => n.id);
      if (JSON.stringify(oldNodes) !== JSON.stringify(newNodes)) {
        updateNodeMeshes();
        // 更新粒子路径索引
        pMetaRef.current.forEach(meta => {
          meta.pathIdx = Math.floor(Math.random() * (nodesRef.current.length - 1));
        });
      }
    };

    // 启动动画
    animate();
    // 启动节点变化检测（每帧检测）
    const checkNodesFrameId = requestAnimationFrame(function checkNodes() {
      checkNodesChange();
      requestAnimationFrame(checkNodes);
    });

    // 窗口大小调整处理
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(checkNodesFrameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      // 释放Three.js资源
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
    };
  }, []); // 仅依赖mountRef，空数组确保只执行一次

  return <div ref={mountRef} className="w-full h-full" />;
};
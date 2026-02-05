
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CompareAnimatables, ScreenNode } from './three-types';

interface ThreeSceneProps {
  deviceStates: Array<{ id: string; health: number; status: 'normal' | 'warning' | 'critical' }>;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ deviceStates }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

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
    controls.maxPolarAngle = Math.PI / 2.1;

    // --- 工业光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    
    // 顶部冷白光
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 20, 5);
    scene.add(topLight);

    // 环绕科技感蓝紫光
    const p1 = new THREE.PointLight(0x0ea5e9, 10, 50);
    p1.position.set(-10, 5, 10);
    scene.add(p1);
    
    const p2 = new THREE.PointLight(0x8b5cf6, 8, 50);
    p2.position.set(10, 2, -10);
    scene.add(p2);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: CompareAnimatables = { nodes: [] };
    const disposables: any[] = [];

    // --- 创建设备节点集群 ---
    const createScreenModel = (status: string, health: number) => {
        const nodeGroup = new THREE.Group();
        
        // 1. 筛箱主体
        const boxGeo = new THREE.BoxGeometry(2, 0.8, 4);
        const color = status === 'normal' ? 0x0ea5e9 : status === 'warning' ? 0xf59e0b : 0xef4444;
        const boxMat = new THREE.MeshStandardMaterial({ 
            color: 0x334155, 
            metalness: 0.8, 
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: (100 - health) / 100
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        nodeGroup.add(box);
        disposables.push(boxGeo, boxMat);

        // 2. 状态底座光环
        const ringGeo = new THREE.TorusGeometry(2.5, 0.03, 16, 100);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.6 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -0.5;
        nodeGroup.add(ring);
        disposables.push(ringGeo, ringMat);

        return { group: nodeGroup, box, ring };
    };

    // 布局节点
    deviceStates.forEach((state, index) => {
        const { group: nodeGroup, box, ring } = createScreenModel(state.status, state.health);
        const row = Math.floor(index / 2);
        const col = index % 2;
        nodeGroup.position.set(col * 8 - 4, 0, row * 8 - 4);
        mainGroup.add(nodeGroup);
        
        animatables.nodes.push({
            id: state.id,
            group: nodeGroup,
            mesh: box,
            lightRing: ring,
            status: state.status,
            health: state.health
        });
    });

    // 3. 扫描地毯 (Scanner Floor)
    const floorGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({ 
        color: 0x1e293b, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.6;
    scene.add(floor);
    disposables.push(floorGeo, floorMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      animatables.nodes.forEach(node => {
          // 振动模拟：健康度越低，振动越紊乱
          const vibFactor = (100 - node.health) / 200;
          node.group.position.y = Math.sin(time * 25) * 0.05 + Math.random() * vibFactor * 0.1;
          
          // 光环呼吸
          node.lightRing.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
          (node.lightRing.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 3) * 0.3;
      });

      if (controls) controls.update();
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [deviceStates]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

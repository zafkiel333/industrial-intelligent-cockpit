
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CoordinationThreeProps } from './three-types';

export const CoordinationThreeScene: React.FC<CoordinationThreeProps> = ({ 
  nodes, 
  flows, 
  activePhase 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 使用深蓝色调背景增强对比
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 核心修复：启用色调映射并大幅提升曝光
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8; 
    
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 增强光照系统 ---
    // 1. 强力环境光（全局提亮）
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // 2. 半球光（模拟上下反光，增加立体感）
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    // 3. 主方向光（提供阴影和轮廓）
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 4. 辅助点光源（蓝色科技感）
    const point = new THREE.PointLight(0x0ea5e9, 20, 100);
    point.position.set(-10, 15, -5);
    scene.add(point);

    // --- 场景内容构建 ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const nodeMeshes: THREE.Group[] = [];
    const nodePosMap = new Map<string, THREE.Vector3>();

    nodes.forEach(node => {
      const group = new THREE.Group();
      const pos = new THREE.Vector3(...node.position);
      nodePosMap.set(node.id, pos);
      group.position.copy(pos);

      let geo;
      if (node.type === 'warehouse') geo = new THREE.BoxGeometry(1.5, 1, 1.5);
      else if (node.type === 'turbine') geo = new THREE.CylinderGeometry(1.2, 1.5, 2, 32);
      else geo = new THREE.SphereGeometry(0.5);

      const color = node.status === 'critical' ? 0xef4444 : (node.status === 'loading' ? 0xf59e0b : 0x10b981);
      
      // 使用 MeshStandardMaterial 更好地响应光照
      const mat = new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.7,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.4 // 提高基础亮度
      });

      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      // 动态扫描环
      const ringGeo = new THREE.TorusGeometry(2, 0.04, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      scene.add(group);
      nodeMeshes.push(group);
    });

    // --- 供应流 ---
    const particles: { mesh: THREE.Mesh, path: THREE.CatmullRomCurve3, t: number }[] = [];
    flows.forEach(flow => {
      const start = nodePosMap.get(flow.fromId);
      const end = nodePosMap.get(flow.toId);
      if (start && end) {
        const curve = new THREE.CatmullRomCurve3([
          start,
          new THREE.Vector3((start.x + end.x)/2, 6, (start.z + end.z)/2),
          end
        ]);
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
        const lineMat = new THREE.LineBasicMaterial({ color: flow.color, transparent: true, opacity: 0.4 });
        scene.add(new THREE.Line(lineGeo, lineMat));

        for(let i=0; i<4; i++) {
          const pGeo = new THREE.SphereGeometry(0.15, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // 粒子设为白色高亮
          const pMesh = new THREE.Mesh(pGeo, pMat);
          scene.add(pMesh);
          particles.push({ mesh: pMesh, path: curve, t: Math.random() });
        }
      }
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      particles.forEach(p => {
        p.t += 0.004;
        if (p.t > 1) p.t = 0;
        const pos = p.path.getPointAt(p.t);
        p.mesh.position.copy(pos);
      });

      nodeMeshes.forEach((n, i) => {
        n.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.08);
        if (n.children[1]) {
           n.children[1].rotation.z += 0.02;
           (n.children[1] as any).material.opacity = 0.3 + Math.sin(time * 5) * 0.2;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [nodes, flows, activePhase]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

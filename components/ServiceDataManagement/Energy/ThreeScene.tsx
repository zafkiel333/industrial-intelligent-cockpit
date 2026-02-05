
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EnergyFluxProps, EnergyNode } from './three-types';

export const EnergyThreeScene: React.FC<EnergyFluxProps> = ({ activeNodeId, onNodeSelect, systemIntensity }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: EnergyNode[] = [
    { id: 'en-1', name: '采掘服务域', loadLevel: 0.85, type: 'consumption', position: [-10, 2, 5], serviceYield: '4.2t/kWh' },
    { id: 'en-2', name: '提升运输域', loadLevel: 0.62, type: 'consumption', position: [8, 5, -2], serviceYield: '12m/kWh' },
    { id: 'en-3', name: '通风排水域', loadLevel: 0.45, type: 'consumption', position: [-2, -6, 8], serviceYield: '85m³/kWh' },
    { id: 'en-4', name: '洗选加工域', loadLevel: 0.78, type: 'consumption', position: [5, -4, -10], serviceYield: '0.8t/kWh' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 氛围背景：能量星云（低密度点云）
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 60;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x4c1d95, size: 0.1, transparent: true, opacity: 0.4 });
    const nebula = new THREE.Points(pGeo, pMat);
    scene.add(nebula);

    // 中央能源治理核心 (Governance Hub)
    const hubGroup = new THREE.Group();
    scene.add(hubGroup);

    const hubGeo = new THREE.SphereGeometry(3, 32, 32);
    const hubMat = new THREE.MeshPhongMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      emissive: 0xa855f7,
      emissiveIntensity: 0.5
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hubGroup.add(hub);

    const innerHub = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 })
    );
    hubGroup.add(innerHub);

    // 绘制负荷节点
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
      const group = new THREE.Group();
      group.position.set(...node.position);

      const color = node.loadLevel > 0.8 ? 0xf59e0b : 0x22d3ee;
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat = new THREE.MeshPhongMaterial({
        color: node.id === activeNodeId ? 0xffffff : color,
        emissive: color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // 数据雷达扫描环
      const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI/2;
      group.add(ring);

      scene.add(group);

      // 能量脉冲路径 (核心 -> 节点)
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(node.position[0]/2, 10, node.position[2]/2),
        new THREE.Vector3(...node.position)
      );
      const pathPoints = curve.getPoints(50);
      const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const pathMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.1 });
      const path = new THREE.Line(pathGeo, pathMat);
      scene.add(path);

      // 能量脉冲粒子
      const pulseGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.userData = { curve, progress: Math.random() };
      scene.add(pulse);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      hubGroup.rotation.y += 0.005;
      innerHub.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
      nebula.rotation.z += 0.0005;

      // 粒子沿路径流动
      scene.children.forEach(child => {
        if (child.userData && child.userData.curve) {
          child.userData.progress += 0.005 * systemIntensity;
          if (child.userData.progress > 1) child.userData.progress = 0;
          const pos = child.userData.curve.getPoint(child.userData.progress);
          child.position.copy(pos);
        }
      });

      nodeMeshes.forEach((m, i) => {
        m.rotation.y += 0.02;
        m.position.y = Math.sin(time + i) * 0.2;
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
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeNodeId, onNodeSelect, systemIntensity]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};

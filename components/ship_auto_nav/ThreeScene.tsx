
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NavThreeProps } from './three-types';

export const NavThreeScene: React.FC<NavThreeProps> = ({ 
  nodes, 
  activeNodeId, 
  onNodeSelect,
  isRadarScanning 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

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
    controls.maxPolarAngle = Math.PI / 2.1;

    // --- 核心底座：船桥指挥台甲板 ---
    const deckGeo = new THREE.CylinderGeometry(10, 10.5, 0.5, 32);
    const deckMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.1
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = -2;
    scene.add(deck);

    // 战术网格
    const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    grid.position.y = -1.74;
    scene.add(grid);

    // --- 雷达扫描面 ---
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);
    
    const scanGeo = new THREE.PlaneGeometry(20, 20);
    const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    radarGroup.add(scanPlane);

    // 扫描线
    const lineGeo = new THREE.BoxGeometry(20, 0.05, 0.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });
    const scanLine = new THREE.Mesh(lineGeo, lineMat);
    radarGroup.add(scanLine);

    // --- 设备节点 ---
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
      const color = node.status === 'online' ? 0x10b981 : (node.status === 'warning' ? 0xf59e0b : 0xef4444);
      let geo;
      if (node.type === 'radar') geo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
      else if (node.type === 'gps') geo = new THREE.OctahedronGeometry(0.5);
      else geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);

      const mat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: activeNodeId === node.id ? 1.5 : 0.3,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      scene.add(mesh);
      nodeMeshes.push(mesh);

      // 投影线
      const linePts = [new THREE.Vector3(node.position[0], -1.74, node.position[2]), new THREE.Vector3(...node.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });
      scene.add(new THREE.Line(lineGeo, lineMat));
    });

    // --- 卫星轨道 (装饰) ---
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    for(let i=0; i<3; i++) {
        const ringGeo = new THREE.TorusGeometry(12 + i*2, 0.01, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.1 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI/2 + (Math.random()-0.5)*0.5;
        ring.rotation.y = (Math.random()-0.5)*0.5;
        orbitGroup.add(ring);
    }

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const spot = new THREE.SpotLight(0x0ea5e9, 10);
    spot.position.set(10, 20, 10);
    scene.add(spot);

    // 交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) onNodeSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (isRadarScanning) {
        radarGroup.rotation.y += 0.03;
      }
      
      orbitGroup.rotation.y += 0.001;

      nodeMeshes.forEach((m, i) => {
        const isActive = m.userData.id === activeNodeId;
        m.position.y = nodes[i].position[1] + Math.sin(time * 2 + i) * 0.1;
        m.scale.setScalar(isActive ? 1.2 + Math.sin(time * 5) * 0.1 : 1);
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
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, activeNodeId, isRadarScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UndergroundThreeProps } from './three-types';

export const UndergroundShaftScene: React.FC<UndergroundThreeProps> = ({ 
  nodes, 
  activeNodeId, 
  onNodeSelect,
  showScanEffect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a); // 稍微提亮背景，增强视觉深度
    scene.fog = new THREE.FogExp2(0x05070a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // 整体曝光增强
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // --- 高亮度光影系统 ---
    const ambient = new THREE.AmbientLight(0xffffff, 1.5); // 强环境光
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2); // 天空/地面模拟光
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0); // 强方向光
    mainLight.position.set(15, 30, 15);
    scene.add(mainLight);

    const violetPoint = new THREE.PointLight(0x8b5cf6, 15, 50);
    violetPoint.position.set(-10, 5, 5);
    scene.add(violetPoint);

    // --- 模型构建 ---
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    // 材质：物理金属
    const industrialMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x64748b, 
      metalness: 0.8, 
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const colors = { critical: 0xef4444, warning: 0xf59e0b, normal: 0x10b981 };

    nodes.forEach((node) => {
      const color = colors[node.status];
      const isActive = activeNodeId === node.id;
      
      const geo = new THREE.IcosahedronGeometry(isActive ? 0.8 : 0.5, 0);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.5, // 增强自发光
        transparent: true,
        opacity: 0.9
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      
      const ringGeo = new THREE.TorusGeometry(1.0, 0.05, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      shaftGroup.add(mesh);
    });

    // 背景网格提亮
    const grid = new THREE.GridHelper(50, 40, 0x334155, 0x1e293b);
    grid.position.y = -8;
    scene.add(grid);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(shaftGroup.children);
      if (intersects.length > 0 && intersects[0].object.userData.id) {
        onNodeSelect(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      shaftGroup.children.forEach((obj, idx) => {
        if (obj instanceof THREE.Mesh) {
           obj.position.y += Math.sin(time * 2 + idx) * 0.005;
           obj.rotation.y += 0.01;
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
      renderer.domElement.removeEventListener('click', onClick);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [nodes, activeNodeId]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

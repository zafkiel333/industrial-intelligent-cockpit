
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExtractionSceneProps, ServiceAnchor } from './three-types';

export const ExtractionThreeScene: React.FC<ExtractionSceneProps> = ({ activeAssetId, onAssetSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const anchors: ServiceAnchor[] = [
    { id: 'shovel-boom', position: [4, 6, 0], label: '电铲主臂疲劳档案', type: 'inspection' },
    { id: 'shearer-drum', position: [-5, 1, 3], label: '采煤机滚筒寿命记录', type: 'maintenance' },
    { id: 'support-valve', position: [0, 2, -4], label: '支架控制阀组维保单', type: 'replacement' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

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

    // 环境氛围
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 创建三个核心资产的抽象几何体 (作为服务数据容器)
    const assetGroup = new THREE.Group();
    scene.add(assetGroup);

    const blueprintMat = new THREE.MeshPhongMaterial({
      color: 0x4338ca,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });

    // 电铲抽象
    const shovel = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), blueprintMat);
    shovel.position.x = 6;
    shovel.userData = { id: 'shovel' };
    assetGroup.add(shovel);

    // 采煤机抽象
    const shearer = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 8), blueprintMat);
    shearer.rotation.z = Math.PI / 2;
    shearer.position.x = -6;
    shearer.userData = { id: 'shearer' };
    assetGroup.add(shearer);

    // 支架抽象
    const support = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 2), blueprintMat);
    support.position.z = -5;
    support.userData = { id: 'support' };
    assetGroup.add(support);

    // 添加数据挂载点
    const anchorMeshes: THREE.Mesh[] = [];
    anchors.forEach(a => {
      const geo = new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...a.position);
      mesh.userData = { id: a.id, type: 'anchor' };
      scene.add(mesh);
      anchorMeshes.push(mesh);

      // 节点动态扫描环
      const ringGeo = new THREE.RingGeometry(0.4, 0.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
    });

    // 射线检测
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects([...assetGroup.children, ...anchorMeshes]);
      if (intersects.length > 0) {
        onAssetSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      anchorMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.2);
        m.children[0].scale.setScalar(1.5 + Math.sin(time * 2) * 0.5);
      });

      assetGroup.rotation.y += 0.002;
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
  }, []);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};

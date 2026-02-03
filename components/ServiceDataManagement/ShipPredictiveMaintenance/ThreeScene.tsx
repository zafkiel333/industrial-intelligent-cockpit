
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PredictiveSceneProps, MaintenanceNode } from './three-types';

export const ShipPredictiveMaintenanceThreeScene: React.FC<PredictiveSceneProps> = ({ activeNodeId, onNodeSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: MaintenanceNode[] = [
    { id: 'eng-main', name: '主推进引擎', health: 85, rul: 420, position: [-5, 2, 0], status: 'good', type: 'engine' },
    { id: 'gear-box', name: '减速齿轮箱', health: 45, rul: 45, position: [0, 1, 0], status: 'warning', type: 'gearbox' },
    { id: 'shaft-sys', name: '中间轴承组', health: 92, rul: 600, position: [5, 0, 0], status: 'good', type: 'shaft' },
    { id: 'prop-unit', name: '螺旋桨推进器', health: 28, rul: 12, position: [10, -2, 0], status: 'critical', type: 'propeller' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(20, 10, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 5, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);
    const redLight = new THREE.PointLight(0xef4444, 2, 30);
    redLight.position.set(10, 0, 5);
    scene.add(redLight);

    // 船体全息轮廓 (Ghost Ship)
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-15, 6);
    hullShape.lineTo(12, 6); // Deck
    hullShape.lineTo(15, -4); // Bow under
    hullShape.lineTo(-12, -4); // Stern under
    hullShape.lineTo(-15, 6);
    
    const extrudeSettings = { depth: 6, bevelEnabled: false };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    const hullMat = new THREE.MeshBasicMaterial({ 
      color: 0x1e1b4b, 
      transparent: true, 
      opacity: 0.1, 
      wireframe: true 
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = Math.PI; // Flip upright correction if needed based on shape drawing
    hull.position.z = -3;
    hull.position.y = 2;
    scene.add(hull);

    // 内部机械节点
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const meshes: THREE.Mesh[] = [];

    nodes.forEach(node => {
      const group = new THREE.Group();
      group.position.set(...node.position);

      const color = node.status === 'critical' ? 0xef4444 : node.status === 'warning' ? 0xf59e0b : 0x10b981;
      
      // 核心部件
      let geometry;
      if (node.type === 'engine') geometry = new THREE.BoxGeometry(4, 3, 3);
      else if (node.type === 'gearbox') geometry = new THREE.DodecahedronGeometry(1.5);
      else if (node.type === 'shaft') geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16).rotateZ(Math.PI/2);
      else geometry = new THREE.TorusKnotGeometry(1, 0.3, 64, 8);

      const material = new THREE.MeshPhongMaterial({
        color: node.id === activeNodeId ? 0xffffff : color,
        emissive: color,
        emissiveIntensity: node.id === activeNodeId ? 0.8 : 0.2,
        transparent: true,
        opacity: 0.9,
        wireframe: node.id !== activeNodeId
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { id: node.id };
      group.add(mesh);
      meshes.push(mesh);

      // 故障/状态光环
      if (node.status !== 'good') {
        const ringGeo = new THREE.RingGeometry(2, 2.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.lookAt(camera.position);
        group.add(ring);
        
        // 脉冲动画引用
        mesh.userData.ring = ring;
      }

      nodeGroup.add(group);
    });

    // 连接轴系
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 20, 8);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0x4b5563, transparent: true, opacity: 0.5 });
    const shaftLine = new THREE.Mesh(shaftGeo, shaftMat);
    shaftLine.position.set(0, 0, 0); // Center
    scene.add(shaftLine);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      meshes.forEach(mesh => {
        if (mesh.userData.ring) {
          mesh.userData.ring.lookAt(camera.position);
          const scale = 1 + Math.sin(time * 3) * 0.1;
          mesh.userData.ring.scale.set(scale, scale, scale);
        }
        // 选中特效
        if (mesh.userData.id === activeNodeId) {
           mesh.rotation.y += 0.02;
        }
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
  }, [activeNodeId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};

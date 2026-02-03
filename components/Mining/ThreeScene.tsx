
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningSceneProps, DataNode } from './three-types';

export const MiningThreeScene: React.FC<MiningSceneProps> = ({ onNodeClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const dataNodes: DataNode[] = [
    { id: 'engine', position: [0, 2.5, 0], label: '动力总成服务包', value: '维保剩余 120h' },
    { id: 'hydraulics', position: [4, 5, 0], label: '液压支护监测点', value: '最后校验: 昨天' },
    { id: 'track', position: [-2, 0.5, 2], label: '行走系统档案', value: '运行累计: 4500km' },
    { id: 'bucket', position: [7, 4, 0], label: '斗齿磨损履历', value: '已更换 4 次' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 全息风格光影
    const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x22d3ee, 15, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 数字化全息模型组
    const modelGroup = new THREE.Group();
    
    // 线框材质
    const wireMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    
    // 半透明主体材质
    const ghostMat = new THREE.MeshPhongMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });

    // 简易全息电铲模型
    const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 8), ghostMat);
    const baseWire = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 8), wireMat);
    modelGroup.add(base, baseWire);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), ghostMat);
    cabin.position.y = 2.25;
    const cabinWire = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), wireMat);
    cabinWire.position.y = 2.25;
    modelGroup.add(cabin, cabinWire);

    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 15), ghostMat);
    boom.rotation.z = Math.PI / 3;
    boom.position.set(5, 6, 0);
    const boomWire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 15), wireMat);
    boomWire.rotation.z = Math.PI / 3;
    boomWire.position.set(5, 6, 0);
    modelGroup.add(boom, boomWire);

    scene.add(modelGroup);

    // 创建可交互的数据节点
    const nodeMeshes: THREE.Mesh[] = [];
    dataNodes.forEach(nodeData => {
      const nodeGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(...nodeData.position);
      nodeMesh.userData = { id: nodeData.id, type: 'data-node' };
      scene.add(nodeMesh);
      nodeMeshes.push(nodeMesh);

      // 节点光晕
      const spriteMat = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2, 2, 1);
      nodeMesh.add(sprite);
    });

    // 辅助网格
    const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // 点击交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const nodeId = intersects[0].object.userData.id;
        onNodeClick?.(nodeId);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      nodeMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
      });
      
      modelGroup.rotation.y += 0.001;
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

  return (
    <div ref={mountRef} className="w-full h-full relative cursor-crosshair">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex flex-col gap-2">
           {dataNodes.map(node => (
             <div key={node.id} className="flex items-center gap-2 bg-black/40 backdrop-blur border border-cyan-500/20 px-2 py-1 rounded text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-slate-400">{node.label}:</span>
                <span className="text-cyan-200 font-mono">{node.value}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

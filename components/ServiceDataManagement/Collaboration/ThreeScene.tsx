
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningCollabProps, FaceNode } from './three-types';

export const CollaborationThreeScene: React.FC<MiningCollabProps> = ({ activeFaceId, onFaceSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const faceNodes: FaceNode[] = [
    { id: 'face-01', name: '101综采面', efficiency: 94, status: 'online', position: [-8, 0, -4], activeTasks: 2 },
    { id: 'face-02', name: '102综采面', efficiency: 82, status: 'warning', position: [0, 0, 0], activeTasks: 5 },
    { id: 'face-03', name: '201综采面', efficiency: 91, status: 'online', position: [8, 0, -4], activeTasks: 1 },
    { id: 'face-04', name: '中央调度池', efficiency: 100, status: 'online', position: [0, 6, -8], activeTasks: 0 },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 环境光与装饰性光
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 20, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // 背景网格：体现空间深度
    const grid = new THREE.GridHelper(60, 30, 0x334155, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeMeshes: THREE.Mesh[] = [];

    // 创建工作面数据节点
    faceNodes.forEach(node => {
      const group = new THREE.Group();
      group.position.set(...node.position);

      // 节点主体：几何体抽象
      const geo = new THREE.CylinderGeometry(1.5, 1.8, 0.8, 6); // 六边形基座
      const color = node.status === 'online' ? 0x0ea5e9 : 0xf59e0b;
      const mat = new THREE.MeshPhongMaterial({
        color: node.id === activeFaceId ? 0xffffff : color,
        transparent: true,
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // 节点上方悬浮的数据球
      const sphereGeo = new THREE.IcosahedronGeometry(0.6, 1);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 2;
      group.add(sphere);

      // 数据光环
      const ringGeo = new THREE.TorusGeometry(2, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      nodeGroup.add(group);
    });

    // 绘制资源流动路径（虚线）
    const pathMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
    const paths = [
      [faceNodes[0].position, faceNodes[3].position],
      [faceNodes[1].position, faceNodes[3].position],
      [faceNodes[2].position, faceNodes[3].position],
      [faceNodes[0].position, faceNodes[1].position],
    ];

    paths.forEach(p => {
      const points = [new THREE.Vector3(...p[0]), new THREE.Vector3(...p[1])];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, pathMat);
      scene.add(line);

      // 流光粒子效果
      const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      scene.add(particle);
      
      // 存储粒子路径信息以便动画
      particle.userData = { start: p[0], end: p[1], progress: Math.random() };
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: any) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onFaceSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 节点动画
      nodeGroup.children.forEach((group: any, i) => {
        const sphere = group.children[1];
        sphere.rotation.y += 0.01;
        sphere.position.y = 2 + Math.sin(time * 2 + i) * 0.3;
        
        const ring = group.children[2];
        ring.scale.setScalar(1 + Math.sin(time + i) * 0.1);
      });

      // 粒子流动画
      scene.children.forEach((child: any) => {
        if (child.userData && child.userData.start) {
          child.userData.progress += 0.005;
          if (child.userData.progress > 1) child.userData.progress = 0;
          
          child.position.lerpVectors(
            new THREE.Vector3(...child.userData.start),
            new THREE.Vector3(...child.userData.end),
            child.userData.progress
          );
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
  }, [activeFaceId]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};

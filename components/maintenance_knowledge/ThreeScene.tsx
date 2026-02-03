
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { KnowledgeThreeProps } from './three-types';

export const KnowledgeThreeScene: React.FC<KnowledgeThreeProps> = ({ 
  nodes, 
  isDistilling,
  onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 核心拓扑构建 ---
    const group = new THREE.Group();
    scene.add(group);

    const nodeMeshes: THREE.Mesh[] = [];
    const connectionLines: THREE.Line[] = [];

    // 中心核心 (知识库基座)
    const coreGeo = new THREE.IcosahedronGeometry(2, 2);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x7c3aed, 
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 节点创建
    nodes.forEach((node, i) => {
      const geo = new THREE.SphereGeometry(node.type === 'new' ? 0.4 : 0.2, 16, 16);
      const color = node.type === 'new' ? 0x10b981 : 0x0ea5e9;
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: node.type === 'new' ? 1.5 : 0.2,
        transparent: true,
        opacity: 0.9
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // 连线到中心
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...node.position)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.15 
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
      connectionLines.push(line);

      // 如果是新节点，增加扫描环
      if (node.type === 'new') {
        const ringGeo = new THREE.TorusGeometry(0.7, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }
    });

    // 知识流粒子动画
    const particlesCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount*3; i++) pPos[i] = (Math.random() - 0.5) * 20;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x7c3aed, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x7c3aed, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

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
      
      if (isDistilling) {
        group.rotation.y += 0.02;
        core.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
      }
      
      points.rotation.y += 0.001;
      nodeMeshes.forEach((m, idx) => {
          if (nodes[idx].type === 'new') {
              m.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
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
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, isDistilling]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

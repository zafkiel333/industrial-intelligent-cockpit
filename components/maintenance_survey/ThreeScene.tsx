
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SurveyThreeProps } from './three-types';

export const SurveyThreeScene: React.FC<SurveyThreeProps> = ({ 
  nodes, 
  activeNodeId, 
  onNodeSelect,
  isSubmitting
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isSubmitting;
    controls.autoRotateSpeed = 0.5;

    // --- 情感粒子云构建 ---
    const group = new THREE.Group();
    scene.add(group);

    const nodeMeshes: THREE.Mesh[] = [];
    const sentimentColors = {
      positive: 0x10b981, // 绿色
      neutral: 0xf59e0b,  // 橙色
      negative: 0xef4444   // 红色
    };

    // 背景装饰粒子
    const bgPointsCount = 500;
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgPointsCount * 3);
    for(let i=0; i<bgPointsCount*3; i++) bgPos[i] = (Math.random() - 0.5) * 40;
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ size: 0.05, color: 0x6366f1, transparent: true, opacity: 0.2 });
    const bgPoints = new THREE.Points(bgGeo, bgMat);
    scene.add(bgPoints);

    // 评价节点
    nodes.forEach((node) => {
      const color = sentimentColors[node.sentiment];
      const isActive = activeNodeId === node.id;
      
      const size = 0.3 + (node.rating / 5) * 0.4;
      const geo = new THREE.SphereGeometry(size, 16, 16);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.4,
        transparent: true,
        opacity: isActive ? 1.0 : 0.6,
        shininess: 100
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // 如果选中，增加扩散光环
      if (isActive) {
        const ringGeo = new THREE.TorusGeometry(size + 0.3, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }
    });

    // 连接线（模拟共识）
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.1 });
    for(let i=0; i<nodes.length; i++) {
        for(let j=i+1; j<nodes.length; j++) {
            if(Math.random() > 0.8) {
                const lineGeo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(...nodes[i].position),
                    new THREE.Vector3(...nodes[j].position)
                ]);
                const line = new THREE.Line(lineGeo, lineMat);
                group.add(line);
            }
        }
    }

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x8b5cf6, 5, 40);
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
      
      if (isSubmitting) {
        group.rotation.y += 0.05;
        camera.position.z -= 0.02;
      }
      
      group.children.forEach((obj, idx) => {
        if (obj instanceof THREE.Mesh) {
           obj.position.y += Math.sin(time + idx) * 0.002;
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
  }, [nodes, activeNodeId, isSubmitting]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

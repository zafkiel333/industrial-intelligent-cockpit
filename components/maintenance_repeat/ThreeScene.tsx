
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RepeatThreeProps } from './three-types';

export const RepeatThreeScene: React.FC<RepeatThreeProps> = ({ 
  nodes, 
  activeClusterId, 
  onNodeSelect,
  isAnalyzing
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 优化1：降低雾化浓度，从 0.04 减为 0.015
    scene.fog = new THREE.FogExp2(0x02040a, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isAnalyzing;
    controls.autoRotateSpeed = 0.5;

    // --- 场景构建 ---
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    const nodeMeshes: THREE.Mesh[] = [];
    const clusterColors = [0xf59e0b, 0x0ea5e9, 0x8b5cf6, 0x10b981, 0xef4444];

    // 创建节点
    nodes.forEach((node) => {
      const color = clusterColors[node.clusterId % clusterColors.length];
      const isActive = activeClusterId === node.clusterId;
      
      const geo = new THREE.SphereGeometry(isActive ? 0.45 : 0.25, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: isActive ? 1.0 : 0.6,
        // 优化2：强化自发光效果
        emissive: color,
        emissiveIntensity: isActive ? 1.2 : 0.4,
        shininess: 100,
        specular: 0xffffff
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id, clusterId: node.clusterId };
      clusterGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 如果是激活簇，添加显眼的外环
      if (isActive) {
        const ringGeo = new THREE.TorusGeometry(0.7, 0.03, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
        
        // 增加一个额外的呼吸光圈
        const glowRingGeo = new THREE.TorusGeometry(0.8, 0.01, 8, 32);
        const glowRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
        glowRing.rotation.x = Math.PI / 2;
        mesh.add(glowRing);
      }
    });

    // 创建连线 (增强可见度)
    if (activeClusterId !== null) {
      const activeNodes = nodeMeshes.filter(m => m.userData.clusterId === activeClusterId);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: clusterColors[activeClusterId! % clusterColors.length], 
        transparent: true, 
        opacity: 0.4 // 提高连线亮度
      });

      for (let i = 0; i < activeNodes.length; i++) {
        for (let j = i + 1; j < activeNodes.length; j++) {
          const points = [activeNodes[i].position, activeNodes[j].position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          clusterGroup.add(line);
        }
      }
    }

    // 环境修饰
    const grid = new THREE.GridHelper(40, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -6;
    scene.add(grid);

    // --- 核心优化：光照系统升级 ---
    
    // 优化3：大幅增强环境光，消除死黑
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // 优化4：添加平行光，提供形体轮廓和质感
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    // 优化5：调整点光源位置和强度，使光影更有层次
    const point = new THREE.PointLight(0x8b5cf6, 8, 60);
    point.position.set(5, 15, 5);
    scene.add(point);

    // 优化6：为底部网格增加反光感
    const spotLight = new THREE.SpotLight(0x0ea5e9, 10, 100);
    spotLight.position.set(-20, 30, 20);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // 交互逻辑
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      if (isAnalyzing) {
        clusterGroup.rotation.y += 0.01;
      }

      // 选定节点的小幅律动
      nodeMeshes.forEach(m => {
        if(activeClusterId === m.userData.clusterId) {
            m.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
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
  }, [nodes, activeClusterId, isAnalyzing]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

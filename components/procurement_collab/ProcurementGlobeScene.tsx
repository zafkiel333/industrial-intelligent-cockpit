
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ProcurementThreeProps } from './three-types';

export const ProcurementGlobeScene: React.FC<ProcurementThreeProps> = ({
  nodes,
  routes,
  activeOrderId,
  onNodeClick,
  isSimulating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 使用稍亮的深空蓝背景，而非死黑
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !activeOrderId;
    controls.autoRotateSpeed = 0.5;

    // --- 核心优化：高亮度光照系统 ---
    // 1. 强力的环境光，确保所有细节清晰
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // 2. 顶部主工业射灯 (冷色)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    // 3. 侧向补光 (青色)
    const cyanPoint = new THREE.PointLight(0x0ea5e9, 10, 50);
    cyanPoint.position.set(-15, 5, 5);
    scene.add(cyanPoint);

    // 4. 底部反光 (紫色)
    const purplePoint = new THREE.PointLight(0x8b5cf6, 5, 30);
    purplePoint.position.set(0, -10, 0);
    scene.add(purplePoint);

    // --- 场景构建：数字化地球 ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 基础球体 (带线框)
    const globeGeo = new THREE.SphereGeometry(8, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const globeLine = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeLine);

    // 核心光球
    const innerGeo = new THREE.SphereGeometry(7.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.03
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerGlobe);

    // --- 节点创建 ---
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<string, THREE.Vector3>();

    nodes.forEach((node, i) => {
      const phi = (90 - node.position[0]) * (Math.PI / 180);
      const theta = (node.position[1] + 180) * (Math.PI / 180);
      const pos = new THREE.Vector3(
        -(8 * Math.sin(phi) * Math.cos(theta)),
        8 * Math.cos(phi),
        8 * Math.sin(phi) * Math.sin(theta)
      );
      nodeMap.set(node.id, pos);

      const color = node.risk === 'high' ? 0xef4444 : (node.risk === 'med' ? 0xf59e0b : 0x10b981);
      const geo = node.type === 'supplier' ? new THREE.OctahedronGeometry(0.5) : new THREE.IcosahedronGeometry(0.3);
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { id: node.id };
      globeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 增加扩散圈
      const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0,0,0);
      globeGroup.add(ring);
    });

    // --- 粒子流 (协作数据流) ---
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) pPos[i] = (Math.random() - 0.5) * 30;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.08, color: 0x8b5cf6, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- 连线逻辑 (弧线) ---
    routes.forEach(route => {
      const start = nodeMap.get(route.from);
      const end = nodeMap.get(route.to);
      if (start && end) {
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(10);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const pts = curve.getPoints(50);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({ 
          color: route.status === 'delayed' ? 0xf59e0b : 0x0ea5e9, 
          transparent: true, 
          opacity: 0.4 
        });
        scene.add(new THREE.Line(lineGeo, lineMat));
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) onNodeClick(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      particles.rotation.y += 0.001;
      particles.rotation.z += 0.0005;

      nodeMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(frame * 4 + i) * 0.1);
        if (m.userData.id === activeOrderId) {
            m.scale.setScalar(1.5);
            (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 2 + Math.sin(frame * 10);
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
  }, [nodes, routes, activeOrderId, onNodeClick, isSimulating]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

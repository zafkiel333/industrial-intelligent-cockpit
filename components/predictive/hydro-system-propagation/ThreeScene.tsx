
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropagationSceneProps } from './three-types';

export const PropagationThreeScene: React.FC<PropagationSceneProps> = ({
  nodes,
  activePropagationPath,
  flowIntensity,
  isEmergency,
  propagationSpeed
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const nodeMeshesRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光环境
    const ambientLight = new THREE.AmbientLight(0x1a2e4c, 0.5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0x3b82f6, 2, 100);
    topLight.position.set(0, 50, 0);
    scene.add(topLight);

    // 1. 生成系统节点 (抽象立方体/球体)
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    nodeMeshesRef.current = [];

    nodes.forEach(node => {
        const group = new THREE.Group();
        group.position.set(...node.pos);
        group.userData = { id: node.id };

        // 核心几何体
        const geo = node.type === 'machine' ? new THREE.IcosahedronGeometry(2, 1) : new THREE.BoxGeometry(3, 3, 3);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x1e293b, 
            emissive: 0x0ea5e9, 
            emissiveIntensity: 0.2,
            metalness: 0.9,
            roughness: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        // 外层全息框
        const wireGeo = new THREE.EdgesGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        group.add(wire);

        nodeGroup.add(group);
        nodeMeshesRef.current.push(group);
    });

    // 2. 生成连线与粒子流
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pMeta = []; // 存储粒子在路径上的进度

    for(let i=0; i<pCount; i++) {
        pMeta.push({
            pathIdx: Math.floor(Math.random() * (nodes.length - 1)),
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.005
        });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 动画
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 更新粒子位置 (沿路径流动)
      if (particlesRef.current) {
          const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const mat = particlesRef.current.material as THREE.PointsMaterial;
          
          for(let i=0; i<pCount; i++) {
              const meta = pMeta[i];
              meta.progress += meta.speed * flowIntensity;
              if(meta.progress > 1) meta.progress = 0;

              const start = new THREE.Vector3(...nodes[meta.pathIdx].pos);
              const end = new THREE.Vector3(...nodes[meta.pathIdx + 1].pos);
              const currentPos = new THREE.Vector3().lerpVectors(start, end, meta.progress);
              
              // 添加随机抖动
              pos[i*3] = currentPos.x + (Math.random()-0.5);
              pos[i*3+1] = currentPos.y + (Math.random()-0.5);
              pos[i*3+2] = currentPos.z + (Math.random()-0.5);
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // 如果是紧急状态，粒子变红
          mat.color.lerp(new THREE.Color(isEmergency ? 0xef4444 : 0x0ea5e9), 0.05);
      }

      // 更新节点视觉反馈
      nodeMeshesRef.current.forEach(group => {
          const id = group.userData.id;
          const node = nodes.find(n => n.id === id);
          const mesh = group.children[0] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          
          const isAtRisk = activePropagationPath.includes(id);
          const targetColor = new THREE.Color(isAtRisk ? 0xef4444 : 0x0ea5e9);
          
          mat.emissive.lerp(targetColor, 0.1);
          mat.emissiveIntensity = isAtRisk ? (0.5 + Math.sin(time * 10) * 0.5) : 0.2;
          
          if(isAtRisk) {
              group.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
          } else {
              group.scale.setScalar(1);
          }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [nodes, activePropagationPath, flowIntensity, isEmergency]);

  return <div ref={mountRef} className="w-full h-full" />;
};

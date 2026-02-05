
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CascadeSceneProps } from './three-types';

export const CascadeThreeScene: React.FC<CascadeSceneProps> = ({ 
  nodes, 
  links, 
  activePropagationId,
  showFlow 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flowParticlesRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.8;
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x1a2e4c, 0.5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0x3b82f6, 2, 100);
    topLight.position.set(0, 50, 0);
    scene.add(topLight);

    // 材质
    const nodeMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.9, 
        roughness: 0.1 
    });

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // 1. 创建节点
    nodes.forEach(node => {
        const group = new THREE.Group();
        group.position.set(...node.pos);
        
        // 核心几何体
        const geo = node.type === 'system' ? new THREE.OctahedronGeometry(2) : new THREE.IcosahedronGeometry(1.2, 1);
        const mesh = new THREE.Mesh(geo, nodeMat.clone());
        mesh.userData = { id: node.id };
        group.add(mesh);

        // 外层全息环
        const ringGeo = new THREE.TorusGeometry(2.5, 0.05, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: node.risk > 0.7 ? 0xef4444 : 0x22d3ee, 
            transparent: true, 
            opacity: 0.3 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        nodeGroup.add(group);
    });

    // 2. 创建连线与流动粒子
    const flowGroup = new THREE.Group();
    scene.add(flowGroup);
    flowParticlesRef.current = flowGroup;

    links.forEach(link => {
        const start = nodes.find(n => n.id === link.source);
        const end = nodes.find(n => n.id === link.target);
        if (!start || !end) return;

        const startVec = new THREE.Vector3(...start.pos);
        const endVec = new THREE.Vector3(...end.pos);

        // 基础连线
        const lineGeo = new THREE.BufferGeometry().setFromPoints([startVec, endVec]);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x334155, 
            transparent: true, 
            opacity: 0.2 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);

        // 流动粒子系统
        if (showFlow) {
            const pCount = 20;
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(pCount * 3);
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({
                color: link.transferRisk > 0.5 ? 0xf59e0b : 0x22d3ee,
                size: 0.2,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            const particles = new THREE.Points(pGeo, pMat);
            particles.userData = { startVec, endVec, progress: Math.random() };
            flowGroup.add(particles);
        }
    });

    // 动画循环
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 粒子流动动画
      if (flowParticlesRef.current) {
          flowParticlesRef.current.children.forEach((p: any) => {
              const { startVec, endVec } = p.userData;
              p.userData.progress += 0.005;
              if (p.userData.progress > 1) p.userData.progress = 0;
              
              const currentPos = new THREE.Vector3().lerpVectors(startVec, endVec, p.userData.progress);
              const posArray = p.geometry.attributes.position.array;
              for(let i=0; i<20; i++) {
                  posArray[i*3] = currentPos.x + (Math.random()-0.5)*0.5;
                  posArray[i*3+1] = currentPos.y + (Math.random()-0.5)*0.5;
                  posArray[i*3+2] = currentPos.z + (Math.random()-0.5)*0.5;
              }
              p.geometry.attributes.position.needsUpdate = true;
          });
      }

      // 节点状态更新
      nodeGroup.children.forEach((group: any, i) => {
          const node = nodes[i];
          const mesh = group.children[0] as THREE.Mesh;
          const ring = group.children[1] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;

          // 风险呼吸灯
          const intensity = 0.2 + (node.risk > 0.5 ? Math.sin(time * 10) * 0.5 + 0.5 : 0.2);
          mat.emissive.setHex(node.risk > 0.8 ? 0xef4444 : node.risk > 0.5 ? 0xf59e0b : 0x0ea5e9);
          mat.emissiveIntensity = intensity;

          // 环旋转
          ring.rotation.z += 0.02;
          ring.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
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
  }, [nodes, links, activePropagationId, showFlow]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

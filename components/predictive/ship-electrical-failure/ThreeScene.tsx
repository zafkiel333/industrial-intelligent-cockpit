import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElectricalFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  failureSeverity?: number; // 0-1
  activeNodeId?: string;
  isGlitching?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  failureSeverity = 0.2, 
  activeNodeId = 'gen1',
  isGlitching = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 科技蓝调光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ElectricalFailureAnimatables = { nodes: new Map(), powerLines: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 创建拓扑节点 (Nodes) ---
    const nodesData = [
        { id: 'gen1', pos: [-5, 2, 0], label: 'Genset 1', color: 0x22d3ee },
        { id: 'gen2', pos: [-5, -2, 0], label: 'Genset 2', color: 0x22d3ee },
        { id: 'msb', pos: [0, 0, 0], label: 'MSB', color: 0x8b5cf6 },
        { id: 'prop', pos: [6, 0, 0], label: 'Propulsion', color: 0x0ea5e9 },
        { id: 'aux', pos: [4, 4, -2], label: 'Auxiliary', color: 0x10b981 }
    ];

    const sphereGeo = new THREE.IcosahedronGeometry(0.6, 2);
    nodesData.forEach(item => {
        const nodeGroup = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ 
            color: item.color, 
            emissive: item.color, 
            emissiveIntensity: 0.5,
            wireframe: true 
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        nodeGroup.add(mesh);
        nodeGroup.position.set(item.pos[0], item.pos[1], item.pos[2]);
        
        // 外部光环
        const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: item.color, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        nodeGroup.add(ring);

        group.add(nodeGroup);
        animatables.nodes?.set(item.id, nodeGroup);
        disposables.push(sphereGeo, mat, ringGeo, ringMat);
    });

    // --- 2. 能量传输线 (Power Lines) ---
    const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.2 });
    const connections = [
        ['gen1', 'msb'], ['gen2', 'msb'], ['msb', 'prop'], ['msb', 'aux']
    ];

    connections.forEach(([from, to]) => {
        const fromNode = animatables.nodes?.get(from);
        const toNode = animatables.nodes?.get(to);
        if (fromNode && toNode) {
            const points = [fromNode.position, toNode.position];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat);
            animatables.powerLines?.add(line);
            disposables.push(lineGeo);
        }
    });
    group.add(animatables.powerLines!);

    // --- 3. 故障脉冲层 (Failure Pulse) ---
    const pulseGeo = new THREE.SphereGeometry(12, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        wireframe: true, 
        transparent: true, 
        opacity: 0 
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    scene.add(pulse);
    animatables.glitchEffect = pulse;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体律动
      group.rotation.y += 0.002;
      group.position.y = Math.sin(time * 0.5) * 0.2;

      // 节点呼吸与警告色
      animatables.nodes?.forEach((node, id) => {
          const isTarget = id === activeNodeId;
          const scale = 1 + Math.sin(time * 3) * 0.1;
          node.scale.setScalar(isTarget ? scale * 1.5 : 1);
          
          if (isTarget && failureSeverity > 0.5) {
              (node.children[0] as THREE.Mesh).material.emissive.setHex(0xef4444);
              (node.children[1] as THREE.Mesh).material.color.setHex(0xef4444);
          } else {
              const baseColor = nodesData.find(d => d.id === id)?.color || 0x22d3ee;
              (node.children[0] as THREE.Mesh).material.emissive.setHex(baseColor);
              (node.children[1] as THREE.Mesh).material.color.setHex(baseColor);
          }
      });

      // 故障闪烁效果
      if (isGlitching || failureSeverity > 0.8) {
          pulseMat.opacity = Math.sin(time * 20) * 0.1 + 0.05;
          group.position.x = (Math.random() - 0.5) * 0.05;
      } else {
          pulseMat.opacity = 0;
      }

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [failureSeverity, activeNodeId, isGlitching]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
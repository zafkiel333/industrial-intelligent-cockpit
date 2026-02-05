import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PowerLoadAnimatables } from './three-types';

interface ThreeSceneProps {
  loadIntensity?: number; // 0-1
  isAnomalyDetected?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  loadIntensity = 0.5, 
  isAnomalyDetected = false 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 光影设置 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(isAnomalyDetected ? 0xef4444 : 0x0ea5e9, 20, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: PowerLoadAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 能量总线 (Power Bus Core) ---
    const busGeo = new THREE.TorusGeometry(4, 0.05, 16, 100);
    const busMat = new THREE.MeshBasicMaterial({ 
        color: isAnomalyDetected ? 0xef4444 : 0x22d3ee, 
        transparent: true, 
        opacity: 0.3 
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    bus.rotation.x = Math.PI / 2;
    group.add(bus);
    disposables.push(busGeo, busMat);

    // --- 2. 电子流 (Electron Flow Particles) ---
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = (i / pCount) * Math.PI * 2;
        pPos[i*3] = Math.cos(angle) * 4;
        pPos[i*3+1] = (Math.random() - 0.5) * 0.5;
        pPos[i*3+2] = Math.sin(angle) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: isAnomalyDetected ? 0xff4444 : 0x67e8f9, 
        size: 0.04, 
        transparent: true, 
        opacity: 0.6 
    });
    const electrons = new THREE.Points(pGeo, pMat);
    group.add(electrons);
    animatables.electronFlow = electrons;
    disposables.push(pGeo, pMat);

    // --- 3. 负载节点 (Load Nodes) ---
    const nodesGroup = new THREE.Group();
    const nodeGeo = new THREE.IcosahedronGeometry(0.4, 1);
    const nodeMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        emissive: 0x22d3ee, 
        emissiveIntensity: 0.5 
    });
    for(let i=0; i<6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * 4, 0, Math.sin(angle) * 4);
        nodesGroup.add(node);
    }
    group.add(nodesGroup);
    animatables.transformerNodes = nodesGroup;
    disposables.push(nodeGeo, nodeMat);

    // --- 4. 能量脉冲面 (Pulse Effect) ---
    const pulseGeo = new THREE.SphereGeometry(3.9, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ 
        color: isAnomalyDetected ? 0xef4444 : 0x0ea5e9, 
        transparent: true, 
        opacity: 0.05, 
        wireframe: true 
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pulse);
    animatables.energyPulse = pulse;
    disposables.push(pulseGeo, pulseMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟
      group.rotation.y += 0.002;
      
      // 电子流速随负载变化
      if (animatables.electronFlow) {
          const speed = 0.01 * (1 + loadIntensity * 5);
          animatables.electronFlow.rotation.y += speed;
          if (isAnomalyDetected) {
              // 异常时的紊乱效果
              const pos = animatables.electronFlow.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  pos[i*3+1] += Math.sin(time * 10 + i) * 0.01;
              }
              animatables.electronFlow.geometry.attributes.position.needsUpdate = true;
          }
      }

      // 能量脉动
      if (animatables.energyPulse) {
          const scale = 1 + Math.sin(time * 4) * 0.05 * (1 + loadIntensity);
          animatables.energyPulse.scale.setScalar(scale);
      }

      // 节点呼吸
      if (animatables.transformerNodes) {
          animatables.transformerNodes.children.forEach((n, i) => {
              (n as THREE.Mesh).scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
          });
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
  }, [loadIntensity, isAnomalyDetected]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
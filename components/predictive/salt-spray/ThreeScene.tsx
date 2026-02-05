
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CorrosionAnimatables, CorrosionViewMode } from './three-types';

interface ThreeSceneProps {
  corrosionLevel?: number; // 0 (New) to 1 (Failed)
  saltDensity?: number; // 0-1
  viewMode?: CorrosionViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  corrosionLevel = 0.0,
  saltDensity = 0.5,
  viewMode = 'visual-surface'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a05); // Dark greenish black
    scene.fog = new THREE.FogExp2(0x050a05, 0.02 + saltDensity * 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // --- 腐蚀实验室光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const acidLight = new THREE.DirectionalLight(0xa3e635, 1.0); // Acid Green Sun
    acidLight.position.set(5, 10, 5);
    scene.add(acidLight);

    const rustLight = new THREE.PointLight(0xf97316, 10, 20); // Orange Rust Glow
    rustLight.position.set(-5, 2, 5);
    scene.add(rustLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CorrosionAnimatables = { bolts: [], pittingNodes: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 核心部件：高压法兰 (Flange Connection) ---
    const metalGroup = new THREE.Group();
    group.add(metalGroup);
    animatables.metalGroup = metalGroup;

    // 管道
    const pipeGeo = new THREE.CylinderGeometry(2, 2, 10, 32);
    pipeGeo.rotateZ(Math.PI / 2);
    const metalMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, // Steel Grey
        metalness: 0.8, 
        roughness: 0.3 + corrosionLevel * 0.7 // Gets rougher
    });
    const pipe = new THREE.Mesh(pipeGeo, metalMat);
    metalGroup.add(pipe);
    disposables.push(pipeGeo, metalMat);

    // 法兰盘
    const flangeGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.8, 32);
    flangeGeo.rotateZ(Math.PI / 2);
    const flange1 = new THREE.Mesh(flangeGeo, metalMat);
    flange1.position.x = -0.4;
    metalGroup.add(flange1);
    
    const flange2 = new THREE.Mesh(flangeGeo, metalMat);
    flange2.position.x = 0.4;
    metalGroup.add(flange2);
    disposables.push(flangeGeo);

    // 螺栓组
    const boltGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    boltGeo.rotateZ(Math.PI / 2);
    const boltCount = 8;
    for(let i=0; i<boltCount; i++) {
        const angle = (i / boltCount) * Math.PI * 2;
        const bolt = new THREE.Mesh(boltGeo, metalMat);
        const r = 2.8;
        bolt.position.set(0, Math.cos(angle) * r, Math.sin(angle) * r);
        metalGroup.add(bolt);
        animatables.bolts?.push(bolt);
    }
    disposables.push(boltGeo);

    // --- 2. 锈蚀覆盖层 (Rust Overlay) ---
    // 使用稍微大一点的几何体作为锈层，通过透明度控制生长
    const rustMat = new THREE.MeshStandardMaterial({
        color: 0x7c2d12, // Deep Rust
        roughness: 1.0,
        metalness: 0.0,
        transparent: true,
        opacity: Math.max(0, corrosionLevel - 0.1), // 逐渐显现
        depthWrite: false, // Avoid z-fighting
        side: THREE.FrontSide
    });
    
    // 简单的锈蚀层模拟 (包裹主要部件)
    const rustPipe = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 10, 32).rotateZ(Math.PI/2), rustMat);
    metalGroup.add(rustPipe);
    const rustFlange = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.55, 1.8, 32).rotateZ(Math.PI/2), rustMat);
    metalGroup.add(rustFlange);
    
    animatables.rustShell = rustFlange; // Just track one for reference
    disposables.push(rustMat);

    // --- 3. 蚀坑节点 (Pitting Corrosion) ---
    group.add(animatables.pittingNodes!);
    const pitCount = Math.floor(corrosionLevel * 50);
    const pitGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const pitMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red hazard spots
    
    for(let i=0; i<pitCount; i++) {
        const pit = new THREE.Mesh(pitGeo, pitMat);
        // Randomly place on flange rim
        const angle = Math.random() * Math.PI * 2;
        const r = 3.5;
        pit.position.set(
            (Math.random()-0.5) * 1.5,
            Math.cos(angle) * r,
            Math.sin(angle) * r
        );
        animatables.pittingNodes!.add(pit);
    }
    disposables.push(pitGeo, pitMat);

    // --- 4. 盐雾粒子 (Salt Fog) ---
    const fogCount = 1000;
    const fogGeo = new THREE.BufferGeometry();
    const fogPos = new Float32Array(fogCount * 3);
    for(let i=0; i<fogCount; i++) {
        fogPos[i*3] = (Math.random() - 0.5) * 20;
        fogPos[i*3+1] = (Math.random() - 0.5) * 20;
        fogPos[i*3+2] = (Math.random() - 0.5) * 20;
    }
    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
    const fogMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.1, 
        transparent: true, 
        opacity: saltDensity * 0.3 
    });
    const fog = new THREE.Points(fogGeo, fogMat);
    scene.add(fog);
    animatables.saltFog = fog;
    disposables.push(fogGeo, fogMat);

    // --- 5. 电化学反应场 (Electrochemical Field) ---
    if (viewMode === 'electrochemical') {
        const fieldGroup = new THREE.Group();
        const lineGeo = new THREE.BufferGeometry();
        const linePos = [];
        for(let i=0; i<50; i++) {
            const start = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*6, (Math.random()-0.5)*6);
            const end = start.clone().add(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize().multiplyScalar(2));
            linePos.push(start.x, start.y, start.z, end.x, end.y, end.z);
        }
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x84cc16, transparent: true, opacity: 0.5 });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        fieldGroup.add(lines);
        group.add(fieldGroup);
        animatables.electrochemicalField = fieldGroup;
        disposables.push(lineGeo, lineMat);
    }

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 盐雾流动
      if (animatables.saltFog) {
          animatables.saltFog.rotation.y = time * 0.05;
          animatables.saltFog.position.y = Math.sin(time) * 0.5;
      }

      // 锈蚀颜色脉动 (模拟化学反应活性)
      if (corrosionLevel > 0 && rustMat) {
          rustMat.emissiveIntensity = Math.sin(time * 2) * 0.1 * corrosionLevel;
      }

      // 点蚀坑闪烁
      if (animatables.pittingNodes && viewMode === 'pitting-depth') {
          animatables.pittingNodes.children.forEach((p, i) => {
              const scale = 1 + Math.sin(time * 5 + i) * 0.3;
              p.scale.setScalar(scale);
          });
      }

      // 电化学电子流
      if (animatables.electrochemicalField) {
          animatables.electrochemicalField.rotation.z += 0.01;
          animatables.electrochemicalField.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
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
  }, [corrosionLevel, saltDensity, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

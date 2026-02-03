
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SeawaterCoolingAnimatables } from './three-types';

interface ThreeSceneProps {
  scalingSeverity?: number; // 0-1 结垢程度
  corrosionSeverity?: number; // 0-1 腐蚀程度
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  scalingSeverity = 0.3, 
  corrosionSeverity = 0.2,
  isScanning = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const aquaLight = new THREE.PointLight(0x0ea5e9, 15, 30);
    aquaLight.position.set(-5, 2, 5);
    scene.add(aquaLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SeawaterCoolingAnimatables = { 
      bioFoulingSpots: new THREE.Group(),
      corrosionPits: new THREE.Group()
    };
    const disposables: any[] = [];

    // --- 1. 海水管路剖面 (Pipe Section) ---
    const pipeGeo = new THREE.CylinderGeometry(3, 3, 10, 64, 1, true, 0, Math.PI * 1.5);
    const pipeMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        side: THREE.DoubleSide,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    group.add(pipe);
    animatables.pipeSection = pipe;
    disposables.push(pipeGeo, pipeMat);

    // --- 2. 内部结垢层 (Scaling Layer) ---
    // 半径随结垢程度变小 (向内生长)
    const scaleGeo = new THREE.CylinderGeometry(2.95, 2.95, 9.8, 64, 1, true, 0, Math.PI * 1.5);
    const scaleMat = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: scalingSeverity * 0.9,
        roughness: 1.0,
        bumpScale: 0.1
    });
    const scaling = new THREE.Mesh(scaleGeo, scaleMat);
    scaling.scale.set(1 - scalingSeverity * 0.15, 1, 1 - scalingSeverity * 0.15);
    group.add(scaling);
    animatables.scalingLayer = scaling;
    disposables.push(scaleGeo, scaleMat);

    // --- 3. 生物污损点 (Bio-fouling Spots) ---
    const spotGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 1 });
    const spotCount = Math.floor(scalingSeverity * 50);
    for(let i=0; i<spotCount; i++) {
        const spot = new THREE.Mesh(spotGeo, spotMat);
        const angle = Math.random() * Math.PI * 1.5;
        const radius = 2.9;
        spot.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 8, Math.sin(angle) * radius);
        spot.scale.set(1, 0.5 + Math.random(), 1.2);
        animatables.bioFoulingSpots?.add(spot);
    }
    group.add(animatables.bioFoulingSpots!);
    disposables.push(spotGeo, spotMat);

    // --- 4. 腐蚀蚀坑 (Corrosion Pits) ---
    const pitGeo = new THREE.CircleGeometry(0.15, 16);
    const pitMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const pitCount = Math.floor(corrosionSeverity * 30);
    for(let i=0; i<pitCount; i++) {
        const pit = new THREE.Mesh(pitGeo, pitMat);
        const angle = Math.random() * Math.PI * 1.5;
        const radius = 3.01; // 贴在管外壁
        pit.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 8, Math.sin(angle) * radius);
        pit.lookAt(0, pit.position.y, 0);
        animatables.corrosionPits?.add(pit);
    }
    group.add(animatables.corrosionPits!);
    disposables.push(pitGeo, pitMat);

    // --- 5. 扫描面 (Scanner) ---
    const scanGeo = new THREE.TorusGeometry(3.5, 0.03, 16, 100, Math.PI * 1.5);
    scanGeo.rotateX(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.scanningFringe = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 扫描环上下移动
      if (isScanning && animatables.scanningFringe) {
          animatables.scanningFringe.position.y = Math.sin(time * 1.5) * 4.5;
          animatables.scanningFringe.scale.setScalar(1 + Math.sin(time * 10) * 0.02);
      }

      // 蚀坑闪烁红色警告
      if (animatables.corrosionPits) {
          animatables.corrosionPits.children.forEach(p => {
              (p as THREE.Mesh).scale.setScalar(1 + Math.sin(time * 8) * 0.2);
          });
      }

      group.rotation.y += 0.002;
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
  }, [scalingSeverity, corrosionSeverity, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HoistRopeSceneProps } from './three-types';

export const HoistRopeThreeScene: React.FC<HoistRopeSceneProps> = ({
  ropeExtension,
  loadKn,
  defects,
  scanPos,
  isScanning,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const scannerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-hoist-rope useEffect===");    

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    // 降低雾密度（减少暗化）：0.04 → 0.02
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 20, 25);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 提升曝光度（核心亮度提升）：1.5 → 2.2
    renderer.toneMappingExposure = 2.2;
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- 大幅强化的灯光系统 ---
    // 1. 环境光：强度拉满，2.5 → 8.0
    const ambientLight = new THREE.AmbientLight(0xffffff, 8.0);
    scene.add(ambientLight);

    // 新增半球光（补充环境光，区分天地光照，提升自然亮度）
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 6.0);
    hemisphereLight.position.set(0, 30, 0);
    scene.add(hemisphereLight);
    
    // 2. 主青色点光源：强度5 → 15，范围100→150，位置微调扩大覆盖
    const cyanLight = new THREE.PointLight(0x0ea5e9, 15.0, 150);
    cyanLight.position.set(15, 25, 15);
    scene.add(cyanLight);

    // 3. 背光：强度3 → 10，范围100→150，位置抬高减少阴影
    const backLight = new THREE.PointLight(0x8b5cf6, 10.0, 150);
    backLight.position.set(-15, 20, -15);
    scene.add(backLight);

    // 4. 新增正面补光（白色，高强度）
    const frontFillLight = new THREE.PointLight(0xffffff, 8.0, 120);
    frontFillLight.position.set(0, 20, 20);
    scene.add(frontFillLight);

    // 5. 新增底部补光（解决下方过暗问题）
    const bottomFillLight = new THREE.PointLight(0xffffff, 5.0, 100);
    bottomFillLight.position.set(0, -5, 0);
    scene.add(bottomFillLight);

    // --- 材质（完全未修改）---
    const steelMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 1.0,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.05
    });
    
    const structureMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, metalness: 0.8, roughness: 0.4
    });

    const defectMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2.0
    });

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. 提升滚筒 (Drum) - 放大尺寸
    const drumGeo = new THREE.CylinderGeometry(4, 4, 6, 32);
    drumGeo.rotateZ(Math.PI / 2);
    const drum = new THREE.Mesh(drumGeo, structureMat);
    drum.position.set(-6, 8, 0);
    mainGroup.add(drum);

    // 2. 天轮 (Sheave) - 放大尺寸
    const sheaveGeo = new THREE.TorusGeometry(3, 0.4, 16, 64);
    const sheave = new THREE.Mesh(sheaveGeo, structureMat);
    sheave.position.set(6, 12, 0);
    mainGroup.add(sheave);

    // 3. 钢丝绳 (Rope) - 增加直径
    const generateRope = (ext: number) => {
        const points = [
            new THREE.Vector3(-6, 12, 0), // 滚筒上方
            new THREE.Vector3(6, 12, 0),  // 天轮
            new THREE.Vector3(6, 12 - ext * 20, 0) // 下拉部分
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 100, 0.3, 12, false);
    };

    let ropeGeo = generateRope(ropeExtension);
    const rope = new THREE.Mesh(ropeGeo, steelMat);
    mainGroup.add(rope);

    // 4. 磁通扫描头 (Scanner Head)
    const scannerGroup = new THREE.Group();
    const headGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ 
        color: 0x0ea5e9, emissive: 0x22d3ee, emissiveIntensity: 1.0 
    }));
    head.rotation.y = Math.PI / 2;
    scannerGroup.add(head);

    // 扫描激光环
    const laserRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.05, 8, 64),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4 })
    );
    laserRing.rotation.y = Math.PI / 2;
    scannerGroup.add(laserRing);

    scannerGroup.position.set(6, 8, 0); 
    scannerRef.current = scannerGroup;
    mainGroup.add(scannerGroup);

    // 5. 断丝标记 (Broken Wire Markers)
    const markers: THREE.Mesh[] = [];
    defects.forEach(d => {
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), defectMat);
        marker.position.set(6, 12 - (d.position % 20), 0.4); 
        mainGroup.add(marker);
        markers.push(marker);
    });

    // 6. 地面网格
    const grid = new THREE.GridHelper(100, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -5;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      drum.rotation.x += 0.02;

      if (scannerRef.current && isScanning) {
          const s = 1 + Math.sin(time * 15) * 0.1;
          scannerRef.current.children[1].scale.setScalar(s);
          scannerRef.current.position.y = 8 + Math.sin(time * 2) * 4;
      }

      markers.forEach((m, i) => {
          m.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.2);
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 1.0 + Math.sin(time * 8) * 1.0;
      });

      if (viewMode === 'xray') {
          steelMat.wireframe = true;
          steelMat.opacity = 0.2;
          steelMat.transparent = true;
      } else {
          steelMat.wireframe = false;
          steelMat.opacity = 1.0;
          steelMat.transparent = false;
      }

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
  }, [ropeExtension, defects, isScanning, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CylinderLinerAnimatables, LinerViewMode } from './three-types';

interface ThreeSceneProps {
  wearSeverity?: number; // 0-1
  scanningActive?: boolean;
  viewMode?: LinerViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearSeverity = 0.3,
  scanningActive = true,
  viewMode = 'thickness'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 精密工业照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(5, 10, 7);
    scene.add(topLight);

    const innerLight = new THREE.PointLight(0x0ea5e9, 5, 20);
    innerLight.position.set(0, 0, 0);
    scene.add(innerLight);

    const redRim = new THREE.PointLight(0xef4444, 10 * wearSeverity, 30);
    redRim.position.set(0, 4, 0); // 聚焦在上死点
    scene.add(redRim);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CylinderLinerAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 气缸套主体 (Cylinder Liner) ---
    // 使用剖面效果展示
    const linerGeo = new THREE.CylinderGeometry(3, 3, 10, 64, 1, true, 0, Math.PI * 1.6);
    const linerMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        side: THREE.DoubleSide,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const liner = new THREE.Mesh(linerGeo, linerMat);
    group.add(liner);
    animatables.linerBody = liner;
    disposables.push(linerGeo, linerMat);

    // --- 2. 上死点磨损区 (TDC Wear Zone) ---
    const tdcGeo = new THREE.TorusGeometry(2.98, 0.1, 16, 100, Math.PI * 1.6);
    tdcGeo.rotateX(Math.PI / 2);
    const tdcMat = new THREE.MeshStandardMaterial({ 
        color: 0xef4444, 
        emissive: 0xff0000, 
        emissiveIntensity: wearSeverity * 2,
        transparent: true,
        opacity: 0.6
    });
    const tdcRing = new THREE.Mesh(tdcGeo, tdcMat);
    tdcRing.position.y = 4.2; // 上死点位置
    group.add(tdcRing);
    disposables.push(tdcGeo, tdcMat);

    // --- 3. 激光扫描器 (Laser Scanner) ---
    const scannerGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(3.05, 0.03, 16, 100, Math.PI * 1.6);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scannerGroup.add(ring);
    
    // 扫描面射线
    const scanPlaneGeo = new THREE.CircleGeometry(3, 32, 0, Math.PI * 1.6);
    scanPlaneGeo.rotateX(Math.PI / 2);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scannerGroup.add(plane);

    group.add(scannerGroup);
    animatables.laserScanner = scannerGroup;
    disposables.push(ringGeo, ringMat, scanPlaneGeo, scanPlaneMat);

    // --- 4. 扫气口 (Scavenging Ports) ---
    const portGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    for(let i=0; i<8; i++) {
        const port = new THREE.Mesh(portGeo, portMat);
        const angle = (i / 10) * Math.PI * 2;
        port.position.set(Math.cos(angle) * 3, -3, Math.sin(angle) * 3);
        port.rotation.y = -angle;
        group.add(port);
    }
    disposables.push(portGeo, portMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 激光上下扫描
      if (scanningActive && animatables.laserScanner) {
          animatables.laserScanner.position.y = Math.sin(time * 1.5) * 4.5;
          ringMat.opacity = 0.5 + Math.sin(time * 10) * 0.3;
      }

      // 磨损区微弱搏动
      tdcRing.scale.setScalar(1 + Math.sin(time * 5) * 0.01 * wearSeverity);

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
  }, [wearSeverity, scanningActive, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

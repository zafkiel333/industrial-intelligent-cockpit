
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SteeringJamAnimatables } from './three-types';

interface ThreeSceneProps {
  targetAngle?: number; // -35 to +35 degrees
  jammingRisk?: number; // 0-1
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  targetAngle = 0, 
  jammingRisk = 0.2,
  isScanning = false 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境光照 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 15, 50);
    pointLight.position.set(-10, 5, 5);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SteeringJamAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 舵柄组件 (Tiller) ---
    const tillerGroup = new THREE.Group();
    const tillerGeo = new THREE.BoxGeometry(6, 0.6, 1.5);
    const tillerMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: jammingRisk > 0.6 ? 0xff4400 : 0x000000,
        emissiveIntensity: 0.5
    });
    const tiller = new THREE.Mesh(tillerGeo, tillerMat);
    tiller.position.x = 2.5;
    tillerGroup.add(tiller);
    group.add(tillerGroup);
    animatables.tillerGroup = tillerGroup;

    // --- 2. 液压缸组件 (Hydraulic Rams) ---
    const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.6 });
    
    const leftCyl = new THREE.Mesh(cylGeo, cylMat);
    leftCyl.position.set(-4, 0, 1.2);
    group.add(leftCyl);
    animatables.cylinderLeft = leftCyl;

    const rightCyl = new THREE.Mesh(cylGeo, cylMat);
    rightCyl.position.set(-4, 0, -1.2);
    group.add(rightCyl);
    animatables.cylinderRight = rightCyl;

    // --- 3. 伸缩杆 (Pistons) ---
    const pistonGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 32);
    pistonGeo.rotateZ(Math.PI / 2);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1, roughness: 0.1 });
    
    const pL = new THREE.Mesh(pistonGeo, pistonMat);
    pL.position.x = -2;
    pL.position.z = 1.2;
    group.add(pL);
    animatables.ramLeft = pL;

    const pR = new THREE.Mesh(pistonGeo, pistonMat);
    pR.position.x = -2;
    pR.position.z = -1.2;
    group.add(pR);
    animatables.ramRight = pR;

    // --- 4. 卡滞火花点云 (Jamming Sparks) ---
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.1, transparent: true, opacity: 0 });
    const sparks = new THREE.Points(pGeo, pMat);
    group.add(sparks);
    animatables.jammingSparkles = sparks;

    // --- 5. 扫描光环 ---
    const ringGeo = new THREE.TorusGeometry(8, 0.05, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0 });
    const scanner = new THREE.Mesh(ringGeo, ringMat);
    scene.add(scanner);
    animatables.scanningRing = scanner;

    let animationId: number;
    let currentAngle = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 角度随动与卡滞震颤模拟
      const angleRad = (targetAngle * Math.PI) / 180;
      const jitter = jammingRisk > 0.5 ? Math.sin(time * 60) * 0.005 * jammingRisk : 0;
      currentAngle = THREE.MathUtils.lerp(currentAngle, angleRad, 0.05);
      
      if (animatables.tillerGroup) {
          animatables.tillerGroup.rotation.y = -currentAngle + jitter;
      }

      // 油缸活塞联动
      const travel = Math.sin(currentAngle) * 3;
      if (animatables.ramLeft) animatables.ramLeft.position.x = -2 + travel;
      if (animatables.ramRight) animatables.ramRight.position.x = -2 - travel;

      // 扫描动画
      if (isScanning && animatables.scanningRing) {
          animatables.scanningRing.position.y = Math.sin(time * 2) * 5;
          (animatables.scanningRing.material as THREE.MeshBasicMaterial).opacity = 0.4;
      } else if (animatables.scanningRing) {
          (animatables.scanningRing.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      // 卡滞特效
      if (jammingRisk > 0.7 && animatables.jammingSparkles) {
          const mat = animatables.jammingSparkles.material as THREE.PointsMaterial;
          mat.opacity = 0.5 + Math.sin(time * 20) * 0.5;
          const pos = animatables.jammingSparkles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3] = (Math.random() - 0.5) * 2;
              pos[i*3+1] = (Math.random() - 0.5) * 2;
              pos[i*3+2] = (Math.random() - 0.5) * 2;
          }
          animatables.jammingSparkles.geometry.attributes.position.needsUpdate = true;
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
  }, [targetAngle, jammingRisk, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

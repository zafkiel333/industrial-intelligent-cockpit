
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SteeringAnimatables } from './three-types';

interface ThreeSceneProps {
  rudderAngle?: number; // -35 to +35 degrees
  leakageActive?: boolean;
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rudderAngle = 0, 
  leakageActive = false,
  isScanning = false 
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

    // --- 光影环境 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    blueLight.position.set(-10, 5, 5);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SteeringAnimatables = { hydraulicLines: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 舵柄与舵轴 (Tiller & Shaft) ---
    const tillerGroup = new THREE.Group();
    const tillerGeo = new THREE.BoxGeometry(6, 0.4, 1.2);
    const tillerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const tiller = new THREE.Mesh(tillerGeo, tillerMat);
    tiller.position.x = 3;
    tillerGroup.add(tiller);
    group.add(tillerGroup);
    animatables.tillerArm = tillerGroup;

    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = -2;
    group.add(shaft);

    // --- 2. 左右油缸 (Hydraulic Ram Cylinders) ---
    const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 5, 32);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.7 });
    
    const leftCyl = new THREE.Mesh(cylGeo, cylMat);
    leftCyl.position.set(-4, 0, 1);
    group.add(leftCyl);
    animatables.leftCylinder = leftCyl;

    const rightCyl = new THREE.Mesh(cylGeo, cylMat);
    rightCyl.position.set(-4, 0, -1);
    group.add(rightCyl);
    animatables.rightCylinder = rightCyl;

    // --- 3. 泄漏粒子 (Leakage Particles) ---
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = -4 + (Math.random() - 0.5) * 2;
        pPos[i*3+1] = (Math.random() - 0.5) * 0.5;
        pPos[i*3+2] = 1 + (Math.random() - 0.5) * 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.05, transparent: true, opacity: 0 });
    const leakParticles = new THREE.Points(pGeo, pMat);
    group.add(leakParticles);
    animatables.flowParticles = leakParticles;

    // --- 4. 扫描面 (Scanner) ---
    const scanGeo = new THREE.PlaneGeometry(10, 10);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    scene.add(scanner);
    animatables.scanningGlow = scanner;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 舵柄旋转随动
      const targetRad = (rudderAngle * Math.PI) / 180;
      if (animatables.tillerArm) {
          animatables.tillerArm.rotation.y = THREE.MathUtils.lerp(animatables.tillerArm.rotation.y, -targetRad, 0.05);
      }

      // 扫描动效
      if (animatables.scanningGlow) {
          if (isScanning) {
              animatables.scanningGlow.position.y = Math.sin(time * 3) * 4;
              (animatables.scanningGlow.material as THREE.MeshBasicMaterial).opacity = 0.2;
          } else {
              (animatables.scanningGlow.material as THREE.MeshBasicMaterial).opacity = 0;
          }
      }

      // 泄漏模拟
      if (animatables.flowParticles) {
          const mat = animatables.flowParticles.material as THREE.PointsMaterial;
          if (leakageActive) {
              mat.opacity = 0.6 + Math.sin(time * 10) * 0.4;
              const pos = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  pos[i*3] -= 0.05; // 粒子喷射
                  if (pos[i*3] < -6) pos[i*3] = -4;
              }
              animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
          } else {
              mat.opacity = 0;
          }
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
  }, [rudderAngle, leakageActive, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LubeRulAnimatables } from './three-types';

interface ThreeSceneProps {
  wearSeverity?: number; // 0-1
  isAnalyzing?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearSeverity = 0.25, 
  isAnalyzing = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 精密实验室光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const fluidLight = new THREE.PointLight(0x0ea5e9, 15, 30);
    fluidLight.position.set(-5, 2, 5);
    scene.add(fluidLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: LubeRulAnimatables = { wearHotspots: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 螺杆泵外壳 (半透明/线框) ---
    const housingGeo = new THREE.CylinderGeometry(2, 2.2, 8, 32, 1, true, 0, Math.PI * 1.6);
    const housingMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    group.add(housing);
    disposables.push(housingGeo, housingMat);

    // --- 2. 主螺杆 (Screw Rotor) ---
    const rotorGroup = new THREE.Group();
    const rotorGeo = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 16, 2, 8);
    const rotorMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 1, 
        roughness: 0.1,
        emissive: 0xff0000,
        emissiveIntensity: wearSeverity > 0.6 ? (wearSeverity - 0.6) * 3 : 0
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.scale.set(1, 4, 1);
    rotorGroup.add(rotor);
    group.add(rotorGroup);
    animatables.screwPump = rotorGroup;
    disposables.push(rotorGeo, rotorMat);

    // --- 3. 磨损热点标记 (Wear Hotspots) ---
    const spotGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    for(let i=0; i<3; i++) {
        const spot = new THREE.Mesh(spotGeo, spotMat);
        spot.position.set(Math.random()-0.5, (Math.random()-0.5)*5, 1);
        animatables.wearHotspots?.add(spot);
    }
    group.add(animatables.wearHotspots!);
    disposables.push(spotGeo, spotMat);

    // --- 4. 动态油液粒子流 (Oil Flow) ---
    const pCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 1.5;
        pPos[i*3+1] = (Math.random() - 0.5) * 8;
        pPos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.04, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.oilFlowParticles = particles;
    disposables.push(pGeo, pMat);

    // --- 5. 激光扫描切面 ---
    const scanGeo = new THREE.BoxGeometry(5, 0.05, 5);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.scanningLaser = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 螺杆旋转
      if (animatables.screwPump) {
          animatables.screwPump.rotation.y += 0.08;
          // 磨损引起的微小晃动
          animatables.screwPump.position.x = Math.sin(time * 20) * (wearSeverity * 0.03);
      }

      // 粒子流动
      if (animatables.oilFlowParticles) {
          const positions = animatables.oilFlowParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] += 0.1; // 上升流
              if (positions[i*3+1] > 4) positions[i*3+1] = -4;
          }
          animatables.oilFlowParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 扫描移动
      if (isAnalyzing && animatables.scanningLaser) {
          animatables.scanningLaser.position.y = Math.sin(time * 1.5) * 4;
          animatables.scanningLaser.visible = true;
      }

      // 热点闪烁
      if (animatables.wearHotspots) {
          animatables.wearHotspots.children.forEach((spot: any) => {
              spot.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
              spot.visible = wearSeverity > 0.4;
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
  }, [wearSeverity, isAnalyzing]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
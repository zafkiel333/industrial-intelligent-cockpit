
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ThickenerAnimatables, DriveViewMode } from './three-types';

interface ThreeSceneProps {
  torqueLevel?: number; // 0-1
  healthStatus?: number; // 0-1
  viewMode?: DriveViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  torqueLevel = 0.4, 
  healthStatus = 0.9,
  viewMode = 'solid'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===thickener-drive useEffect===");

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0xf97316, 15, 30);
    accentLight.position.set(-5, 5, 5);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ThickenerAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 驱动底座 (Bridge Section) ---
    const baseGeo = new THREE.BoxGeometry(8, 0.5, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -3;
    group.add(base);
    disposables.push(baseGeo, baseMat);

    // --- 2. 减速箱体 (Planetary Gearbox) ---
    const gearboxGeo = new THREE.CylinderGeometry(2.5, 3, 4, 32);
    const gearboxMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        transparent: viewMode !== 'solid',
        opacity: viewMode === 'solid' ? 1.0 : 0.2
    });
    const gearbox = new THREE.Mesh(gearboxGeo, gearboxMat);
    group.add(gearbox);
    animatables.gearboxShell = gearbox;
    disposables.push(gearboxGeo, gearboxMat);

    // --- 3. 行星齿轮组 (Planetary Gear Set) ---
    const gearGroup = new THREE.Group();
    const sunGearGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16);
    const planetGearGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
    const gearMat = new THREE.MeshStandardMaterial({ 
        color: healthStatus < 0.5 ? 0xef4444 : 0x94a3b8,
        metalness: 1.0,
        emissive: healthStatus < 0.5 ? 0xff0000 : 0x000000,
        emissiveIntensity: 0.5
    });

    const sunGear = new THREE.Mesh(sunGearGeo, gearMat);
    gearGroup.add(sunGear);

    for(let i=0; i<3; i++) {
        const planet = new THREE.Mesh(planetGearGeo, gearMat);
        const angle = (i / 3) * Math.PI * 2;
        planet.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
        gearGroup.add(planet);
    }
    gearGroup.position.y = 0;
    gearGroup.visible = viewMode !== 'solid';
    group.add(gearGroup);
    animatables.planetaryGears = gearGroup;
    disposables.push(sunGearGeo, planetGearGeo, gearMat);

    // --- 4. 驱动马达 (Motor) ---
    const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 3.2;
    group.add(motor);
    animatables.motorBody = motor;
    disposables.push(motorGeo, motorMat);

    // --- 5. 扭矩场粒子 (Torque Stress Field) ---
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 2.6 + Math.random() * 0.5;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 4.5;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xf97316, 
        size: 0.04, 
        transparent: true, 
        opacity: viewMode === 'stress' ? torqueLevel : 0 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.stressParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speed = 0.01 * (1 + torqueLevel);

      // 齿轮啮合动画
      if (animatables.planetaryGears) {
          animatables.planetaryGears.rotation.y += speed;
          animatables.planetaryGears.children.forEach((child, i) => {
              if (i > 0) child.rotation.y -= speed * 2.5; // 自转
          });
      }

      // 扭矩粒子波动
      if (animatables.stressParticles && viewMode === 'stress') {
          const opacity = 0.2 + Math.sin(time * 5) * 0.2;
          (animatables.stressParticles.material as THREE.PointsMaterial).opacity = opacity * torqueLevel;
          animatables.stressParticles.rotation.y += speed * 2;
      }

      // 异常抖动模拟
      if (healthStatus < 0.6) {
          group.position.x = Math.sin(time * 60) * (0.02 * (1 - healthStatus));
          group.position.z = Math.cos(time * 60) * (0.02 * (1 - healthStatus));
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
  }, [torqueLevel, healthStatus, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

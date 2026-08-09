
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CrankshaftAnimatables, CrankViewMode } from './three-types';

interface ThreeSceneProps {
  rpm?: number;
  deflectionLevel?: number; // 0-1 
  viewMode?: CrankViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rpm = 85,
  deflectionLevel = 0.2,
  viewMode = 'alignment'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ship-crankshaft useEffect===");

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(18, 12, 22);

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

    // --- 高动态光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const topLight = new THREE.DirectionalLight(0xffffff, 2);
    topLight.position.set(5, 20, 10);
    scene.add(topLight);

    const accentLight = new THREE.PointLight(0x0ea5e9, 20, 100);
    accentLight.position.set(-15, 10, 5);
    scene.add(accentLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: CrankshaftAnimatables = { bearings: [], deflectionGlows: [] };
    const disposables: any[] = [];

    // --- 1. 曲轴构造 (Crankshaft Structure) ---
    const crankshaft = new THREE.Group();
    const throwCount = 6;
    const spacing = 2.5;
    const journalRadius = 0.6;
    const pinRadius = 0.55;
    
    const journalGeo = new THREE.CylinderGeometry(journalRadius, journalRadius, spacing, 32);
    journalGeo.rotateZ(Math.PI / 2);
    const metalMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 1.0, 
        roughness: 0.1,
        transparent: viewMode === 'lubrication',
        opacity: viewMode === 'lubrication' ? 0.4 : 1.0
    });

    for (let i = 0; i < throwCount; i++) {
        const xOffset = (i - (throwCount - 1) / 2) * spacing;
        
        // Main Journal
        const journal = new THREE.Mesh(journalGeo, metalMat);
        journal.position.x = xOffset;
        crankshaft.add(journal);

        // Crank Webs & Pins (简化表示)
        const webGroup = new THREE.Group();
        const webGeo = new THREE.BoxGeometry(0.3, 2.5, 1.2);
        const web = new THREE.Mesh(webGeo, metalMat);
        webGroup.add(web);
        
        const pinGeo = new THREE.CylinderGeometry(pinRadius, pinRadius, 0.8, 32);
        pinGeo.rotateZ(Math.PI / 2);
        const pin = new THREE.Mesh(pinGeo, metalMat);
        pin.position.y = 1.0;
        webGroup.add(pin);
        
        webGroup.position.x = xOffset + spacing / 2;
        webGroup.rotation.x = (i * Math.PI * 2) / throwCount; // 均匀相位
        crankshaft.add(webGroup);

        // 轴承座视觉化
        const bearingGeo = new THREE.TorusGeometry(journalRadius + 0.1, 0.15, 16, 32);
        bearingGeo.rotateY(Math.PI / 2);
        const bearingMat = new THREE.MeshStandardMaterial({ 
            color: (i === 3 && deflectionLevel > 0.5) ? 0xef4444 : 0x1e293b,
            emissive: (i === 3 && deflectionLevel > 0.5) ? 0xff0000 : 0x000000,
            emissiveIntensity: 0.5
        });
        const bearing = new THREE.Mesh(bearingGeo, bearingMat);
        bearing.position.x = xOffset;
        mainGroup.add(bearing);
        animatables.bearings?.push(bearing);

        disposables.push(journalGeo, webGeo, pinGeo, bearingGeo, bearingMat);
    }
    mainGroup.add(crankshaft);
    animatables.crankshaftGroup = crankshaft;
    disposables.push(metalMat);

    // --- 2. 油膜粒子 (Oil Film) ---
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = journalRadius + 0.05;
        pPos[i*3] = (Math.random() - 0.5) * spacing * throwCount;
        pPos[i*3+1] = Math.sin(angle) * r;
        pPos[i*3+2] = Math.cos(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x10b981, 
        size: 0.04, 
        transparent: true, 
        opacity: viewMode === 'lubrication' ? 0.8 : 0 
    });
    const oilFilm = new THREE.Points(pGeo, pMat);
    mainGroup.add(oilFilm);
    animatables.oilFilmPoints = oilFilm;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speed = (rpm / 60) * 0.1;

      // 曲轴自转
      if (animatables.crankshaftGroup) {
          animatables.crankshaftGroup.rotation.x += speed;
          
          // 模拟臂距差导致的微晃动
          if (deflectionLevel > 0.3) {
              animatables.crankshaftGroup.position.y = Math.sin(time * 10) * (deflectionLevel * 0.05);
          }
      }

      // 轴承状态反馈
      animatables.bearings?.forEach((b, i) => {
          if (i === 3 && deflectionLevel > 0.5) {
              b.scale.setScalar(1 + Math.sin(time * 15) * 0.05);
          }
      });

      // 油膜流动
      if (viewMode === 'lubrication' && animatables.oilFilmPoints) {
          animatables.oilFilmPoints.rotation.x += speed * 1.2;
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
  }, [rpm, deflectionLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

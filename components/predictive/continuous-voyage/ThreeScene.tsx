
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FatigueAnimatables, FatigueViewMode } from './three-types';

interface ThreeSceneProps {
  fatigueLevel: number; // 0-1 (Miner's Rule Damage Sum)
  voyageTime: number; // Simulated hours
  stressAmplitude: number; // 0-1
  viewMode?: FatigueViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  fatigueLevel = 0.0,
  voyageTime = 0,
  stressAmplitude = 0.5,
  viewMode = 'cumulative-damage'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===continuous-voyage useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(30, 15, 30);
    camera.lookAt(0, 0, 0);

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

    // --- 光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const moonLight = new THREE.DirectionalLight(0xa5bcff, 1.0);
    moonLight.position.set(-20, 50, -20);
    scene.add(moonLight);

    const fatigueLight = new THREE.PointLight(0x8b5cf6, 0, 40); // Purple glow for fatigue
    fatigueLight.position.set(0, 5, 0);
    scene.add(fatigueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FatigueAnimatables = { stressHotspots: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 无限海面网格 (Infinite Ocean Grid) ---
    const seaGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshBasicMaterial({ 
        color: 0x0f172a, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    scene.add(sea);
    animatables.oceanGrid = sea;
    disposables.push(seaGeo, seaMat);

    // --- 2. 船舶结构线框 (Ship Structure Wireframe) ---
    const shipGroup = new THREE.Group();
    group.add(shipGroup);
    animatables.shipHull = shipGroup;

    // 船体轮廓
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0,0);
    hullShape.lineTo(40, 0);
    hullShape.lineTo(45, 6);
    hullShape.lineTo(40, 8);
    hullShape.lineTo(0, 8);
    hullShape.lineTo(-3, 6);
    hullShape.lineTo(0, 0);
    
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 8, bevelEnabled: false });
    hullGeo.translate(-20, 0, -4);
    
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0x334155, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
    });
    const hull = new THREE.Mesh(hullGeo, wireMat);
    shipGroup.add(hull);
    disposables.push(hullGeo, wireMat);

    // --- 3. 关键疲劳部件 (Keel & Engine Bed) ---
    // 龙骨 - 承受总纵弯曲
    const keelGeo = new THREE.BoxGeometry(35, 0.5, 0.5);
    const keelMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b,
        emissive: 0x8b5cf6, // Fatigue purple
        emissiveIntensity: 0
    });
    const keel = new THREE.Mesh(keelGeo, keelMat);
    keel.position.set(0, 0.5, 0);
    shipGroup.add(keel);
    animatables.keelBeam = keel;
    disposables.push(keelGeo, keelMat);

    // 主机基座
    const mountGeo = new THREE.BoxGeometry(8, 1, 4);
    const mountMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569,
        emissive: 0xff0055, // Critical red
        emissiveIntensity: 0
    });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.position.set(-5, 1.5, 0);
    shipGroup.add(mount);
    disposables.push(mountGeo, mountMat);

    // --- 4. 疲劳热点 (Fatigue Hotspots) ---
    shipGroup.add(animatables.stressHotspots!);
    const spotGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0 });
    
    // Create random hotspots along the structure
    for(let i=0; i<8; i++) {
        const spot = new THREE.Mesh(spotGeo, spotMat.clone());
        spot.position.set(
            (Math.random() - 0.5) * 30, // along length
            Math.random() * 5,          // height
            (Math.random() - 0.5) * 6   // width
        );
        animatables.stressHotspots!.add(spot);
    }
    disposables.push(spotGeo, spotMat);

    // --- 5. 尾迹粒子 (Wake Trail) ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = -20 - Math.random() * 20; // Behind ship
        pPos[i*3+1] = 0;
        pPos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x475569, size: 0.2, transparent: true, opacity: 0.5 });
    const wake = new THREE.Points(pGeo, pMat);
    group.add(wake);
    animatables.wakeTrail = wake;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 海面后退模拟航行
      if (animatables.oceanGrid) {
          animatables.oceanGrid.position.x = (time * 5) % 10;
      }
      if (animatables.wakeTrail) {
          const pos = animatables.wakeTrail.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3] -= 0.5; // Move back
              if (pos[i*3] < -50) {
                  pos[i*3] = -20;
                  pos[i*3+2] = (Math.random() - 0.5) * 8;
              }
          }
          animatables.wakeTrail.geometry.attributes.position.needsUpdate = true;
      }

      // 船体呼吸 (Cyclic Stress)
      if (animatables.shipHull) {
          // 模拟船体在中拱/中垂中的弹性变形
          const bending = Math.sin(time * 2) * 0.005 * stressAmplitude;
          animatables.shipHull.scale.y = 1 + bending;
          animatables.shipHull.position.y = Math.sin(time) * 0.5;
          animatables.shipHull.rotation.z = Math.sin(time * 0.5) * 0.02; // Pitch
          animatables.shipHull.rotation.x = Math.cos(time * 0.3) * 0.03; // Roll
      }

      // 疲劳热点显现
      if (animatables.stressHotspots) {
          animatables.stressHotspots.children.forEach((spot: any) => {
              // 随机闪烁频率，强度受疲劳度控制
              const pulse = Math.sin(time * 5 + spot.position.x) * 0.5 + 0.5;
              spot.material.opacity = pulse * fatigueLevel;
              const scale = 1 + pulse * 0.5;
              spot.scale.set(scale, scale, scale);
          });
      }

      // 关键部件高亮
      if (keel) {
          keel.material.emissiveIntensity = fatigueLevel * 0.5 + (Math.sin(time) * 0.1);
      }
      if (mount) {
          mount.material.emissiveIntensity = fatigueLevel > 0.5 ? (fatigueLevel - 0.5) * 2 : 0;
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
  }, [fatigueLevel, voyageTime, stressAmplitude, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

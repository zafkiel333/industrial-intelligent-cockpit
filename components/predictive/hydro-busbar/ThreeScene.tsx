import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BusbarSceneProps } from './three-types';

export const BusbarScene: React.FC<BusbarSceneProps> = ({ 
  phaseTemps, 
  loadCurrent,
  hotspotLocation,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const busbarsRef = useRef<THREE.Mesh[]>([]);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const heatParticlesRef = useRef<THREE.Points | null>(null);

  // 2026.03.02 - Bug修复：创建ref存储实时props值，避免依赖项变化触发useEffect重渲染
  // Bug情况：3D模型频繁闪烁，useEffect反复执行导致场景被重复创建/销毁
  // Bug原因：useEffect依赖项（phaseTemps/loadCurrent/hotspotLocation/viewMode）为引用类型/频繁更新的基本类型，
  // 每次变化都会触发useEffect重新执行，重建Three.js场景和渲染逻辑，导致视觉闪烁
  const phaseTempsRef = useRef(phaseTemps);
  const loadCurrentRef = useRef(loadCurrent);
  const hotspotLocationRef = useRef(hotspotLocation);
  const viewModeRef = useRef(viewMode);

  // 同步最新props值到ref，避免闭包陷阱且不触发场景重建
  useEffect(() => {
    phaseTempsRef.current = phaseTemps;
    loadCurrentRef.current = loadCurrent;
    hotspotLocationRef.current = hotspotLocation;
    viewModeRef.current = viewMode;
  }, [phaseTemps, loadCurrent, hotspotLocation, viewMode]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-busbar useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark environment for heat glow visibility（保留雾效，仅调整光线）
    scene.fog = new THREE.FogExp2(0x050202, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // 2026.03.02 - 调整曝光度提亮整体画面（不修改材质/模型颜色）
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.8; // 原1.2 → 提升至1.8，增强整体亮度

    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    // 1. 环境光：提升强度，照亮整体暗部（原0.2 → 0.5）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 2. 主方向光：提升强度+调整位置，增强主要照明（原强度1 → 2）
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(8, 12, 8); // 原(5,10,5) → 稍调整位置，减少阴影死角
    mainLight.castShadow = true; // 开启阴影（可选，增强立体感）
    scene.add(mainLight);

    // 3. 新增补光：辅助照亮主光源的阴影区域，避免局部过暗
    const fillLight = new THREE.DirectionalLight(0xf8f8f8, 1.0);
    fillLight.position.set(-6, 8, -6); // 与主光源相反方向
    scene.add(fillLight);

    // 4. 热光源：保留原有逻辑，仅调整默认基础强度（原0 → 0.5，提升基础热区亮度）
    const heatLight = new THREE.PointLight(0xff4500, 0.5, 20);
    heatLight.position.set(0, 2, 0);
    scene.add(heatLight);

    // --- Materials ---（完全保留原有材质，未做任何修改）
    const copperMat = new THREE.MeshStandardMaterial({ 
      color: 0xb87333, metalness: 0.8, roughness: 0.3 
    });
    
    const insulationMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155, metalness: 0.1, roughness: 0.8, clearcoat: 0.5
    });

    const thermalMat = new THREE.MeshBasicMaterial({
        color: 0x0000ff, // Base cool color
    });

    const boltMat = new THREE.MeshStandardMaterial({
        color: 0x888888, metalness: 0.9, roughness: 0.2
    });

    // --- Geometry Construction ---（完全保留原有模型构建逻辑）
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    busbarsRef.current = [];
    jointsRef.current = [];

    // Create 3 Phases
    [-2, 0, 2].forEach((x, i) => {
        const phaseGroup = new THREE.Group();
        phaseGroup.position.set(x, 0, 0);
        mainGroup.add(phaseGroup);

        // 1. Busbar Segments (Rectangular copper bar)
        const barGeo = new THREE.BoxGeometry(0.5, 0.8, 8);
        const bar = new THREE.Mesh(barGeo, copperMat.clone());
        bar.userData = { phaseIndex: i, type: 'bar' };
        phaseGroup.add(bar);
        busbarsRef.current.push(bar);

        // 2. Joint (The connection point in the middle)
        const plateGeo = new THREE.BoxGeometry(0.8, 1.0, 1.2);
        const joint = new THREE.Mesh(plateGeo, copperMat.clone());
        joint.userData = { phaseIndex: i, type: 'joint' };
        phaseGroup.add(joint);
        jointsRef.current.push(joint);

        // 3. Bolts
        const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
        boltGeo.rotateZ(Math.PI/2);
        for(let b=0; b<4; b++) {
            const bolt = new THREE.Mesh(boltGeo, boltMat);
            const bx = (b%2===0 ? -0.2 : 0.2);
            const bz = (b<2 ? -0.3 : 0.3);
            bolt.position.set(0, 0, bz);
            bolt.position.y = (b%2===0 ? 0.2 : -0.2); 
            joint.add(bolt);
        }

        // 4. Support Insulators
        const supportGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 32);
        [-3, 3].forEach(z => {
            const support = new THREE.Mesh(supportGeo, insulationMat);
            support.position.set(0, -1.2, z);
            phaseGroup.add(support);
        });
    });

    // Heat Particles (Rising from hot joints)
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; // Hide initially
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xff4500,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    heatParticlesRef.current = particles;
    scene.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      const currentPhaseTemps = phaseTempsRef.current;
      const currentHotspotLocation = hotspotLocationRef.current;
      const currentViewMode = viewModeRef.current;

      // 1. Material & Temperature Update（完全保留原有逻辑，未修改材质/颜色）
      [...busbarsRef.current, ...jointsRef.current].forEach(mesh => {
          const { phaseIndex, type } = mesh.userData;
          const temp = currentPhaseTemps[phaseIndex];
          const isHotspot = (currentHotspotLocation === phaseIndex + 1) && (type === 'joint');
          
          let effTemp = temp;
          if (type === 'joint') effTemp += 5; 
          if (isHotspot) effTemp += 30;

          const tNorm = Math.min(1, Math.max(0, (effTemp - 40) / 100));
          const heatColor = new THREE.Color().setHSL(0.66 - tNorm * 0.66, 1.0, 0.5 + tNorm*0.2);

          if (currentViewMode === 'thermal') {
              (mesh.material as THREE.MeshStandardMaterial).color.copy(heatColor);
              (mesh.material as THREE.MeshStandardMaterial).emissive.copy(heatColor);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
              (mesh.material as THREE.MeshStandardMaterial).metalness = 0.1;
          } else {
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xb87333);
              (mesh.material as THREE.MeshStandardMaterial).metalness = 0.8;
              
              if (effTemp > 80) {
                  (mesh.material as THREE.MeshStandardMaterial).emissive.copy(heatColor);
                  (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = (effTemp - 80) / 50;
              } else {
                  (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                  (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
              }
          }
      });

      // 2. Particle System (Heat Shimmer)（完全保留原有逻辑）
      if (heatParticlesRef.current) {
          const positions = heatParticlesRef.current.geometry.attributes.position.array as Float32Array;
          let pIdx = 0;
          
          if (currentHotspotLocation > 0) {
              const phaseX = (currentHotspotLocation - 2) * 2;
              for(let i=0; i<pCount; i++) {
                  if (positions[i*3+1] > 4 || positions[i*3+1] < -10) {
                      positions[i*3] = phaseX + (Math.random()-0.5)*0.8;
                      positions[i*3+1] = 0.5 + (Math.random()*0.5);
                      positions[i*3+2] = (Math.random()-0.5)*0.8;
                  }
                  
                  positions[i*3+1] += 0.05 + Math.random()*0.02;
                  positions[i*3] += Math.sin(time + i)*0.01;
                  
                  if (currentHotspotLocation === 0) positions[i*3+1] = -100;
              }
              heatParticlesRef.current.geometry.attributes.position.needsUpdate = true;
              
              const hotTemp = currentPhaseTemps[currentHotspotLocation-1] + 30;
              const tNorm = Math.min(1, Math.max(0, (hotTemp - 40) / 100));
              const heatColor = new THREE.Color().setHSL(0.1, 1.0, 0.5);
              (heatParticlesRef.current.material as THREE.PointsMaterial).color.copy(heatColor);
              (heatParticlesRef.current.material as THREE.PointsMaterial).opacity = tNorm * 0.5;
          } else {
               for(let i=0; i<pCount; i++) positions[i*3+1] = -100;
               heatParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mountRef]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
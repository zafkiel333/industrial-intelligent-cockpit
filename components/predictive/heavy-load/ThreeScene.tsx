
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HeavyLoadAnimatables, LoadViewMode } from './three-types';

interface ThreeSceneProps {
  loadPercentage?: number; // 0-120% (1.2 means overload)
  seaState?: number; // 0-10 (Beaufort scale simulation intensity)
  viewMode?: LoadViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  loadPercentage = 0.9,
  seaState = 5,
  viewMode = 'structural-stress'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020409);
    scene.fog = new THREE.FogExp2(0x020409, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(25, 12, 35);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 60;

    // --- 动态光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(-10, 20, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const stressLight = new THREE.PointLight(0xff4400, 0, 30);
    stressLight.position.set(0, 0, 0);
    scene.add(stressLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: HeavyLoadAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 海面 (Dynamic Sea) ---
    const waterGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0c2e4e, 
        roughness: 0.1, 
        metalness: 0.8,
        wireframe: viewMode === 'hydrodynamics',
        transparent: true,
        opacity: 0.8
    });
    const sea = new THREE.Mesh(waterGeo, waterMat);
    scene.add(sea);
    animatables.seaMesh = sea;
    disposables.push(waterGeo, waterMat);

    // --- 2. 货轮 (Container Ship) ---
    const shipGroup = new THREE.Group();
    group.add(shipGroup);
    animatables.shipGroup = shipGroup;

    // 船体 (Hull)
    const hullLength = 20;
    const hullWidth = 4;
    const hullDepth = 3;
    
    // 简单的船体形状
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 0);
    hullShape.lineTo(hullWidth, 0);
    hullShape.lineTo(hullWidth, hullDepth);
    hullShape.lineTo(0, hullDepth);
    
    const hullGeo = new THREE.BoxGeometry(hullWidth, hullDepth, hullLength);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = hullDepth / 2;
    shipGroup.add(hull);

    // 船首 (Bow)
    const bowGeo = new THREE.ConeGeometry(hullWidth * 0.8, 4, 4);
    bowGeo.rotateX(Math.PI / 2);
    const bow = new THREE.Mesh(bowGeo, hullMat);
    bow.position.set(0, hullDepth / 2, -hullLength / 2 - 2);
    bow.rotation.y = Math.PI / 4;
    shipGroup.add(bow);

    // 船楼 (Superstructure)
    const towerGeo = new THREE.BoxGeometry(hullWidth, 4, 3);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, hullDepth + 2, hullLength / 2 - 2);
    shipGroup.add(tower);

    // 螺旋桨 (Propeller) - 水下
    const propGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.2, 1.5, 0.5);
    const propMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    for(let i=0; i<4; i++) {
        const blade = new THREE.Mesh(bladeGeo, propMat);
        blade.rotation.z = (i * Math.PI) / 2;
        blade.rotation.x = 0.5;
        propGroup.add(blade);
    }
    propGroup.position.set(0, 0, hullLength / 2 + 0.5);
    shipGroup.add(propGroup);
    animatables.propeller = propGroup;

    // --- 3. 集装箱堆垛 (Cargo Load) ---
    const containerGroup = new THREE.Group();
    const contGeo = new THREE.BoxGeometry(0.8, 0.8, 2);
    const colors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981];
    
    // 根据负载百分比生成集装箱
    const rows = 4;
    const cols = 3;
    const layers = Math.ceil(loadPercentage * 5); // Max 5 layers at 100%

    for(let l=0; l<layers; l++) {
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const mat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random()*colors.length)] });
                const cont = new THREE.Mesh(contGeo, mat);
                cont.position.set(
                    (c - 1) * 1.0, 
                    hullDepth + 0.4 + l * 0.8, 
                    (r - 1.5) * 2.2 - 2
                );
                containerGroup.add(cont);
            }
        }
    }
    shipGroup.add(containerGroup);
    animatables.containerStack = containerGroup;

    // --- 4. 应力云图覆盖 (Stress Overlay) ---
    if (viewMode === 'structural-stress') {
        const stressGeo = new THREE.BoxGeometry(hullWidth + 0.1, hullDepth + 0.1, hullLength);
        const stressMat = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.0,
            wireframe: true
        });
        const stressOverlay = new THREE.Mesh(stressGeo, stressMat);
        stressOverlay.position.copy(hull.position);
        shipGroup.add(stressOverlay);
        animatables.stressOverlay = stressOverlay;
    }

    // --- 5. 尾迹粒子 (Wake) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 2;
        pPos[i*3+1] = 0;
        pPos[i*3+2] = hullLength/2 + Math.random() * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    const wake = new THREE.Points(pGeo, pMat);
    shipGroup.add(wake);
    animatables.wakeParticles = wake;

    // --- 6. 废气 (Exhaust) ---
    const eCount = 200;
    const eGeo = new THREE.BufferGeometry();
    const ePos = new Float32Array(eCount * 3);
    eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    const eMat = new THREE.PointsMaterial({ color: 0x333333, size: 0.3, transparent: true, opacity: 0.4 });
    const exhaust = new THREE.Points(eGeo, eMat);
    exhaust.position.set(0, hullDepth + 4, hullLength / 2 - 2);
    shipGroup.add(exhaust);
    animatables.exhaust = exhaust;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 海浪动态
      if (animatables.seaMesh) {
          const positions = animatables.seaMesh.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<positions.length; i+=3) {
              const x = positions[i];
              const y = positions[i+1]; // Z in world space
              // Perlin-ish noise
              positions[i+2] = Math.sin(x * 0.2 + time) * Math.cos(y * 0.1 + time) * (seaState * 0.3);
          }
          animatables.seaMesh.geometry.attributes.position.needsUpdate = true;
      }

      // 船体摇晃 (Pitch & Roll)
      if (animatables.shipGroup) {
          const heave = Math.sin(time * 0.8) * (0.2 + seaState * 0.05);
          const pitch = Math.cos(time * 0.7) * (0.02 + seaState * 0.005);
          const roll = Math.sin(time * 0.5) * (0.03 + seaState * 0.008);
          
          // 吃水深度随负载增加
          const draftOffset = -(loadPercentage * 1.5); 
          
          animatables.shipGroup.position.y = heave + draftOffset;
          animatables.shipGroup.rotation.x = pitch;
          animatables.shipGroup.rotation.z = roll;
      }

      // 螺旋桨旋转
      if (animatables.propeller) {
          animatables.propeller.rotation.z += 0.2 * (1 + loadPercentage * 0.2); // 负载高转速可能更高以维持速度
      }

      // 尾迹喷射
      if (animatables.wakeParticles) {
          const pos = animatables.wakeParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+2] += 0.2; // Move back
              pos[i*3] += (Math.random()-0.5)*0.1; // Spread
              if (pos[i*3+2] > 25) {
                  pos[i*3+2] = 10;
                  pos[i*3] = (Math.random()-0.5)*2;
              }
          }
          animatables.wakeParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 废气排放
      if (animatables.exhaust) {
          const pos = animatables.exhaust.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<eCount; i++) {
              pos[i*3+1] += 0.05; // Up
              pos[i*3+2] += 0.05; // Back
              if (pos[i*3+1] > 5) {
                  pos[i*3] = (Math.random()-0.5)*0.5;
                  pos[i*3+1] = 0;
                  pos[i*3+2] = 0;
              }
          }
          animatables.exhaust.geometry.attributes.position.needsUpdate = true;
          // 重载时黑烟更浓
          (animatables.exhaust.material as THREE.PointsMaterial).opacity = loadPercentage > 0.9 ? 0.6 : 0.2;
          (animatables.exhaust.material as THREE.PointsMaterial).color.setHex(loadPercentage > 1.0 ? 0x000000 : 0x555555);
      }

      // 应力集中显示
      if (viewMode === 'structural-stress' && animatables.stressOverlay) {
          const stress = Math.max(0, (loadPercentage - 0.7) * 3); // 只有高负载才显示
          (animatables.stressOverlay.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 5) * 0.1 * stress;
          
          // 船体中拱/中垂模拟 (Visual bending)
          // ThreeJS basic geometries don't bend easily without bones, so we simulate stress via color/opacity
          stressLight.intensity = stress * 20;
          stressLight.position.set(0, 2, 0); // Midship
      } else {
          stressLight.intensity = 0;
          if (animatables.stressOverlay) (animatables.stressOverlay.material as THREE.MeshBasicMaterial).opacity = 0;
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
  }, [loadPercentage, seaState, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

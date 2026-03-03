
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WeatherAnimatables, WeatherType } from './three-types';

interface ThreeSceneProps {
  weatherType: WeatherType;
  intensity: number; // 0-1
  structureHealth: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  weatherType = 'typhoon',
  intensity = 0.5,
  structureHealth = 0.9
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===extreme-weather useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 动态背景色
    const getBgColor = () => {
        switch(weatherType) {
            case 'typhoon': return 0x0f172a; // Dark Blue
            case 'blizzard': return 0x1e293b; // Grey Blue
            case 'sandstorm': return 0x271a0c; // Brownish
            case 'heatwave': return 0x2a0a0a; // Reddish
            default: return 0x000000;
        }
    };
    scene.background = new THREE.Color(getBgColor());
    scene.fog = new THREE.FogExp2(getBgColor(), 0.02 + intensity * 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 10, 20);

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
    controls.autoRotateSpeed = 0.5;

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    
    // 闪电/阳光光源
    const dynamicLight = new THREE.PointLight(0xffffff, 0, 100);
    dynamicLight.position.set(0, 20, 0);
    scene.add(dynamicLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: WeatherAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 关键设备设施 (Radar Tower / Structure) ---
    const structureGroup = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.CylinderGeometry(4, 5, 2, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    structureGroup.add(base);

    // Tower Lattice (Simplified)
    const towerGeo = new THREE.CylinderGeometry(1, 3, 10, 4, 1, true);
    const towerMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, 
        wireframe: true, 
        emissive: 0xef4444,
        emissiveIntensity: (1 - structureHealth) * 2 // 越不健康越红
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 6;
    structureGroup.add(tower);

    // Top Dome / Sensor
    const domeGeo = new THREE.IcosahedronGeometry(2, 2);
    const domeMat = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.2
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 12;
    structureGroup.add(dome);

    group.add(structureGroup);
    animatables.equipmentCore = structureGroup;
    disposables.push(baseGeo, baseMat, towerGeo, towerMat, domeGeo, domeMat);

    // --- 2. 防护盾/应力场 (Shield) ---
    const shieldGeo = new THREE.SphereGeometry(8, 32, 32);
    const shieldMat = new THREE.MeshBasicMaterial({ 
        color: structureHealth > 0.5 ? 0x0ea5e9 : 0xff0000, 
        transparent: true, 
        opacity: 0.05 + (1-structureHealth) * 0.2, 
        wireframe: true 
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.y = 5;
    group.add(shield);
    animatables.shieldMesh = shield;
    disposables.push(shieldGeo, shieldMat);

    // --- 3. 气象粒子系统 (Particles) ---
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount * 3); // Velocity storage

    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 40;
        pPos[i*3+1] = Math.random() * 30;
        pPos[i*3+2] = (Math.random() - 0.5) * 40;

        pVel[i*3] = 0; // x velocity
        pVel[i*3+1] = 0; // y velocity
        pVel[i*3+2] = 0; // z velocity
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    
    let pColor = 0xffffff;
    if (weatherType === 'sandstorm') pColor = 0xd97706;
    if (weatherType === 'heatwave') pColor = 0xff4400;

    const pMat = new THREE.PointsMaterial({ 
        color: pColor, 
        size: weatherType === 'blizzard' ? 0.3 : 0.15, 
        transparent: true, 
        opacity: 0.6 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.particleSystem = particles;
    disposables.push(pGeo, pMat);

    // --- 4. 地面 ---
    const groundGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshBasicMaterial({ 
        color: getBgColor(), 
        wireframe: true, 
        transparent: true, 
        opacity: 0.2 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    scene.add(ground);
    disposables.push(groundGeo, groundMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 粒子动力学
      if (animatables.particleSystem) {
          const positions = animatables.particleSystem.geometry.attributes.position.array as Float32Array;
          
          let speedX = 0, speedY = 0, speedZ = 0;
          if (weatherType === 'typhoon') {
              speedX = 15 * intensity;
              speedY = -15 * intensity;
          } else if (weatherType === 'blizzard') {
              speedX = 5 * intensity;
              speedY = -5 * intensity;
              speedZ = 2 * intensity;
          } else if (weatherType === 'sandstorm') {
              speedX = 20 * intensity;
              speedY = 2 * intensity; // Swirling up
          } else if (weatherType === 'heatwave') {
              speedY = 2 * intensity; // Rising heat
          }

          for(let i=0; i<pCount; i++) {
              // Basic movement
              positions[i*3] += speedX * 0.01 + Math.sin(time + i) * 0.05;
              positions[i*3+1] += speedY * 0.01;
              positions[i*3+2] += speedZ * 0.01;

              // Boundary check & Reset
              if (positions[i*3+1] < 0 || positions[i*3+1] > 30 || Math.abs(positions[i*3]) > 20) {
                  positions[i*3] = (Math.random() - 0.5) * 40 - (speedX * 0.5); // Offset reset based on wind
                  positions[i*3+1] = speedY < 0 ? 30 : 0;
                  positions[i*3+2] = (Math.random() - 0.5) * 40;
              }
          }
          animatables.particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      // 设备摇晃 (Wind Load)
      if (structureGroup && (weatherType === 'typhoon' || weatherType === 'sandstorm')) {
          structureGroup.rotation.z = Math.sin(time * 5) * 0.05 * intensity;
          structureGroup.position.x = Math.sin(time * 3) * 0.1 * intensity;
      }

      // 闪电模拟
      if (weatherType === 'typhoon' && Math.random() > 0.95) {
          dynamicLight.intensity = 50 * intensity;
          dynamicLight.position.x = (Math.random() - 0.5) * 40;
          dynamicLight.position.z = (Math.random() - 0.5) * 40;
      } else {
          dynamicLight.intensity *= 0.8;
      }

      // 热浪扭曲模拟 (Heat Haze - simplified via scaling)
      if (weatherType === 'heatwave' && animatables.shieldMesh) {
          const scale = 1 + Math.sin(time * 10) * 0.02 * intensity;
          animatables.shieldMesh.scale.setScalar(scale);
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
  }, [weatherType, intensity, structureHealth]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

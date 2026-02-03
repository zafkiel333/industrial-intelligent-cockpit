import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropellerPmAnimatables } from './three-types';

interface ThreeSceneProps {
  rpm?: number;
  corrosionLevel?: number; // 0-1
  crackDetected?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rpm = 120, 
  corrosionLevel = 0.2,
  crackDetected = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const spotLight = new THREE.SpotLight(0x0ea5e9, 100);
    spotLight.position.set(5, 10, 10);
    scene.add(spotLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: PropellerPmAnimatables = { blades: [], crackMarkers: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 螺旋桨主体 (Propeller Body) ---
    const propellerGroup = new THREE.Group();
    
    // 轮毂 (Hub)
    const hubGeo = new THREE.CylinderGeometry(0.8, 1, 2, 32);
    hubGeo.rotateX(Math.PI / 2);
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0xcd7f32, // 青铜色
      metalness: 0.9, 
      roughness: 0.3,
      emissive: 0x78350f,
      emissiveIntensity: 0.2
    });
    const hub = new THREE.Mesh(hubGeo, bronzeMat);
    propellerGroup.add(hub);
    animatables.hub = hub;

    // 叶片 (Blades)
    const bladeGeo = new THREE.SphereGeometry(1, 32, 32);
    bladeGeo.scale(2.5, 1.2, 0.1); // 扁平化叶片
    bladeGeo.translate(1.8, 0, 0);

    for(let i=0; i<4; i++) {
        const bladeMat = bronzeMat.clone();
        // 如果腐蚀度高，颜色变灰暗并带点绿色斑点
        if (corrosionLevel > 0.5) {
            bladeMat.color.setHex(0x57534e);
            bladeMat.emissive.setHex(0x064e3b);
        }
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.z = (i * Math.PI) / 2;
        blade.rotation.x = 0.5; // 螺距角
        propellerGroup.add(blade);
        animatables.blades?.push(blade);
    }
    group.add(propellerGroup);
    animatables.propellerGroup = propellerGroup;

    // --- 2. 裂纹标记 (Crack Markers) ---
    if (crackDetected) {
        const crackGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 24);
        const crackMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const marker = new THREE.Mesh(crackGeo, crackMat);
        marker.position.set(2.5, 0.5, 0.2);
        animatables.crackMarkers?.add(marker);
        propellerGroup.add(animatables.crackMarkers!);
    }

    // --- 3. 空泡与水流粒子 (Cavitation & Flow) ---
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 10;
        pPos[i*3+1] = (Math.random() - 0.5) * 10;
        pPos[i*3+2] = -Math.random() * 15;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.05, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    animatables.waterParticles = particles;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const rotateSpeed = (rpm / 60) * 0.1;

      // 螺旋桨旋转
      if (animatables.propellerGroup) {
          animatables.propellerGroup.rotation.z += rotateSpeed;
      }

      // 水流粒子向后移动
      if (animatables.waterParticles) {
          const positions = animatables.waterParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+2] += 0.2; // 粒子向后喷射
              if (positions[i*3+2] > 5) {
                  positions[i*3+2] = -15;
                  positions[i*3] = (Math.random() - 0.5) * 6;
                  positions[i*3+1] = (Math.random() - 0.5) * 6;
              }
          }
          animatables.waterParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 裂纹点闪烁
      if (crackDetected && animatables.crackMarkers) {
          animatables.crackMarkers.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
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
  }, [rpm, corrosionLevel, crackDetected]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
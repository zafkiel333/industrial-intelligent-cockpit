
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElecMechSceneProps } from './three-types';

export const ElecMechThreeScene: React.FC<ElecMechSceneProps> = ({
  magneticFluxDensity,
  airGapEccentricity,
  vibrationIntensity,
  rotationSpeed,
  isExcited,
  showFluxLines,
  faultActive
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rotorRef = useRef<THREE.Group | null>(null);
  const fluxParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // 深灰色背景，较亮
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8; // 增加亮度
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 灯光系统 (高亮设计) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0x3b82f6, 2);
    topLight.position.set(5, 20, 5);
    scene.add(topLight);

    const sideLight = new THREE.PointLight(0x8b5cf6, 3, 50);
    sideLight.position.set(-10, 5, 0);
    scene.add(sideLight);

    // --- 几何体构建 ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 定子 (电气域外壳 - 科技感半透明)
    const statorGeo = new THREE.CylinderGeometry(5.5, 5.5, 6, 48, 1, true);
    const statorMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    mainGroup.add(stator);

    const statorFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(statorGeo),
      new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2 })
    );
    mainGroup.add(statorFrame);

    // 2. 转子 (机械域核心 - 强烈金属感)
    const rotorGroup = new THREE.Group();
    rotorRef.current = rotorGroup;
    mainGroup.add(rotorGroup);

    const rotorBodyGeo = new THREE.CylinderGeometry(4.2, 4.2, 5.8, 32);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.1
    });
    const rotorBody = new THREE.Mesh(rotorBodyGeo, rotorMat);
    rotorGroup.add(rotorBody);

    // 磁极 (Rotor Poles)
    const poleGeo = new THREE.BoxGeometry(0.8, 5, 0.4);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(Math.cos(angle) * 4.3, 0, Math.sin(angle) * 4.3);
        pole.rotation.y = -angle;
        rotorGroup.add(pole);
    }

    // 3. 磁通粒子 (Magnetic Flux)
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 4.4 + Math.random() * 1.0; // 气隙区间
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 6;
        pPos[i*3+2] = Math.sin(angle) * r;
        
        pColors[i*3] = 0.5; // 紫色
        pColors[i*3+1] = 0.2;
        pColors[i*3+2] = 1.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const fluxParticles = new THREE.Points(pGeo, pMat);
    fluxParticlesRef.current = fluxParticles;
    mainGroup.add(fluxParticles);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      if (rotorRef.current) {
          // 旋转
          rotorRef.current.rotation.y -= rotationSpeed * 0.02;
          
          // 偏心效果: 转子质心偏移
          const ecc = airGapEccentricity * 0.4;
          const vib = vibrationIntensity * 0.1 * Math.sin(time * 20);
          rotorRef.current.position.x = ecc + vib;
          rotorRef.current.position.z = vib;
      }

      if (fluxParticlesRef.current) {
          const positions = fluxParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const colors = fluxParticlesRef.current.geometry.attributes.color.array as Float32Array;
          
          for(let i=0; i<pCount; i++) {
              // 粒子旋转
              const px = positions[i*3];
              const pz = positions[i*3+2];
              const rot = 0.01 * rotationSpeed;
              positions[i*3] = px * Math.cos(rot) - pz * Math.sin(rot);
              positions[i*3+2] = px * Math.sin(rot) + pz * Math.cos(rot);

              // 偏心区域磁密颜色变红 (0度方向模拟偏心)
              const angle = Math.atan2(pz, px);
              if (Math.abs(angle) < 0.5 && airGapEccentricity > 0.6) {
                  colors[i*3] = 1.0; colors[i*3+1] = 0.2; colors[i*3+2] = 0.2;
              } else {
                  colors[i*3] = 0.5; colors[i*3+1] = 0.2; colors[i*3+2] = 1.0;
              }
          }
          fluxParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          fluxParticlesRef.current.geometry.attributes.color.needsUpdate = true;
          fluxParticlesRef.current.visible = showFluxLines && isExcited;
          fluxParticlesRef.current.material.opacity = magneticFluxDensity;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [magneticFluxDensity, airGapEccentricity, vibrationIntensity, rotationSpeed, isExcited, showFluxLines, faultActive]);

  return <div ref={mountRef} className="w-full h-full" />;
};

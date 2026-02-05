
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AccuracySceneProps } from './three-types';

export const AccuracyThreeScene: React.FC<AccuracySceneProps> = ({ 
  globalAccuracy,
  errorIntensity,
  isAnalyzing,
  dataDensity,
  uncertaintyZones
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const manifoldRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const scannerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.8;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 1. 概率流形表面 (Probability Manifold)
    const manifoldGeo = new THREE.PlaneGeometry(20, 20, 64, 64);
    manifoldGeo.rotateX(-Math.PI / 2);
    
    const manifoldMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.5
    });
    const manifold = new THREE.Mesh(manifoldGeo, manifoldMat);
    manifoldRef.current = manifold;
    scene.add(manifold);

    // 2. 数据点云 (Data Cloud)
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*18;
        pPos[i*3+1] = 0;
        pPos[i*3+2] = (Math.random()-0.5)*18;
        
        pColors[i*3] = 0.1; pColors[i*3+1] = 0.5; pColors[i*3+2] = 1.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    
    const pMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 3. 扫描线效果
    const scannerGroup = new THREE.Group();
    const scanLineGeo = new THREE.BoxGeometry(20, 0.1, 0.1);
    const scanLineMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });
    const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
    scannerGroup.add(scanLine);
    scannerRef.current = scannerGroup;
    scene.add(scannerGroup);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 流形曲面扭曲模拟误差
      if (manifoldRef.current) {
          const positions = manifoldRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
              const x = positions[i];
              const z = positions[i+2];
              // 基础波动
              let y = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5;
              
              // 在“不稳定区”产生突变
              uncertaintyZones.forEach(zone => {
                  const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(z - zone.z, 2));
                  if (dist < zone.r) {
                      y += (zone.r - dist) * 2 * Math.sin(time * 10) * errorIntensity;
                  }
              });
              positions[i+1] = y;
          }
          manifoldRef.current.geometry.attributes.position.needsUpdate = true;
          
          // 根据准确度调整亮度
          (manifoldRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + (1 - globalAccuracy/100);
      }

      // 点云浮动
      if (particlesRef.current) {
          const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const col = particlesRef.current.geometry.attributes.color.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              // 模拟回归线附近的偏差
              const x = pos[i*3];
              const z = pos[i*3+2];
              // 同步流形高度
              const yBase = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5;
              pos[i*3+1] = yBase + (Math.random()-0.5) * errorIntensity * 2;
              
              // 误差大的点颜色变红
              if (Math.abs(pos[i*3+1] - yBase) > 0.5 * (1-errorIntensity)) {
                  col[i*3] = 1.0; col[i*3+1] = 0.2; col[i*3+2] = 0.2;
              } else {
                  col[i*3] = 0.1; col[i*3+1] = 0.5; col[i*3+2] = 1.0;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          particlesRef.current.geometry.attributes.color.needsUpdate = true;
      }

      // 扫描线移动
      if (scannerRef.current && isAnalyzing) {
          scannerRef.current.position.z = Math.sin(time * 2) * 10;
          scannerRef.current.visible = true;
      } else if (scannerRef.current) {
          scannerRef.current.visible = false;
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
  }, [globalAccuracy, errorIntensity, isAnalyzing, uncertaintyZones]);

  return <div ref={mountRef} className="w-full h-full" />;
};

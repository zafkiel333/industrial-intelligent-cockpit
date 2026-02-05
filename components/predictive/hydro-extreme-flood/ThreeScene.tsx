
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExtremeFloodProps } from './three-types';

export const ExtremeFloodThreeScene: React.FC<ExtremeFloodProps> = ({
  waterLevelUp,
  waterLevelDown,
  waveIntensity,
  isRaining,
  isStorming,
  structuralStress,
  submergedZones
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const waterUpRef = useRef<THREE.Mesh | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const damRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a1120, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 40);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光环境
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    // 1. 大坝结构模型 (Section View)
    const damShape = new THREE.Shape();
    damShape.moveTo(-10, 0);
    damShape.lineTo(10, 0);
    damShape.lineTo(2, 20); // 坝顶高度20m
    damShape.lineTo(-2, 20);
    damShape.closePath();

    const extrudeSettings = { depth: 40, bevelEnabled: false };
    const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
    const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      roughness: 0.8,
      emissive: 0xff0000,
      emissiveIntensity: 0
    });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.z = -20;
    damRef.current = dam;
    scene.add(dam);

    // 2. 厂房结构 (下游侧)
    const powerhouseGeo = new THREE.BoxGeometry(10, 6, 20);
    const powerhouseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const powerhouse = new THREE.Mesh(powerhouseGeo, powerhouseMat);
    powerhouse.position.set(12, 3, 0);
    scene.add(powerhouse);

    // 3. 上游水体
    const waterUpGeo = new THREE.BoxGeometry(40, 20, 40);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x075985,
      transmission: 0.6,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const waterUp = new THREE.Mesh(waterUpGeo, waterMat);
    waterUp.position.set(-25, 0, 0);
    waterUpRef.current = waterUp;
    scene.add(waterUp);

    // 4. 雨水粒子系统
    const rainCount = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount; i++) {
        rainPos[i*3] = (Math.random() - 0.5) * 100;
        rainPos[i*3+1] = Math.random() * 50;
        rainPos[i*3+2] = (Math.random() - 0.5) * 100;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.5 });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    rainRef.current = rainSystem;
    scene.add(rainSystem);

    // 动画
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 水位动态升降 (映射 0-100% 到 0-22m)
      if (waterUpRef.current) {
          const targetY = (waterLevelUp / 100) * 22;
          waterUpRef.current.scale.y = THREE.MathUtils.lerp(waterUpRef.current.scale.y, targetY / 20, 0.05);
          waterUpRef.current.position.y = (waterUpRef.current.scale.y * 20) / 2;
          
          // 波浪抖动
          waterUpRef.current.position.y += Math.sin(time * 5) * 0.1 * waveIntensity;
      }

      // 雨水下落
      if (rainRef.current && isRaining) {
          rainRef.current.visible = true;
          const pos = rainRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<rainCount; i++) {
              pos[i*3+1] -= 0.8;
              if (pos[i*3+1] < 0) pos[i*3+1] = 50;
          }
          rainRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (rainRef.current) {
          rainRef.current.visible = false;
      }

      // 闪电效果
      if (isStorming && Math.random() > 0.98) {
          scene.background = new THREE.Color(0xffffff);
          setTimeout(() => scene.background = null, 50);
      }

      // 结构应力热力显示
      if (damRef.current) {
          (damRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = structuralStress * Math.sin(time * 2);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
  }, [waterLevelUp, waterLevelDown, waveIntensity, isRaining, isStorming, structuralStress]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

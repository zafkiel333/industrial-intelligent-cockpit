
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MainMotorSceneProps } from './three-types';

export const MainMotorThreeScene: React.FC<MainMotorSceneProps> = ({
  rotationSpeed,
  insulationHealth,
  activePhase,
  showElectricField,
  isStressed
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rotorRef = useRef<THREE.Group | null>(null);
  const statorRef = useRef<THREE.Group | null>(null);
  const fieldParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-main-motor useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 使用深蓝色背景而非纯黑，增加景深感
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // 提高曝光度，解决“黑乎乎”的问题
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
    controls.autoRotate = false;

    // --- 增强光照系统 ---
    // 1. 半球光：提供自然的基础环境光，防止暗部全黑
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1.2);
    scene.add(hemiLight);

    // 2. 主平行光：模拟强光照射
    const dirLight = new THREE.DirectionalLight(0x0ea5e9, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 3. 轮廓点光源：增强边缘质感
    const rimLight = new THREE.PointLight(0x8b5cf6, 4, 50);
    rimLight.position.set(-15, 10, -10);
    scene.add(rimLight);

    // --- 材质定义 ---
    const ironMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.6, 
        roughness: 0.4,
        emissive: 0x1e293b,
        emissiveIntensity: 0.2
    });

    const copperMat = new THREE.MeshStandardMaterial({ 
        color: 0xb45309, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: 0x78350f,
        emissiveIntensity: 0.2
    });

    // 风险材质
    const warningMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xff0000,
        emissiveIntensity: 1.0
    });

    // --- 几何体构建 ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 定子外壳 (Stator Frame)
    const statorGroup = new THREE.Group();
    statorRef.current = statorGroup;
    mainGroup.add(statorGroup);

    const frameGeo = new THREE.CylinderGeometry(6, 6, 8, 48, 1, true);
    const frame = new THREE.Mesh(frameGeo, new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    }));
    statorGroup.add(frame);

    // 2. 绕组组 (Winding Groups - 3 Phase)
    const windingGroup = new THREE.Group();
    statorGroup.add(windingGroup);
    
    for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const x = Math.cos(angle) * 5.2;
        const z = Math.sin(angle) * 5.2;

        const coilGeo = new THREE.BoxGeometry(0.3, 8.2, 0.5);
        // 如果健康度低，部分线圈变红
        const mat = (i > 10 && i < 14 && insulationHealth < 70) ? warningMat : copperMat;
        
        const coil = new THREE.Mesh(coilGeo, mat);
        coil.position.set(x, 0, z);
        coil.rotation.y = -angle;
        windingGroup.add(coil);
    }

    // 3. 转子组件 (Rotor)
    const rotorGroup = new THREE.Group();
    rotorRef.current = rotorGroup;
    mainGroup.add(rotorGroup);

    const rotorBody = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 7.5, 32), ironMat);
    rotorGroup.add(rotorBody);

    // 磁极 (Poles)
    const poleGeo = new THREE.BoxGeometry(0.8, 7, 0.4);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pole = new THREE.Mesh(poleGeo, copperMat);
        pole.position.set(Math.cos(angle) * 4.1, 0, Math.sin(angle) * 4.1);
        pole.rotation.y = -angle;
        rotorGroup.add(pole);
    }

    // 4. 电场粒子流 (Field Flow)
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 4.2 + Math.random() * 1.0;
        const th = Math.random() * Math.PI * 2;
        pPos[i*3] = Math.cos(th) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 8;
        pPos[i*3+2] = Math.sin(th) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.05,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const fieldParticles = new THREE.Points(pGeo, pMat);
    fieldParticlesRef.current = fieldParticles;
    mainGroup.add(fieldParticles);

    // 5. 地面投影网格
    const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -4.5;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 转子旋转
      if (rotorRef.current) {
          rotorRef.current.rotation.y -= rotationSpeed * 0.02;
      }

      // 粒子流动画 (模拟电磁场)
      if (fieldParticlesRef.current && showElectricField) {
          fieldParticlesRef.current.visible = true;
          const pos = fieldParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              // 粒子旋转
              const px = pos[i*3];
              const pz = pos[i*3+2];
              const rot = 0.02 * rotationSpeed;
              pos[i*3] = px * Math.cos(rot) - pz * Math.sin(rot);
              pos[i*3+2] = px * Math.sin(rot) + pz * Math.cos(rot);
              // 垂直脉动
              pos[i*3+1] += Math.sin(time + i) * 0.005;
          }
          fieldParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (fieldParticlesRef.current) {
          fieldParticlesRef.current.visible = false;
      }

      // 故障闪烁效果
      if (insulationHealth < 50 && Math.sin(time * 10) > 0) {
          rimLight.intensity = 8;
      } else {
          rimLight.intensity = 4;
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
  }, [rotationSpeed, insulationHealth, activePhase, showElectricField, isStressed]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto" />;
};

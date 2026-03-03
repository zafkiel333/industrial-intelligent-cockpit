import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpSceneProps } from './three-types';

export const HydraulicPumpThreeScene: React.FC<PumpSceneProps> = ({
  parts,
  rpm,
  swashPlateAngle,
  pressure,
  isInternalVisible,
  isCavitating,
  selectedPartId,
  onPartSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pistonsRef = useRef<THREE.Group[]>([]);
  const swashPlateRef = useRef<THREE.Mesh | null>(null);
  const bubblesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-pump useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

    // --- 环境光影 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const cyanLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    cyanLight.position.set(10, 10, 10);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0x8b5cf6, 2, 50);
    magentaLight.position.set(-10, 5, -5);
    scene.add(magentaLight);

    // --- 材质定义 ---
    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x64748b, metalness: 0.9, roughness: 0.2,
        transparent: isInternalVisible,
        opacity: isInternalVisible ? 0.3 : 1.0
    });

    const activeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 1.0, roughness: 0.1,
        emissive: 0x0ea5e9, emissiveIntensity: 0.2
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, transmission: 0.5, transparent: true, opacity: 0.4
    });

    // --- 模型构建 ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 泵体外壳 (Housing)
    const housingGeo = new THREE.CylinderGeometry(4, 4.5, 8, 32);
    housingGeo.rotateZ(Math.PI / 2);
    const housing = new THREE.Mesh(housingGeo, metalMat);
    mainGroup.add(housing);

    // 2. 斜盘 (Swash Plate)
    const swashGeo = new THREE.CylinderGeometry(3, 3, 0.4, 32);
    const swash = new THREE.Mesh(swashGeo, activeMat);
    swash.position.x = -3.5;
    swash.rotation.z = (swashPlateAngle * Math.PI) / 180;
    swashPlateRef.current = swash;
    mainGroup.add(swash);

    // 3. 缸体与柱塞 (Cylinder Block & Pistons)
    const blockGroup = new THREE.Group();
    const cylinderBlock = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 4, 32), activeMat);
    cylinderBlock.rotation.z = Math.PI / 2;
    cylinderBlock.position.x = 1;
    blockGroup.add(cylinderBlock);

    pistonsRef.current = [];
    const pistonCount = 9;
    for(let i=0; i<pistonCount; i++) {
        const pGroup = new THREE.Group();
        const angle = (i / pistonCount) * Math.PI * 2;
        const r = 1.8;
        
        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 16), activeMat);
        piston.rotation.z = Math.PI / 2;
        pGroup.add(piston);
        
        pGroup.userData = { angle, r };
        pGroup.position.set(0, Math.cos(angle) * r, Math.sin(angle) * r);
        blockGroup.add(pGroup);
        pistonsRef.current.push(pGroup);
    }
    mainGroup.add(blockGroup);

    // 4. 空化气泡粒子
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*5;
        pPos[i*3+1] = (Math.random()-0.5)*3;
        pPos[i*3+2] = (Math.random()-0.5)*3;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 });
    const bubbles = new THREE.Points(pGeo, pMat);
    bubbles.visible = isCavitating;
    bubblesRef.current = bubbles;
    scene.add(bubbles);

    // 地面
    const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -5;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. 模拟旋转与柱塞往复运动
      const rotSpeed = (rpm / 60) * 0.1;
      blockGroup.rotation.x += rotSpeed;
      
      const plateAngleRad = (swashPlateAngle * Math.PI) / 180;
      pistonsRef.current.forEach((p) => {
          const { angle, r } = p.userData;
          // 当前柱塞相位 = 基础相位 + 缸体旋转
          const currentPhase = angle + blockGroup.rotation.x;
          // 柱塞行程取决于斜盘角度
          const stroke = Math.cos(currentPhase) * Math.tan(plateAngleRad) * r;
          p.position.x = -1.5 + stroke;
      });

      // 2. 气泡抖动
      if (bubblesRef.current && isCavitating) {
          const pos = bubblesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3] += (Math.random()-0.5)*0.05;
              pos[i*3+1] += (Math.random()-0.5)*0.05;
              if (Math.abs(pos[i*3]) > 5) pos[i*3] = 0;
          }
          bubblesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 3. 选中部件高亮 (简易逻辑)
      if (selectedPartId === 'swash-plate') {
          swash.scale.setScalar(1 + Math.sin(time*10)*0.02);
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
  }, [rpm, swashPlateAngle, isInternalVisible, isCavitating]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
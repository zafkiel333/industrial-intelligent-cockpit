
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CouplingSceneProps } from './three-types';

export const CouplingThreeScene: React.FC<CouplingSceneProps> = ({ 
  fluidVelocity,
  vibrationAmp,
  electromagneticStress,
  couplingIntensity,
  isResonating,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const waterFlowRef = useRef<THREE.Points | null>(null);
  const unitGroupRef = useRef<THREE.Group | null>(null);
  const fieldRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
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

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0x38bdf8, 3, 50);
    topLight.position.set(0, 20, 0);
    scene.add(topLight);

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    unitGroupRef.current = mainGroup;

    // 1. 机械结构 (半透明全息感)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });

    const bodyGeo = new THREE.CylinderGeometry(4, 5, 12, 32, 1, true);
    const body = new THREE.Mesh(bodyGeo, glassMat);
    mainGroup.add(body);

    const wireGeo = new THREE.EdgesGeometry(bodyGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    mainGroup.add(wireframe);

    // 2. 流体粒子 (蜗壳与转轮区)
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 2;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 10;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    waterFlowRef.current = particles;
    mainGroup.add(particles);

    // 3. 电磁场云 (顶部发电机区)
    const fieldGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const fieldMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.position.y = 4;
    fieldRef.current = field;
    mainGroup.add(field);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 模拟流体运动
      if (waterFlowRef.current) {
          const positions = waterFlowRef.current.geometry.attributes.position.array as Float32Array;
          const speed = fluidVelocity * 0.01;
          for(let i=0; i<pCount; i++) {
              // 螺旋下沉运动
              const x = positions[i*3];
              const z = positions[i*3+2];
              const angle = 0.05 + couplingIntensity * 0.05;
              positions[i*3] = x * Math.cos(angle) - z * Math.sin(angle);
              positions[i*3+2] = x * Math.sin(angle) + z * Math.cos(angle);
              positions[i*3+1] -= speed;
              if (positions[i*3+1] < -6) positions[i*3+1] = 6;
          }
          waterFlowRef.current.geometry.attributes.position.needsUpdate = true;
          waterFlowRef.current.visible = viewMode === 'total' || viewMode === 'fluid';
      }

      // 模拟机械振动 (微小抖动)
      if (unitGroupRef.current) {
          const shake = (vibrationAmp / 500) * (isResonating ? 2 : 1);
          unitGroupRef.current.position.x = Math.sin(time * 50) * shake;
          unitGroupRef.current.position.z = Math.cos(time * 50) * shake;
          unitGroupRef.current.visible = viewMode === 'total' || viewMode === 'mechanical';
      }

      // 模拟电磁应力脉动
      if (fieldRef.current) {
          const scale = 1 + Math.sin(time * 10) * 0.05 * electromagneticStress;
          fieldRef.current.scale.set(scale, scale, scale);
          (fieldRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + electromagneticStress * 0.2;
          fieldRef.current.visible = viewMode === 'total' || viewMode === 'electrical';
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
  }, [fluidVelocity, vibrationAmp, electromagneticStress, couplingIntensity, isResonating, viewMode]);

  return <div ref={mountRef} className="w-full h-full" />;
};

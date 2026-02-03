
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SwingSceneProps } from './three-types';

export const SwingThreeScene: React.FC<SwingSceneProps> = ({
  parts,
  rpm,
  torque,
  viewMode,
  activePartId,
  onPartSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const motorRef = useRef<THREE.Group | null>(null);
  const gearRingRef = useRef<THREE.Mesh | null>(null);
  const pinionRef = useRef<THREE.Mesh | null>(null);
  const fieldRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050208);
    scene.fog = new THREE.FogExp2(0x050208, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 光照 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const purpleLight = new THREE.PointLight(0xa855f7, 5, 40);
    purpleLight.position.set(10, 10, 10);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 3, 40);
    blueLight.position.set(-10, 5, -5);
    scene.add(blueLight);

    // --- 材质 ---
    const metalMat = (color: number) => new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.3,
      transparent: viewMode !== 'mechanical',
      opacity: viewMode === 'mechanical' ? 1.0 : 0.3
    });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 大齿圈 (Main Ring Gear)
    const ringGeo = new THREE.TorusGeometry(6, 0.4, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, metalMat(0x475569));
    gearRingRef.current = ring;
    mainGroup.add(ring);

    // 2. 驱动装置 (Drive Unit)
    const driveUnit = new THREE.Group();
    driveUnit.position.set(3.5, 0, 0);
    mainGroup.add(driveUnit);

    // 牵引电机 (Motor)
    const motorGroup = new THREE.Group();
    motorGroup.position.y = 3.5;
    driveUnit.add(motorGroup);
    motorRef.current = motorGroup;

    const motorCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 32), metalMat(0x1e293b));
    motorGroup.add(motorCyl);
    
    // 电机散热片
    const finGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.8, 16, 1, true);
    const fins = new THREE.Mesh(finGeo, new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.2 }));
    motorGroup.add(fins);

    // 3. 小齿轮 (Pinion)
    const pinionGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    pinionGeo.rotateX(Math.PI/2);
    const pinion = new THREE.Mesh(pinionGeo, metalMat(0x94a3b8));
    pinionRef.current = pinion;
    driveUnit.add(pinion);

    // 4. 电磁场粒子 (Magnetic Field)
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 1.5 + Math.random() * 1.5;
        const th = Math.random() * Math.PI * 2;
        pPos[i*3] = Math.cos(th) * r;
        pPos[i*3+1] = (Math.random()-0.5) * 6;
        pPos[i*3+2] = Math.sin(th) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xd946ef, 
        size: 0.06, 
        transparent: true, 
        opacity: viewMode === 'magnetic' ? 0.6 : 0,
        blending: THREE.AdditiveBlending 
    });
    const field = new THREE.Points(pGeo, pMat);
    fieldRef.current = field;
    motorGroup.add(field);

    // 5. 地面投影网格
    const grid = new THREE.GridHelper(30, 20, 0x2e1065, 0x0a0510);
    grid.position.y = -1;
    scene.add(grid);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 旋转逻辑
      const speed = rpm * 0.01;
      if (motorRef.current) motorRef.current.rotation.y += speed;
      if (pinionRef.current) pinionRef.current.rotation.x += speed;
      if (gearRingRef.current) gearRingRef.current.rotation.y -= speed * 0.15; // 减速比

      // 粒子运动
      if (fieldRef.current && viewMode === 'magnetic') {
          const pos = fieldRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time*5 + i)*0.02; // 垂直脉动
          }
          fieldRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 热力图颜色更新
      if (viewMode === 'thermal') {
          parts.forEach(p => {
              const tNorm = Math.min(1, (p.temp - 40) / 60);
              const heatColor = new THREE.Color().setHSL(0.7 * (1-tNorm), 1.0, 0.5);
              if (p.id === 'motor' && motorRef.current) {
                  (motorRef.current.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                      color: heatColor, emissive: heatColor, emissiveIntensity: 0.5
                  });
              }
          });
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
  }, [viewMode, rpm, activePartId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

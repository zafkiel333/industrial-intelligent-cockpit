
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MineHydraulicThreeProps } from './three-types';

export const HydraulicScene: React.FC<MineHydraulicThreeProps> = ({ 
  parts, 
  activeId, 
  onSelect,
  isPumping,
  pressureFluctuation 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 核心光影方案 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // 顶部冷白工业光
    const topLight = new THREE.DirectionalLight(0xffffff, 2);
    topLight.position.set(5, 20, 5);
    topLight.castShadow = true;
    scene.add(topLight);

    // 内部高压热感点光源 (橙色)
    const heatLight = new THREE.PointLight(0xf97316, 10, 20);
    heatLight.position.set(0, 2, 0);
    scene.add(heatLight);

    // 侧向蓝色金属补光
    const sideLight = new THREE.RectAreaLight(0x0ea5e9, 5, 10, 10);
    sideLight.position.set(-10, 5, 0);
    sideLight.lookAt(0, 0, 0);
    scene.add(sideLight);

    // --- 模型组建 (液压泵站核心) ---
    const group = new THREE.Group();
    scene.add(group);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 1,
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    const activeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      metalness: 0.5
    });

    // 1. 主泵体 (Pump Body)
    const pumpGeo = new THREE.BoxGeometry(4, 3, 6);
    const pump = new THREE.Mesh(pumpGeo, activeId === 'PUMP-01' ? activeMat : metalMat);
    pump.position.y = 1;
    pump.userData = { id: 'PUMP-01' };
    group.add(pump);

    // 2. 蓄能器 (Accumulators)
    const accGeo = new THREE.CapsuleGeometry(0.6, 2, 16, 32);
    for (let i = 0; i < 3; i++) {
        const acc = new THREE.Mesh(accGeo, activeId === `ACC-0${i+1}` ? activeMat : metalMat);
        acc.position.set(-2.5, 2.5, (i - 1) * 2);
        acc.userData = { id: `ACC-0${i+1}` };
        group.add(acc);
    }

    // 3. 高压岐管 (Manifold)
    const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 32);
    pipeGeo.rotateZ(Math.PI / 2);
    const manifold = new THREE.Mesh(pipeGeo, metalMat);
    manifold.position.y = 3;
    group.add(manifold);

    // 4. 油压微粒 (Flow particles)
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.08, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- 交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0 && intersects[0].object.userData.id) {
        onSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.02;

      if (isPumping) {
        // 模拟高压脉冲震动
        group.position.y = Math.sin(frame * 15) * 0.02 * pressureFluctuation;
        heatLight.intensity = 10 + Math.sin(frame * 20) * 5;
        
        // 粒子流动逻辑
        const pos = pGeo.attributes.position.array as Float32Array;
        for(let i=0; i<pCount; i++) {
            pos[i*3+2] += 0.1 * pressureFluctuation;
            if (pos[i*3+2] > 10) pos[i*3+2] = -10;
        }
        pGeo.attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [isPumping, pressureFluctuation, activeId, parts]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

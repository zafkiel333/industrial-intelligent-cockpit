
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BearingAnimatables } from './three-types';

interface ThreeSceneProps {
  damageSeverity?: number; // 0 to 1
  rotationSpeed?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  damageSeverity = 0.2,
  rotationSpeed = 0.05 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===screen-bearing useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

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

    // --- 强化灯光配置 ---
    
    // 1. 基础环境光：提高整体亮度，确保阴影面不全黑
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    // 2. 半球光：模拟天空和地面反射，增强金属质感
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 3. 主定向光：提供清晰的轮廓和金属高光
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    // 4. 点光源：增加科技感的霓虹蓝冷光
    const pointLight = new THREE.PointLight(0x00f2ff, 15, 100);
    pointLight.position.set(-10, 5, 10);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BearingAnimatables = {};
    const disposables: any[] = [];

    // --- 轴承几何体构建 ---

    // 1. 外圈 (Outer Ring)
    const outerGeo = new THREE.TorusGeometry(5, 0.5, 32, 64);
    outerGeo.rotateX(Math.PI / 2);
    const outerMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, // 稍微调浅颜色以更好吸收光线
        metalness: 0.8, 
        roughness: 0.2,
        transparent: true,
        opacity: 0.7
    });
    const outerRing = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerRing);
    animatables.outerRing = outerRing;
    disposables.push(outerGeo, outerMat);

    // 2. 内圈 (Inner Ring)
    const innerGroup = new THREE.Group();
    const innerGeo = new THREE.TorusGeometry(3.5, 0.4, 32, 64);
    innerGeo.rotateX(Math.PI / 2);
    const innerMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 0.9, 
        roughness: 0.1
    });
    const innerRing = new THREE.Mesh(innerGeo, innerMat);
    innerGroup.add(innerRing);
    group.add(innerGroup);
    animatables.innerRing = innerGroup;
    disposables.push(innerGeo, innerMat);

    // 3. 滚动体 (Rollers / Balls)
    const rollerGroup = new THREE.Group();
    const rollerGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0, 
      metalness: 1.0,
      roughness: 0.05
    });
    const rollerCount = 12;
    for(let i=0; i<rollerCount; i++) {
        const roller = new THREE.Mesh(rollerGeo, rollerMat);
        const angle = (i / rollerCount) * Math.PI * 2;
        roller.position.set(Math.cos(angle) * 4.3, 0, Math.sin(angle) * 4.3);
        rollerGroup.add(roller);
    }
    group.add(rollerGroup);
    animatables.rollers = rollerGroup;
    disposables.push(rollerGeo, rollerMat);

    // 4. 疲劳损伤点 (Damage Hotspots)
    const damageGroup = new THREE.Group();
    const crackGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
    for(let i=0; i<5; i++) {
        const crack = new THREE.Mesh(crackGeo, crackMat);
        const angle = (Math.random() * 0.2 + 0.1) * Math.PI * 2;
        crack.position.set(Math.cos(angle) * 4.3, 0.2, Math.sin(angle) * 4.3);
        damageGroup.add(crack);
    }
    group.add(damageGroup);
    animatables.damageNodes = damageGroup;
    disposables.push(crackGeo, crackMat);

    // 5. 应力云粒子 (Stress Particles)
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 4 + (Math.random() - 0.5) * 1.5;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 0.5;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x22d3ee, 
        size: 0.04, 
        transparent: true, 
        opacity: 0.5 
    });
    const stressParticles = new THREE.Points(pGeo, pMat);
    group.add(stressParticles);
    animatables.stressField = stressParticles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟
      if (animatables.innerRing) animatables.innerRing.rotation.y += rotationSpeed;
      if (animatables.rollers) animatables.rollers.rotation.y += rotationSpeed * 0.4;

      // 损伤点闪烁
      if (animatables.damageNodes) {
          const scale = 1 + Math.sin(time * 10) * 0.3;
          animatables.damageNodes.scale.set(scale, scale, scale);
          animatables.damageNodes.visible = damageSeverity > 0.5;
      }

      // 应力云流动
      if (animatables.stressField) {
          animatables.stressField.rotation.y += rotationSpeed * 0.2;
          const op = (Math.sin(time * 5) * 0.2 + 0.5) * (1 + damageSeverity);
          (animatables.stressField.material as THREE.PointsMaterial).opacity = op;
      }

      if (controls) controls.update();
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [damageSeverity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

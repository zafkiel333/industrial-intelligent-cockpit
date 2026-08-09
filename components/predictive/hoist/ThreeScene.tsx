
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HoistAnimatables } from './three-types';

interface ThreeSceneProps {
  healthScore?: number; // 0-100
  loadFactor?: number; // 0-1
  isOperating?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 90,
  loadFactor = 0.6,
  isOperating = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hoist useEffect===");

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 电影级三点照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const backLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    backLight.position.set(-10, 5, -5);
    scene.add(backLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: HoistAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 主提升卷筒 (Drum) ---
    const drumGeo = new THREE.CylinderGeometry(3, 3, 5, 64);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: healthScore < 70 ? 0xff4400 : 0x000000,
        emissiveIntensity: (100 - healthScore) / 100
    });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.castShadow = true;
    group.add(drum);
    animatables.drum = drum;
    disposables.push(drumGeo, drumMat);

    // --- 2. 主轴 (Main Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);
    animatables.shaft = shaft;
    disposables.push(shaftGeo, shaftMat);

    // --- 3. 钢丝绳 (Ropes) ---
    const createRope = (x: number) => {
        const points = [];
        for(let i=0; i<20; i++) points.push(new THREE.Vector3(x, 3 - i*1, 2));
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0x64748b });
        return new THREE.Line(geo, mat);
    };
    const ropeL = createRope(-1.5);
    const ropeR = createRope(1.5);
    group.add(ropeL, ropeR);
    animatables.ropeL = ropeL;
    animatables.ropeR = ropeR;

    // --- 4. 制动盘 (Brake Disc) ---
    const discGeo = new THREE.TorusGeometry(3.2, 0.1, 16, 100);
    discGeo.rotateY(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xef4444, emissiveIntensity: 0 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.x = 3.5;
    group.add(disc);
    animatables.brakeDisc = disc;
    disposables.push(discGeo, discMat);

    // --- 5. 健康光环 (Health Aura) ---
    const auraGeo = new THREE.RingGeometry(4.5, 4.7, 64);
    auraGeo.rotateY(Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({ 
        color: healthScore > 80 ? 0x10b981 : 0xf59e0b, 
        transparent: true, 
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    scene.add(aura);
    animatables.vibrationAura = aura;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (isOperating) {
          const speed = 0.02 * loadFactor;
          group.rotation.x += speed;
          
          // 模拟卷筒负载下的微震动
          if (healthScore < 85) {
              group.position.y = Math.sin(time * 60) * (0.01 * (100 - healthScore) / 100);
          }
      }

      // 光环呼吸效果
      if (animatables.vibrationAura) {
          animatables.vibrationAura.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
          (animatables.vibrationAura.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 2) * 0.2;
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
  }, [healthScore, loadFactor, isOperating]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

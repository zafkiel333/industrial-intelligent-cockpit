
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WinchGearboxAnimatables } from './three-types';

interface ThreeSceneProps {
  gearHealth?: number; // 0-1
  brakeWear?: number;   // 0-1
  rpm?: number;
  isBraking?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  gearHealth = 0.9, 
  brakeWear = 0.2,
  rpm = 60,
  isBraking = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 核心光效优化：解决光线暗淡/方向不正确问题 ---
    
    // 1. 全局环境光：提供基础亮度，防止死黑
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // 2. 半球光：模拟真实环境反射，增强金属质感
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x001133, 1.5);
    scene.add(hemiLight);

    // 3. 主定向光：提供硬调阴影和高光，突出机械结构
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 4. 重点局部光：科技蓝冷色补光
    const cyanPoint = new THREE.PointLight(0x0ea5e9, 25, 40);
    cyanPoint.position.set(-10, 5, 5);
    scene.add(cyanPoint);

    // 5. 警告/热源光：红色点光源
    const heatLight = new THREE.PointLight(0xff4400, 0, 15);
    heatLight.position.set(5, 0, 0);
    scene.add(heatLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: WinchGearboxAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 减速箱齿轮系 (Planetary Gear Set) ---
    const gearGroup = new THREE.Group();
    const gearMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 1.0, 
        roughness: 0.15,
        emissive: 0x001122,
        emissiveIntensity: 0.1
    });
    
    const sunGeo = new THREE.CylinderGeometry(1.2, 1.2, 1, 32);
    const sunGear = new THREE.Mesh(sunGeo, gearMat);
    sunGear.rotateZ(Math.PI / 2);
    gearGroup.add(sunGear);
    animatables.sunGear = sunGear;

    const planetGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    planetGeo.rotateZ(Math.PI / 2);
    const planetCount = 3;
    const planets = new THREE.Group();
    for(let i=0; i<planetCount; i++) {
        const planet = new THREE.Mesh(planetGeo, gearMat);
        const angle = (i / planetCount) * Math.PI * 2;
        planet.position.set(0, Math.cos(angle) * 2.2, Math.sin(angle) * 2.2);
        planets.add(planet);
    }
    gearGroup.add(planets);
    animatables.planetGears = planets;
    group.add(gearGroup);

    // --- 2. 制动器系统 (Brake Assembly) ---
    const brakeGroup = new THREE.Group();
    brakeGroup.position.x = 4.5;

    // 制动盘
    const discGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.3, 64);
    discGeo.rotateZ(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 1.0, 
        roughness: 0.1,
        emissive: 0xff0000,
        emissiveIntensity: 0
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    brakeGroup.add(disc);
    animatables.brakeDisc = disc;

    // 左右闸瓦
    const shoeGeo = new THREE.BoxGeometry(0.4, 1.5, 1.2);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0.6, 2.5, 0);
    brakeGroup.add(shoeL);
    animatables.brakeShoeL = shoeL;

    const shoeR = shoeL.clone();
    shoeR.position.x = -0.6;
    brakeGroup.add(shoeR);
    animatables.brakeShoeR = shoeR;

    group.add(brakeGroup);

    // --- 3. 装饰性框架 (Wireframe Shell) ---
    const shellGeo = new THREE.BoxGeometry(10, 6, 6);
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const rotationSpeed = (rpm / 60) * 0.1;

      // 齿轮啮合动画
      if (animatables.sunGear) animatables.sunGear.rotation.x += rotationSpeed;
      if (animatables.planetGears) {
          animatables.planetGears.rotation.x += rotationSpeed * 0.5;
          animatables.planetGears.children.forEach(p => p.rotation.x -= rotationSpeed * 1.5);
      }

      // 制动盘自转与动作
      if (animatables.brakeDisc) {
          animatables.brakeDisc.rotation.x += isBraking ? rotationSpeed * 0.1 : rotationSpeed;
          // 热力反馈
          const heat = isBraking ? 1.0 : (1 - gearHealth) * 0.5;
          (animatables.brakeDisc.material as THREE.MeshStandardMaterial).emissiveIntensity = THREE.MathUtils.lerp(
              (animatables.brakeDisc.material as THREE.MeshStandardMaterial).emissiveIntensity, 
              heat, 0.05
          );
          heatLight.intensity = (animatables.brakeDisc.material as THREE.MeshStandardMaterial).emissiveIntensity * 15;
      }

      // 闸瓦动作模拟
      if (animatables.brakeShoeL && animatables.brakeShoeR) {
          const targetX = isBraking ? 0.3 : 0.6;
          animatables.brakeShoeL.position.x = THREE.MathUtils.lerp(animatables.brakeShoeL.position.x, targetX, 0.1);
          animatables.brakeShoeR.position.x = THREE.MathUtils.lerp(animatables.brakeShoeR.position.x, -targetX, 0.1);
      }

      // 整体微小震动 (随健康度)
      group.position.y = Math.sin(time * 50) * (0.01 * (1 - gearHealth));

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
      scene.clear();
      renderer.dispose();
    };
  }, [gearHealth, brakeWear, rpm, isBraking]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

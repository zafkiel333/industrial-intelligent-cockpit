import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ viewMode?: 'standard' | 'thermal' | 'xray', fillLevel?: number }> = ({ 
  viewMode = 'standard',
  fillLevel = 0.65
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ viewMode, fillLevel });
  useEffect(() => {
    propsRef.current = { viewMode, fillLevel };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 12, 22);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // 修复 "Illegal constructor" 错误的核心逻辑
    const OrbitControlsImpl = (OrbitControls as any).OrbitControls || OrbitControls;
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 货舱骨架与外壳 (Holographic Design)
    const holdGroup = new THREE.Group();
    const outerGeo = new THREE.BoxGeometry(22, 12, 14);
    const outerMat = new THREE.MeshStandardMaterial({ 
      transparent: true, 
    });
    const outerWall = new THREE.Mesh(outerGeo, outerMat);
    holdGroup.add(outerWall);

    // 内部加强筋 (Structural Ribs)
    const ribGeo = new THREE.TorusGeometry(6, 0.08, 8, 4);
    ribGeo.rotateY(Math.PI / 2);
    const ribs: THREE.Mesh[] = [];
    for(let i = -10; i <= 10; i += 4) {
      const rib = new THREE.Mesh(ribGeo, new THREE.MeshBasicMaterial({ 
        transparent: true,
        opacity: 0.4
      }));
      rib.position.x = i;
      ribs.push(rib);
      holdGroup.add(rib);
    }

    // 2. 模拟载货 (Cargo: Grains/Bulk)
    const cargoGeo = new THREE.BoxGeometry(20, 10, 12);
    const cargoMat = new THREE.MeshStandardMaterial({ 
      roughness: 1.0,
      metalness: 0.0
    });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    holdGroup.add(cargo);

    scene.add(holdGroup);

    // 3. 智能巡检机器人 (Drone Bot)
    const bot = new THREE.Group();
    const botBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x00f2ff }));
    bot.add(botBody);
    
    // 激光扫描光锥
    const scanBeamGeo = new THREE.CylinderGeometry(0.05, 3, 10, 32, 1, true);
    const scanBeamMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f2ff, 
      transparent: true, 
      opacity: 0.2,
      side: THREE.DoubleSide 
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.rotation.x = Math.PI / 2;
    scanBeam.position.z = 5;
    bot.add(scanBeam);
    scene.add(bot);

    // 4. 环境灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 5, 40);
    pointLight.position.set(10, 15, 10);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentViewMode = propsRef.current.viewMode;
      const currentFillLevel = propsRef.current.fillLevel;

      // Update materials based on viewMode
      outerMat.color.setHex(currentViewMode === 'xray' ? 0x0ea5e9 : 0x1e293b);
      outerMat.opacity = currentViewMode === 'xray' ? 0.15 : 0.7;
      outerMat.wireframe = currentViewMode === 'xray';

      ribs.forEach(rib => {
        (rib.material as THREE.MeshBasicMaterial).color.setHex(currentViewMode === 'thermal' ? 0xf43f5e : 0x334155);
      });

      cargoMat.color.setHex(currentViewMode === 'thermal' ? 0xeab308 : 0x262626);
      pointLight.color.setHex(currentViewMode === 'thermal' ? 0xff4400 : 0x0ea5e9);

      // Update cargo level
      cargo.scale.y = currentFillLevel;
      cargo.position.y = -6 + (10 * currentFillLevel / 2);

      const time = Date.now() * 0.001;
      
      // 巡检机器人飞行轨迹
      bot.position.x = Math.sin(time * 0.4) * 9;
      bot.position.y = 3 + Math.cos(time * 0.6) * 2;
      bot.position.z = Math.sin(time * 0.3) * 5;
      bot.lookAt(0, 0, 0);

      // 扫描脉冲效果
      scanBeamMat.opacity = 0.1 + Math.sin(time * 6) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

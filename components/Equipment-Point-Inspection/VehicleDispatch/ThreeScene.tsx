import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ tipProgress?: number }> = ({ tipProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ tipProgress });
  useEffect(() => {
    propsRef.current = { tipProgress };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 地面网格 (科技风格)
    const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    scene.add(grid);

    // 2. 矿卡主体结构
    const truckGroup = new THREE.Group();
    
    // 底盘
    const chassisGeo = new THREE.BoxGeometry(6, 1.2, 3.5);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.2;
    truckGroup.add(chassis);

    // 驾驶室
    const cabGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(2, 2.7, 0);
    truckGroup.add(cab);

    // 轮胎 (4个巨型轮胎)
    const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.2, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const createWheel = (x: number, z: number) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(x, 1.1, z);
        // 轮胎内部发光环 (监测胎压)
        const glow = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 16, 32), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 }));
        glow.rotation.y = Math.PI / 2;
        w.add(glow);
        return w;
    };
    truckGroup.add(createWheel(2, 2), createWheel(2, -2), createWheel(-2, 2), createWheel(-2, -2));

    // 翻斗车厢 (Tipper Body)
    const bodyGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(5.5, 1.8, 3.8);
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true }));
    const solidBody = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.8 }));
    bodyGroup.add(body, solidBody);
    bodyGroup.position.set(-0.5, 2.7, 0);
    truckGroup.add(bodyGroup);

    scene.add(truckGroup);

    // 3. 智能扫描光阵
    const scanner = new THREE.Group();
    const planeGeo = new THREE.PlaneGeometry(10, 0.2);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const scanLine = new THREE.Mesh(planeGeo, planeMat);
    scanLine.rotation.x = Math.PI / 2;
    scanner.add(scanLine);
    scene.add(scanner);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xf97316, 3, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentTipProgress = propsRef.current.tipProgress;
      
      // 扫描线运动
      scanner.position.y = 1 + Math.sin(time) * 3;
      
      // 模拟车厢翻转 (根据 progress 联动)
      bodyGroup.rotation.z = THREE.MathUtils.lerp(bodyGroup.rotation.z, -Math.PI / 4 * currentTipProgress, 0.05);
      
      // 轮胎呼吸灯
      truckGroup.children.forEach(child => {
          if (child.children.length > 0) {
              child.children[0].scale.setScalar(1 + Math.sin(time * 2) * 0.1);
          }
      });

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

  return <div ref={mountRef} className="w-full h-full" />;
};

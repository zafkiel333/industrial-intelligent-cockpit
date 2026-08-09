import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ progress?: number }> = ({ progress = 0.5 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ progress });
  useEffect(() => {
    propsRef.current = { progress };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

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

    // 1. 采掘面背景 (煤墙)
    const wallGeo = new THREE.BoxGeometry(40, 6, 2);
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false 
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3, -4);
    scene.add(wall);

    // 2. 刮板输送机轨道
    const conveyorGeo = new THREE.BoxGeometry(40, 0.5, 3);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat);
    conveyor.position.y = 0.25;
    scene.add(conveyor);

    // 3. 采煤机 (Shearer)
    const shearerGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2.5), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    shearerGroup.add(body);
    
    // 两个滚筒
    const drumGeo = new THREE.CylinderGeometry(1.2, 1.2, 1, 16);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x444444, wireframe: true });
    
    const drumL = new THREE.Mesh(drumGeo, drumMat);
    drumL.position.set(-2.5, 0, 1.5);
    drumL.rotation.z = Math.PI / 2;
    shearerGroup.add(drumL);

    const drumR = drumL.clone();
    drumR.position.set(2.5, 0.5, 1.5);
    shearerGroup.add(drumR);

    scene.add(shearerGroup);

    // 4. 激光雷达扫描特效
    const scanPlaneGeo = new THREE.PlaneGeometry(8, 10);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.2, 
      side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.y = Math.PI / 2;
    shearerGroup.add(scanPlane);

    // 5. 支架阵列 (简化显示)
    const supports = new THREE.Group();
    for(let i = -18; i <= 18; i += 2) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(1.5, 5, 2), new THREE.MeshStandardMaterial({ 
        color: 0x64748b, 
        transparent: true, 
        opacity: 0.4 
      }));
      s.position.set(i, 2.5, 2);
      supports.add(s);
    }
    scene.add(supports);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xf97316, 2, 40);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentProgress = propsRef.current.progress;

      // 模拟采煤机移动 (根据传入的进度)
      const targetX = (currentProgress - 0.5) * 30;
      shearerGroup.position.x = THREE.MathUtils.lerp(shearerGroup.position.x, targetX, 0.05);

      // 滚筒旋转
      drumL.rotation.y += 0.1;
      drumR.rotation.y += 0.1;

      // 扫描板波动
      scanPlane.position.x = Math.sin(Date.now() * 0.01) * 0.5;

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

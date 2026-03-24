import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ mode?: 'hologram' | 'stress' | 'corrosion' }> = ({ mode = 'hologram' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ mode });
  useEffect(() => {
    propsRef.current = { mode };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const OrbitControlsImpl = (OrbitControls as any).OrbitControls || OrbitControls;
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 数字化船体 (Holographic Hull)
    const hullGroup = new THREE.Group();
    
    // 主船体几何体 (简化版)
    const hullGeo = new THREE.BoxGeometry(20, 4, 6);
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: mode === 'stress' ? 0x0ea5e9 : 0x334155, 
      transparent: true, 
      opacity: 0.2,
      wireframe: true 
    });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    hullGroup.add(hullMesh);

    // 内部龙骨/加强筋可视化
    for(let i = -9; i <= 9; i += 2) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 3.8, 5.8),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 })
      );
      rib.position.x = i;
      hullGroup.add(rib);
    }

    // 2. 应力热力点位 (Hotspots)
    const hotspots = new THREE.Group();
    const spotGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const createSpot = (pos: [number, number, number], color: number, pulse = false) => {
      const spot = new THREE.Mesh(spotGeo, new THREE.MeshBasicMaterial({ color }));
      spot.position.set(pos[0], pos[1], pos[2]);
      if (pulse) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.4, 0.05, 8, 32),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
        );
        ring.rotation.y = Math.PI / 2;
        spot.add(ring);
      }
      return spot;
    };

    hotspots.add(createSpot([5, 0, 3.1], 0xf43f5e, true)); // 警告点
    hotspots.add(createSpot([-2, 1, -3.1], 0xeab308, true)); // 关注点
    hotspots.add(createSpot([8, -1, 0], 0x10b981)); // 正常点
    scene.add(hotspots);

    scene.add(hullGroup);

    // 3. 动态扫描无人机 (Inspection Drone)
    const drone = new THREE.Group();
    drone.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f2ff })));
    const scanBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 1, 5, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    scanBeam.rotation.z = Math.PI / 2;
    scanBeam.position.x = -2.5;
    drone.add(scanBeam);
    scene.add(drone);

    // 4. 海平面 (半透明网格)
    const ocean = new THREE.GridHelper(60, 20, 0x0891b2, 0x0f172a);
    ocean.position.y = -2;
    scene.add(ocean);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentMode = propsRef.current.mode;
      hullMesh.material.color.setHex(currentMode === 'stress' ? 0x0ea5e9 : 0x334155);

      const time = Date.now() * 0.001;
      
      // 无人机环绕飞行轨迹
      drone.position.x = Math.sin(time * 0.5) * 15;
      drone.position.z = Math.cos(time * 0.5) * 10;
      drone.position.y = 2 + Math.sin(time) * 2;
      drone.lookAt(0, 0, 0);

      // 热力点脉冲
      hotspots.children.forEach((spot: any) => {
        if(spot.children.length > 0) {
          spot.children[0].scale.setScalar(1 + Math.sin(time * 4) * 0.2);
          spot.children[0].material.opacity = 0.5 - Math.sin(time * 4) * 0.2;
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

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

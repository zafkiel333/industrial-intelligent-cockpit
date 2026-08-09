import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ shipDist?: number, shipAngle?: number }> = ({ 
  shipDist = 5, 
  shipAngle = 2 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ shipDist, shipAngle });
  useEffect(() => {
    propsRef.current = { shipDist, shipAngle };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

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

    // 1. 岸壁结构 (Quay Wall)
    const quayGeo = new THREE.BoxGeometry(40, 6, 12);
    const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.2, roughness: 0.8 });
    const quay = new THREE.Mesh(quayGeo, quayMat);
    quay.position.set(0, -3, -6);
    scene.add(quay);

    // 2. 系缆桩阵列 (Bollards)
    const bollardGroup = new THREE.Group();
    const bollardGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    for(let i = -15; i <= 15; i += 5) {
      const b = new THREE.Mesh(bollardGeo, bollardMat);
      b.position.set(i, 0.4, -0.5);
      bollardGroup.add(b);
    }
    scene.add(bollardGroup);

    // 3. 护弦系统 (Fenders)
    const fenderGroup = new THREE.Group();
    const fenderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    fenderGeo.rotateZ(Math.PI / 2);
    const fenderMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    for(let i = -15; i <= 15; i += 5) {
      const f = new THREE.Mesh(fenderGeo, fenderMat);
      f.position.set(i, -1, 0.2);
      fenderGroup.add(f);
    }
    scene.add(fenderGroup);

    // 4. 船舶剪影 (Cargo Ship Silhouette)
    const shipGroup = new THREE.Group();
    const shipHullGeo = new THREE.BoxGeometry(25, 4, 6);
    const shipHullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.9 });
    const hull = new THREE.Mesh(shipHullGeo, shipHullMat);
    shipGroup.add(hull);
    
    const superstructure = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    superstructure.position.set(-8, 3.5, 0);
    shipGroup.add(superstructure);
    
    scene.add(shipGroup);

    // 5. BAS 激光测距射线
    const laserGroup = new THREE.Group();
    const createLaser = (x: number) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, -1, 0.5),
            new THREE.Vector3(x, -1, 10)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
        return new THREE.Line(lineGeo, lineMat);
    };
    const laser1 = createLaser(-10);
    const laser2 = createLaser(10);
    laserGroup.add(laser1, laser2);
    scene.add(laserGroup);

    // 6. 海平面
    const waterGeo = new THREE.PlaneGeometry(100, 100);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x0891b2, 
      transparent: true, 
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.5;
    scene.add(water);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x10b981, 2, 50);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentShipDist = propsRef.current.shipDist;
      const currentShipAngle = propsRef.current.shipAngle;

      const targetZ = currentShipDist + 3; 
      shipGroup.position.z = THREE.MathUtils.lerp(shipGroup.position.z, targetZ, 0.05);
      shipGroup.rotation.y = THREE.MathUtils.lerp(shipGroup.rotation.y, (currentShipAngle * Math.PI) / 180, 0.05);

      laser1.scale.set(1, 1, Math.max(0.01, (shipGroup.position.z - 0.5) / 9.5));
      laser2.scale.set(1, 1, Math.max(0.01, (shipGroup.position.z - 0.5) / 9.5));

      water.position.y = -1.5 + Math.sin(Date.now() * 0.001) * 0.1;

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

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ length?: number, rotation?: number }> = ({ 
  length = 0.5, 
  rotation = 0 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ length, rotation });
  useEffect(() => {
    propsRef.current = { length, rotation };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // 修复 OrbitControls 构造函数错误
    const OrbitControlsImpl = (OrbitControls as any).OrbitControls || OrbitControls;
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 登船桥主体组
    const bridgeGroup = new THREE.Group();
    
    // 圆厅 (Rotunda - 固定基座)
    const rotundaGeo = new THREE.CylinderGeometry(2, 2.2, 4, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const rotunda = new THREE.Mesh(rotundaGeo, metalMat);
    rotunda.position.y = 2;
    bridgeGroup.add(rotunda);

    // 伸缩隧道组 (Telescopic Tunnels)
    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.y = 4;
    
    // 第一节隧道 (Fixed)
    const t1Geo = new THREE.BoxGeometry(3, 3, 6);
    const t1 = new THREE.Mesh(t1Geo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true }));
    t1.position.z = 3;
    tunnelGroup.add(t1);

    // 第二节隧道 (Moving)
    const t2Geo = new THREE.BoxGeometry(2.8, 2.8, 6);
    const t2 = new THREE.Mesh(t2Geo, new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 }));
    t2.position.z = 3;
    const t2Container = new THREE.Group();
    t2Container.add(t2);
    tunnelGroup.add(t2Container);

    // 接船口 (Service Cab)
    const cabGeo = new THREE.BoxGeometry(3.5, 3.2, 2.5);
    const cab = new THREE.Mesh(cabGeo, new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    cab.position.z = 3;
    const cabGroup = new THREE.Group();
    cabGroup.add(cab);
    t2Container.add(cabGroup);

    bridgeGroup.add(tunnelGroup);
    scene.add(bridgeGroup);

    // 2. 检测指示器 (检测关键部位点云)
    const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
    const markers = [
      { pos: [0, 4, 0], name: '旋转铰链' },
      { pos: [0, 4, 6], name: '伸缩机构' },
      { pos: [0, 4, 12], name: '找平感应器' }
    ];
    markers.forEach(m => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(m.pos[0], m.pos[1], m.pos[2]);
      scene.add(marker);
    });

    // 3. 动态扫描平面
    const scanPlaneGeo = new THREE.PlaneGeometry(10, 0.1);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 5, 30);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentLength = propsRef.current.length;
      const currentRotation = propsRef.current.rotation;
      
      // 模拟伸缩与旋转
      t2Container.position.z = currentLength * 5;
      cabGroup.rotation.y = currentRotation;
      
      // 扫描线往复
      scanPlane.position.z = 5 + Math.sin(time) * 8;
      scanPlane.position.y = 4 + Math.cos(time * 0.5) * 2;
      scanPlaneMat.opacity = 0.3 + Math.sin(time * 5) * 0.2;

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

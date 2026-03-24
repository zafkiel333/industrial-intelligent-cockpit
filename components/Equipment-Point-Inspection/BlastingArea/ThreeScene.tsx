import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ isSimulating?: boolean }> = ({ isSimulating = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ isSimulating });
  useEffect(() => {
    propsRef.current = { isSimulating };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

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

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);

    // 1. 创建地表 (粗糙岩石感)
    const terrainGeo = new THREE.PlaneGeometry(30, 30, 16, 16);
    const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d2d2d, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // 2. 爆破孔阵列
    const holeGroup = new THREE.Group();
    const holeGeo = new THREE.CylinderGeometry(0.15, 0.15, 4, 8);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const stemmedMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });

    for(let i = -5; i <= 5; i += 2) {
      for(let j = -3; j <= 3; j += 2) {
        const isStemmed = Math.random() > 0.3;
        const hole = new THREE.Mesh(holeGeo, isStemmed ? stemmedMat : holeMat);
        hole.position.set(i, -2, j);
        holeGroup.add(hole);

        // 孔位标签指示器
        const ringGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 32);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(i, 0.05, j);
        holeGroup.add(ring);
      }
    }
    scene.add(holeGroup);

    // 3. 爆破警戒线 (动态波动的圆环)
    const perimeterGeo = new THREE.RingGeometry(8, 8.2, 64);
    const perimeterMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const perimeter = new THREE.Mesh(perimeterGeo, perimeterMat);
    perimeter.rotation.x = Math.PI / 2;
    perimeter.position.y = 0.1;
    scene.add(perimeter);

    // 4. 扫描中心支柱
    const sensorGeo = new THREE.BoxGeometry(0.4, 3, 0.4);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(10, 1.5, 10);
    scene.add(sensor);

    // 扫描红光
    const scanLight = new THREE.SpotLight(0xff0000, 10, 20, Math.PI / 6);
    scanLight.position.set(10, 3, 10);
    scene.add(scanLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentIsSimulating = propsRef.current.isSimulating;

      // 警戒线脉冲
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
      perimeter.scale.set(scale, scale, 1);
      
      // 模拟震动
      if (currentIsSimulating) {
        scene.position.y = Math.sin(Date.now() * 0.05) * 0.05;
      } else {
        scene.position.y = 0;
      }

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

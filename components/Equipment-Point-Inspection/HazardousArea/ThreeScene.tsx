import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ isAlert?: boolean }> = ({ isAlert = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ isAlert });
  useEffect(() => {
    propsRef.current = { isAlert };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(18, 12, 18);

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

    // 1. 核心危险区基座 (带有警告纹理感)
    const baseGeo = new THREE.BoxGeometry(20, 0.2, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    scene.add(base);

    // 2. 危险核心建筑 (例如配电房或炸药库)
    const buildingGeo = new THREE.BoxGeometry(6, 5, 8);
    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: 0x374151, 
      wireframe: false,
      transparent: true,
      opacity: 0.8
    });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.y = 2.5;
    scene.add(building);

    // 内部结构线条
    const innerWire = new THREE.Mesh(buildingGeo, new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true }));
    innerWire.position.copy(building.position);
    scene.add(innerWire);

    // 3. 电子围栏 (激光线)
    const fenceGroup = new THREE.Group();
    const fenceColor = isAlert ? 0xf43f5e : 0x8b5cf6;
    
    const createLaserWall = (x: number, z: number, w: number, h: number, rot: number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ 
        color: fenceColor, 
        transparent: true, 
        opacity: 0.15, 
        side: THREE.DoubleSide 
      });
      const wall = new THREE.Mesh(geo, mat);
      wall.position.set(x, h/2, z);
      wall.rotation.y = rot;
      
      // 顶部边缘发光线
      const lineGeo = new THREE.BoxGeometry(w, 0.05, 0.05);
      const line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: fenceColor }));
      line.position.y = h/2;
      wall.add(line);
      
      return wall;
    };

    fenceGroup.add(createLaserWall(0, 7, 14, 4, 0));
    fenceGroup.add(createLaserWall(0, -7, 14, 4, 0));
    fenceGroup.add(createLaserWall(7, 0, 14, 4, Math.PI/2));
    fenceGroup.add(createLaserWall(-7, 0, 14, 4, Math.PI/2));
    scene.add(fenceGroup);

    // 4. 动态巡检扫描光束
    const scanner = new THREE.Group();
    const beamGeo = new THREE.ConeGeometry(2, 15, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI;
    beam.position.y = 7.5;
    scanner.add(beam);
    scene.add(scanner);

    // 5. 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(fenceColor, 2, 30);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentIsAlert = propsRef.current.isAlert;
      const currentFenceColor = currentIsAlert ? 0xf43f5e : 0x8b5cf6;

      // Update fence color dynamically
      fenceGroup.children.forEach((wall: any) => {
        wall.material.color.setHex(currentFenceColor);
        if (wall.children.length > 0) {
          wall.children[0].material.color.setHex(currentFenceColor);
        }
      });
      pointLight.color.setHex(currentFenceColor);

      // 扫描器往复运动
      const time = Date.now() * 0.001;
      scanner.position.x = Math.sin(time) * 8;
      scanner.position.z = Math.cos(time * 0.8) * 8;
      
      // 围栏呼吸效果
      fenceGroup.children.forEach((wall: any) => {
        wall.material.opacity = 0.1 + Math.sin(time * 4) * 0.05;
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

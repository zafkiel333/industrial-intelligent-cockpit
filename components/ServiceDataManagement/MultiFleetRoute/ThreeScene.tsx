
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GlobalRouteProps, RouteData, FleetNode } from './three-types';

export const MultiFleetRouteThreeScene: React.FC<GlobalRouteProps> = ({ activeRouteId, onRouteSelect, globalSpeed = 1 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // 模拟航线数据 (Lat, Lon)
  const routes: RouteData[] = [
    { id: 'route-ae', name: '亚欧干线 (Asia-EU)', start: [31.2, 121.5], end: [51.9, 4.5], color: '#22d3ee', traffic: 0.9 }, // Shanghai to Rotterdam
    { id: 'route-tp', name: '跨太平洋 (Trans-Pacific)', start: [22.3, 114.1], end: [33.7, -118.2], color: '#a855f7', traffic: 0.8 }, // HK to LA
    { id: 'route-ia', name: '亚洲区内 (Intra-Asia)', start: [1.3, 103.8], end: [35.6, 139.6], color: '#10b981', traffic: 0.6 }, // Singapore to Tokyo
    { id: 'route-au', name: '澳亚航线 (Aus-Asia)', start: [31.2, 121.5], end: [-33.8, 151.2], color: '#f59e0b', traffic: 0.4 }, // Shanghai to Sydney
  ];

  // 辅助函数：经纬度转三维坐标
  const latLongToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5 * globalSpeed;
    controls.minDistance = 15;
    controls.maxDistance = 60;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(20, 10, 20);
    scene.add(sunLight);
    const rimLight = new THREE.PointLight(0x0ea5e9, 2, 50); // 蓝色轮廓光
    rimLight.position.set(-20, 10, -20);
    scene.add(rimLight);

    // 地球组
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. 数据地球 (点阵球体)
    const sphereRadius = 10;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 4); // 高细分
    const sphereMat = new THREE.MeshBasicMaterial({ 
      color: 0x0f172a, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
    });
    const earthWire = new THREE.Mesh(sphereGeo, sphereMat);
    earthGroup.add(earthWire);

    // 内部黑色遮挡球，防止看到背面的线
    const occludeGeo = new THREE.SphereGeometry(sphereRadius - 0.1, 32, 32);
    const occludeMat = new THREE.MeshBasicMaterial({ color: 0x020408 });
    const occludeMesh = new THREE.Mesh(occludeGeo, occludeMat);
    earthGroup.add(occludeMesh);

    // 2. 模拟大陆板块 (点云) - 简单生成随机点模拟陆地感，实际应用通常用纹理贴图
    const pointsGeo = new THREE.BufferGeometry();
    const pointsCount = 1500;
    const positions = new Float32Array(pointsCount * 3);
    for(let i=0; i<pointsCount; i++) {
        // 随机分布，不精确模拟陆地，仅做全息科技感点缀
        const lat = (Math.random() - 0.5) * 160; 
        const lon = (Math.random() - 0.5) * 360;
        const v = latLongToVector3(lat, lon, sphereRadius);
        positions[i*3] = v.x;
        positions[i*3+1] = v.y;
        positions[i*3+2] = v.z;
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0x1e293b, size: 0.15 });
    const earthPoints = new THREE.Points(pointsGeo, pointsMat);
    earthGroup.add(earthPoints);

    // 3. 绘制航线 (贝塞尔曲线)
    const routeLines: THREE.Line[] = [];
    const ships: THREE.Mesh[] = [];

    routes.forEach(route => {
        const start = latLongToVector3(route.start[0], route.start[1], sphereRadius);
        const end = latLongToVector3(route.end[0], route.end[1], sphereRadius);
        
        // 计算控制点 (让曲线拱起)
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(sphereRadius * (1.2 + Math.random() * 0.3));
        
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({ 
            color: route.id === activeRouteId ? 0xffffff : route.color, 
            transparent: true, 
            opacity: route.id === activeRouteId ? 0.8 : 0.4 
        });
        
        const curveObject = new THREE.Line(geometry, material);
        earthGroup.add(curveObject);
        routeLines.push(curveObject);

        // 添加该航线上的船只 (粒子)
        const shipCount = Math.floor(route.traffic * 5) + 1;
        for(let i=0; i<shipCount; i++) {
            const shipGeo = new THREE.OctahedronGeometry(0.2);
            const shipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const ship = new THREE.Mesh(shipGeo, shipMat);
            ship.userData = { 
                curve: curve, 
                progress: i / shipCount, 
                speed: 0.002 + Math.random() * 0.002 
            };
            earthGroup.add(ship);
            ships.push(ship);
        }
    });

    // 大气层光晕
    const haloGeo = new THREE.SphereGeometry(sphereRadius * 1.2, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // 船只移动
      ships.forEach(ship => {
          ship.userData.progress += ship.userData.speed * globalSpeed;
          if (ship.userData.progress > 1) ship.userData.progress = 0;
          const pos = ship.userData.curve.getPoint(ship.userData.progress);
          ship.position.copy(pos);
          ship.lookAt(new THREE.Vector3(0,0,0)); // 简单朝向
      });

      // 脉冲光晕
      const time = Date.now() * 0.001;
      halo.scale.setScalar(1 + Math.sin(time) * 0.02);

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
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeRouteId, globalSpeed]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

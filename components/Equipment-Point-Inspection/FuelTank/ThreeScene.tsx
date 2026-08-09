import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ mode?: 'standard' | 'thermal' | 'xray', fillLevels?: number[] }> = ({ 
  mode = 'standard',
  fillLevels = [0.8, 0.65, 0.4, 0.9]
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ mode, fillLevels });
  useEffect(() => {
    propsRef.current = { mode, fillLevels };
  }, [mode, fillLevels]);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 18, 22);

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

    // 1. 船舶中段骨架
    const hullGroup = new THREE.Group();
    const hullGeo = new THREE.BoxGeometry(26, 8, 14);
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      transparent: true, 
      opacity: 0.1, 
      wireframe: true 
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hullGroup.add(hull);
    scene.add(hullGroup);

    // 2. 油料舱矩阵 (4个独立舱室)
    const tanks = new THREE.Group();
    const tankGeo = new THREE.BoxGeometry(5, 6, 10);
    const oilGeo = new THREE.BoxGeometry(4.8, 6, 9.8);
    const tankPositions = [[-8, 0, 0], [-2.5, 0, 0], [3, 0, 0], [8.5, 0, 0]];
    
    const oilMeshes: THREE.Mesh[] = [];
    const walls: THREE.Mesh[] = [];

    tankPositions.forEach((pos, i) => {
      // 舱壁
      const wall = new THREE.Mesh(tankGeo, new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        transparent: true, 
      }));
      wall.position.set(pos[0], pos[1], pos[2]);
      walls.push(wall);
      tanks.add(wall);

      // 燃油液体
      const oil = new THREE.Mesh(oilGeo, new THREE.MeshPhongMaterial({ 
        transparent: true, 
        opacity: 0.8,
        shininess: 80 
      }));
      oilMeshes.push(oil);
      tanks.add(oil);

      // 传感器标记
      const sensorGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const sensor = new THREE.Mesh(sensorGeo, new THREE.MeshBasicMaterial({ color: 0x00f2ff }));
      sensor.position.set(pos[0], 2.8, pos[2]);
      tanks.add(sensor);
    });
    scene.add(tanks);

    // 3. 智能巡检扫描头 (无人值守巡检机器人)
    const robot = new THREE.Group();
    const robotBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    robot.add(robotBody);
    
    const scanBeamGeo = new THREE.CylinderGeometry(0.01, 2, 8, 32, 1, true);
    const scanBeamMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f2ff, 
      transparent: true, 
      opacity: 0.2,
      side: THREE.DoubleSide 
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.rotation.x = Math.PI / 2;
    scanBeam.position.z = 4;
    robot.add(scanBeam);
    scene.add(robot);

    // 4. 环境特效 (油雾/粒子)
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
      posArray[i*3] = (Math.random() - 0.5) * 20;
      posArray[i*3+1] = (Math.random() - 0.5) * 6;
      posArray[i*3+2] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const points = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.05, transparent: true, opacity: 0.3 }));
    scene.add(points);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;

      const currentMode = propsRef.current.mode;
      const currentFillLevels = propsRef.current.fillLevels;

      // Update wall opacity based on mode
      const wallOpacity = currentMode === 'xray' ? 0.05 : 0.3;
      walls.forEach(w => {
        (w.material as THREE.MeshStandardMaterial).opacity = wallOpacity;
      });

      // Update oil color and level
      const oilColor = currentMode === 'thermal' ? 0xf43f5e : 0xb45309;
      oilMeshes.forEach((m, idx) => {
        (m.material as THREE.MeshPhongMaterial).color.setHex(oilColor);
        m.scale.y = currentFillLevels[idx];
        m.position.y = -3 + (6 * currentFillLevels[idx] / 2) + Math.sin(time + idx) * 0.05;
      });

      // 机器人巡检路径
      robot.position.x = Math.sin(time * 0.5) * 11;
      robot.position.y = 3 + Math.sin(time) * 1;
      robot.lookAt(0, 0, 0);

      // 扫描脉冲
      scanBeamMat.opacity = 0.1 + Math.abs(Math.sin(time * 4)) * 0.2;

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

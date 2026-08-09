import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ waterLevel?: number, activeCount?: number }> = ({ 
  waterLevel = 4.5, 
  activeCount = 2 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ waterLevel, activeCount });
  useEffect(() => {
    propsRef.current = { waterLevel, activeCount };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);

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

    // 1. 深井井筒 (圆柱体带透视)
    const wellGeo = new THREE.CylinderGeometry(8, 8.5, 30, 32, 1, true);
    const wellMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      wireframe: true 
    });
    const well = new THREE.Mesh(wellGeo, wellMat);
    well.position.y = -10;
    scene.add(well);

    // 2. 动态水位线 (半透明蓝色平面)
    const waterGeo = new THREE.CylinderGeometry(7.9, 7.9, 1, 32);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.5, 
      shininess: 100 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);

    // 3. 水泵机组阵列 (4台机组)
    const pumps = new THREE.Group();
    const pumpGeo = new THREE.CylinderGeometry(0.8, 1, 3, 16);
    const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    
    for(let i=0; i<4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      const x = Math.cos(angle) * 4;
      const z = Math.sin(angle) * 4;
      
      const pumpGroup = new THREE.Group();
      const pumpBody = new THREE.Mesh(pumpGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
      const motorBody = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
      motorBody.position.y = 2.5;
      
      pumpGroup.add(pumpBody, motorBody);
      pumpGroup.position.set(x, -2, z);
      
      // 正在运行的水泵添加光环
      const glowGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.y = 1;
      glow.name = 'glow';
      pumpGroup.add(glow);
      
      pumps.add(pumpGroup);
    }
    scene.add(pumps);

    // 4. 排水管网 (线条展示)
    const pipePoints = [
        new THREE.Vector3(4, 0, 0),
        new THREE.Vector3(4, 10, 0),
        new THREE.Vector3(10, 10, 0)
    ];
    const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.2, 8, false);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // 5. 气流/水流粒子
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
      posArray[i*3] = (Math.random() - 0.5) * 6;
      posArray[i*3+1] = -15 + Math.random() * 25;
      posArray[i*3+2] = (Math.random() - 0.5) * 6;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(particlesGeo, particlesMat);
    scene.add(points);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x38bdf8, 2, 50);
    spotLight.position.set(0, 15, 0);
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentWaterLevel = propsRef.current.waterLevel;
      const currentActiveCount = propsRef.current.activeCount;

      // 水位线随输入动态调整
      const targetY = (currentWaterLevel / 10) * 15 - 15;
      water.position.y = THREE.MathUtils.lerp(water.position.y, targetY, 0.05);
      water.scale.set(1 + Math.sin(Date.now()*0.002)*0.02, 1, 1 + Math.sin(Date.now()*0.002)*0.02);

      // 运行中机组旋转模拟
      pumps.children.forEach((p, idx) => {
        const glow = p.getObjectByName('glow');
        if (glow) glow.visible = idx < currentActiveCount;
        
        if(idx < currentActiveCount) {
          p.rotation.y += 0.02;
          p.position.y = -2 + Math.sin(Date.now() * 0.005 + idx) * 0.1;
        } else {
          p.position.y = -2;
        }
      });

      // 粒子上升 (模拟气泡或水流)
      const positions = points.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
        positions[i*3+1] += 0.05;
        if(positions[i*3+1] > 10) positions[i*3+1] = -20;
      }
      points.geometry.attributes.position.needsUpdate = true;

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

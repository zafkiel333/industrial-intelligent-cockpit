import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ tanks?: any[], isMoving?: boolean }> = ({ tanks = [], isMoving = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ tanks, isMoving });
  useEffect(() => {
    propsRef.current = { tanks, isMoving };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);

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

    // 1. 船舶骨架 (Holographic Hull Section)
    const hullGroup = new THREE.Group();
    const hullGeo = new THREE.BoxGeometry(24, 6, 12);
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.1, 
      wireframe: true 
    });
    const hullFrame = new THREE.Mesh(hullGeo, hullMat);
    hullGroup.add(hullFrame);

    // 2. 压载舱阵列 (Tanks)
    const tankGroup = new THREE.Group();
    const tankGeo = new THREE.BoxGeometry(4, 4, 4);
    const waterGeo = new THREE.BoxGeometry(3.9, 4, 3.9);
    
    const tankPositions: [number, number, number][] = [
      [-8, -1, 3], [8, -1, 3],   // Fore Port/Starboard
      [-8, -1, -3], [8, -1, -3], // Aft Port/Starboard
      [0, -1, 0]                 // Mid
    ];

    const waterMeshes: THREE.Mesh[] = [];

    tankPositions.forEach((pos, i) => {
      const tankFrame = new THREE.Mesh(tankGeo, new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.3 }));
      tankFrame.position.set(...pos);
      tankGroup.add(tankFrame);

      const water = new THREE.Mesh(waterGeo, new THREE.MeshPhongMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.6,
        shininess: 100 
      }));
      water.position.set(pos[0], pos[1], pos[2]);
      water.scale.y = 0.5; // 默认液位 50%
      waterMeshes.push(water);
      tankGroup.add(water);
    });
    scene.add(tankGroup);

    // 3. 管路系统 (Piping System)
    const pipeGroup = new THREE.Group();
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const createPipe = (start: THREE.Vector3, end: THREE.Vector3) => {
      const distance = start.distanceTo(end);
      const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, distance, 8);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      
      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      pipe.position.copy(midpoint);
      pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      return pipe;
    };

    pipeGroup.add(createPipe(new THREE.Vector3(-8, -1, 0), new THREE.Vector3(8, -1, 0)));
    pipeGroup.add(createPipe(new THREE.Vector3(0, -1, -3), new THREE.Vector3(0, -1, 3)));
    scene.add(pipeGroup);

    // 4. 巡检扫描仪 (Scanning Robot)
    const scanner = new THREE.Group();
    scanner.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00f2ff })));
    const scanBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 1.5, 8, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    scanBeam.rotation.x = Math.PI / 2;
    scanBeam.position.z = 4;
    scanner.add(scanBeam);
    scene.add(scanner);

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    pLight.position.set(10, 15, 10);
    scene.add(pLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentTanks = propsRef.current.tanks;
      const currentIsMoving = propsRef.current.isMoving;

      // 模拟液位波动
      waterMeshes.forEach((m, idx) => {
        const targetLevel = currentTanks[idx] ? currentTanks[idx].level / 100 : 0.5;
        m.scale.y = THREE.MathUtils.lerp(m.scale.y, targetLevel + Math.sin(time + idx) * 0.05, 0.05);
        m.position.y = -1 - (2 * (1 - m.scale.y));
      });

      // 巡检器路径
      if (currentIsMoving) {
        scanner.position.x = Math.sin(time * 0.5) * 10;
        scanner.position.y = 3 + Math.sin(time) * 1;
        scanner.position.z = Math.cos(time * 0.5) * 5;
        scanner.lookAt(0, 0, 0);
      }

      // 扫描脉冲
      scanBeam.material.opacity = 0.1 + Math.abs(Math.sin(time * 4)) * 0.2;

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

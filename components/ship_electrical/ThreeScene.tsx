
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElectricalThreeProps } from './three-types';

export const ElectricalThreeScene: React.FC<ElectricalThreeProps> = ({
  parts,
  activePartId,
  onPartSelect,
  isPowerOn,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境背景 ---
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    // --- 电气机柜组 (Switchboard Rack) ---
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const interactiveMeshes: THREE.Mesh[] = [];

    // 创建机柜
    const createCabinet = (x: number, id: string, label: string) => {
      const cabinetGeo = new THREE.BoxGeometry(2, 6, 2);
      const cabinetMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
        transmission: viewMode === 'xray' ? 0.6 : 0
      });
      const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
      cabinet.position.set(x, 1, 0);
      cabinet.userData = { id, label };
      rackGroup.add(cabinet);
      interactiveMeshes.push(cabinet);

      // 内部组件 (模拟断路器等)
      if (viewMode !== 'physical') {
        for (let i = 0; i < 3; i++) {
          const compGeo = new THREE.BoxGeometry(1.6, 0.8, 1);
          const compMat = new THREE.MeshStandardMaterial({ 
            color: 0x475569,
            emissive: activePartId?.includes(id) ? 0x0ea5e9 : 0x000000,
            emissiveIntensity: 0.5
          });
          const comp = new THREE.Mesh(compGeo, compMat);
          comp.position.set(x, i * 1.5 - 0.5, 0.2);
          rackGroup.add(comp);
        }
      }
    };

    createCabinet(-3, 'RACK-G1', '发电机并网柜');
    createCabinet(0, 'RACK-MSB', '主配电中心');
    createCabinet(3, 'RACK-L1', '推进器配电柜');

    // --- 母排系统 (Busbars) ---
    const busbarPoints = [
      new THREE.Vector3(-5, 4, 0),
      new THREE.Vector3(0, 4, 0),
      new THREE.Vector3(5, 4, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(busbarPoints);
    const busbarGeo = new THREE.TubeGeometry(curve, 32, 0.1, 8, false);
    const busbarMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 1 });
    const busbar = new THREE.Mesh(busbarGeo, busbarMat);
    scene.add(busbar);

    // --- 电流微粒动画 ---
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) pPos[i] = 0;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.12, color: 0xfacc15, transparent: true, opacity: 0 });
    const electricity = new THREE.Points(pGeo, pMat);
    scene.add(electricity);

    const pData = Array.from({ length: particleCount }, () => ({
      t: Math.random(),
      speed: 0.005 + Math.random() * 0.005
    }));

    // --- 灯光 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 10, 5);
    scene.add(point);

    // --- 交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        onPartSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 电流流动逻辑
      if (isPowerOn) {
        pMat.opacity = 0.8;
        const positions = electricity.geometry.attributes.position.array as Float32Array;
        pData.forEach((p, i) => {
          p.t = (p.t + p.speed) % 1;
          const pos = curve.getPointAt(p.t);
          positions[i * 3] = pos.x;
          positions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.1;
          positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.1;
        });
        electricity.geometry.attributes.position.needsUpdate = true;
      } else {
        pMat.opacity = 0;
      }

      // 高亮逻辑
      interactiveMeshes.forEach(mesh => {
        if (mesh.userData.id === activePartId) {
          (mesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(0x0ea5e9);
          (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.4 + Math.sin(time * 4) * 0.2;
        } else {
          (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [activePartId, isPowerOn, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

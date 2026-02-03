
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AuxThreeProps } from './three-types';

export const AuxSystemThreeScene: React.FC<AuxThreeProps> = ({
  activeUnitId,
  units,
  flowIntensity,
  onUnitSelect,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 背景网格与光效 ---
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x38bdf8, 10, 50);
    point.position.set(10, 10, 10);
    scene.add(point);

    // --- 辅机单元构建 (核心：分油机模型) ---
    const unitsGroup = new THREE.Group();
    scene.add(unitsGroup);

    const selectableMeshes: THREE.Mesh[] = [];

    // 1. 分油机主体 (Separator)
    const createSeparator = (pos: [number, number, number], id: string) => {
      const group = new THREE.Group();
      group.position.set(...pos);

      // 基座
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.5, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      group.add(base);

      // 分离腔
      const bodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x475569,
        transparent: true,
        opacity: viewMode === 'xray' ? 0.3 : 0.9,
        metalness: 0.9,
        roughness: 0.1
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.5;
      body.userData = { id };
      group.add(body);
      selectableMeshes.push(body);

      // 顶部电机
      const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
      const motor = new THREE.Mesh(motorGeo, baseMat);
      motor.position.y = 3.2;
      group.add(motor);

      // 内部转鼓 (仅X-ray可见)
      if (viewMode === 'xray') {
        const bowlGeo = new THREE.ConeGeometry(0.9, 2, 32);
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.position.y = 1.5;
        group.add(bowl);
      }

      return group;
    };

    const separator1 = createSeparator([-5, 0, 0], 'AUX-SEP-01');
    const separator2 = createSeparator([0, 0, 0], 'AUX-SEP-02');
    unitsGroup.add(separator1, separator2);

    // 2. 管路系统 (Piping)
    const pipePoints = [
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(10, 0, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pipePoints);
    const pipeGeo = new THREE.TubeGeometry(curve, 64, 0.15, 8, false);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.5 });
    const pipes = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipes);

    // 3. 流体粒子 (Flow Particles)
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) pPos[i] = 0;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.12, color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    const flowParticles = new THREE.Points(pGeo, pMat);
    scene.add(flowParticles);

    const particleData = Array.from({ length: particleCount }, () => ({
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.003
    }));

    // --- 交互射束 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(selectableMeshes);
      if (intersects.length > 0) {
        onUnitSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 粒子流动逻辑
      if (viewMode === 'flow') {
        const positions = flowParticles.geometry.attributes.position.array as Float32Array;
        particleData.forEach((p, i) => {
          p.t = (p.t + p.speed * flowIntensity) % 1;
          const pos = curve.getPointAt(p.t);
          positions[i * 3] = pos.x;
          positions[i * 3 + 1] = pos.y + Math.sin(time + i) * 0.05;
          positions[i * 3 + 2] = pos.z;
        });
        flowParticles.geometry.attributes.position.needsUpdate = true;
        flowParticles.visible = true;
      } else {
        flowParticles.visible = false;
      }

      // 高亮逻辑
      selectableMeshes.forEach(mesh => {
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        if (mesh.userData.id === activeUnitId) {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.2;
        } else {
          mat.emissiveIntensity = 0;
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
  }, [activeUnitId, viewMode, flowIntensity]);

  return <div ref={mountRef} className="w-full h-full" />;
};

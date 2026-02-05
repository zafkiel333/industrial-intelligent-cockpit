
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CompEvalSceneProps } from './three-types';

export const HydroCompEvalThreeScene: React.FC<CompEvalSceneProps> = ({ 
  units, 
  selectedUnitId, 
  onUnitSelect,
  globalFlowIntensity,
  showRiskZones
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const unitsRef = useRef<THREE.Group[]>([]);
  const flowRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 25, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0x0ea5e9, 2, 100);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    // 地面网格 (电子感)
    const grid = new THREE.GridHelper(100, 40, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // 1. 机组集群生成
    unitsRef.current = [];
    units.forEach((u, i) => {
        const unitGroup = new THREE.Group();
        unitGroup.position.set(...u.position);
        unitGroup.userData = { id: u.id };

        // 核心机组几何 (简化塔型)
        const geo = new THREE.CylinderGeometry(1.5, 2, 6, 16);
        const color = u.status === 'normal' ? 0x10b981 : u.status === 'warning' ? 0xf59e0b : 0xef4444;
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x334155, 
            emissive: color, 
            emissiveIntensity: 0.2,
            metalness: 0.9,
            roughness: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        unitGroup.add(mesh);

        // 顶端全息环
        const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 3.5;
        unitGroup.add(ring);

        // 健康值光柱 (向上延伸)
        const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, u.health / 10, 16);
        beamGeo.translate(0, u.health / 20 + 3.5, 0);
        const beamMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        unitGroup.add(beam);

        scene.add(unitGroup);
        unitsRef.current.push(unitGroup);
    });

    // 2. 能量流动粒子 (水流 -> 电能)
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 80;
        pPos[i*3+1] = (Math.random()-0.5) * 5;
        pPos[i*3+2] = (Math.random()-0.5) * 80;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.15,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    flowRef.current = particles;
    scene.add(particles);

    // --- 交互逻辑 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(scene.children, true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && !target.userData.id) target = target.parent;
            if (target.userData.id) onUnitSelect(target.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- 动画 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 粒子流动
      if (flowRef.current) {
          const pos = flowRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+2] += globalFlowIntensity * 0.1;
              if (pos[i*3+2] > 40) pos[i*3+2] = -40;
          }
          flowRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 机组动画
      unitsRef.current.forEach((group, i) => {
          const id = group.userData.id;
          const u = units.find(item => item.id === id);
          const isSelected = selectedUnitId === id;
          
          // 选中高亮
          if (isSelected) {
              group.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
              group.children[1].rotation.z += 0.05; // 加速旋转全息环
          } else {
              group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
              group.children[1].rotation.z += 0.01;
          }

          // 风险呼吸感
          if (u?.status === 'critical') {
              const mat = (group.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
          }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [units, selectedUnitId, globalFlowIntensity]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WarehouseThreeProps } from './three-types';

export const WarehouseThreeScene: React.FC<WarehouseThreeProps> = ({ 
  bins, 
  stackerPos, 
  isMoving,
  activeId,
  onBinSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- 光照系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const mainLight = new THREE.DirectionalLight(0xdbeafe, 2.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x8b5cf6, 10, 50);
    fillLight.position.set(-15, 5, 5);
    scene.add(fillLight);

    // --- 货架与箱体 ---
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const boxMeshes: THREE.Mesh[] = [];
    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0
    });

    const boxGeo = new THREE.BoxGeometry(1, 0.6, 1);
    
    bins.forEach(bin => {
      const xPos = (bin.x - 5) * 1.2;
      const yPos = bin.y * 0.8;
      const zPos = bin.z * 1.2;

      // 货架框
      const frameGeo = new THREE.BoxGeometry(1.1, 0.1, 1.1);
      const frame = new THREE.Mesh(frameGeo, metalMat);
      frame.position.set(xPos, yPos - 0.35, zPos);
      rackGroup.add(frame);

      // 货物箱
      if (bin.type !== 'empty') {
        const color = bin.type === 'critical' ? 0xef4444 : 0x0ea5e9;
        const boxMat = new THREE.MeshStandardMaterial({ 
          color, 
          emissive: color, 
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.9
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(xPos, yPos, zPos);
        box.userData = { id: bin.id };
        rackGroup.add(box);
        boxMeshes.push(box);
      }
    });

    // --- 堆垛机 ---
    const stacker = new THREE.Group();
    scene.add(stacker);
    
    const mastGeo = new THREE.BoxGeometry(0.3, 10, 0.3);
    const mast = new THREE.Mesh(mastGeo, metalMat);
    mast.position.y = 4;
    stacker.add(mast);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
    stacker.add(platform);

    const laser = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 20, 8), 
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 })
    );
    laser.rotation.z = Math.PI / 2;
    platform.add(laser);

    // --- 射线拾取交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(boxMeshes);
      
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        onBinSelect(id);
      }
    };
    renderer.domElement.addEventListener('click', handleMouseClick);

    // --- 动画循环 ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      if (isMoving) {
          const targetX = (stackerPos.x - 5) * 1.2;
          const targetY = stackerPos.y * 0.8;
          stacker.position.x += (targetX - stacker.position.x) * 0.05;
          platform.position.y += (targetY - platform.position.y) * 0.05;
          (laser.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 20) * 0.2;
      } else {
          (laser.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      boxMeshes.forEach(box => {
          if (box.userData.id === activeId) {
             box.scale.setScalar(1.2 + Math.sin(time * 10) * 0.05);
             (box.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(time * 10);
          } else {
             box.scale.setScalar(1);
             (box.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
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
      renderer.domElement.removeEventListener('click', handleMouseClick);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [bins, stackerPos, isMoving, activeId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

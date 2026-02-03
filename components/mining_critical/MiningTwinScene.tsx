
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningTwinProps } from './three-types';

export const MiningTwinScene: React.FC<MiningTwinProps> = ({ 
  hotspots, 
  rotationSpeed, 
  activeId, 
  onNodeClick,
  showBlueprint
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 核心模型：截割头 (Cutterhead) ---
    const cutterGroup = new THREE.Group();
    scene.add(cutterGroup);

    // 主筒体
    const coneGeo = new THREE.CylinderGeometry(1, 3, 6, 32);
    const metalMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x333333, 
      metalness: 0.9, 
      roughness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const mainCone = new THREE.Mesh(coneGeo, metalMat);
    cutterGroup.add(mainCone);

    // 线框外层 (Blueprint mode)
    const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0xf59e0b, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
    });
    const wireCone = new THREE.Mesh(coneGeo, wireMat);
    wireCone.scale.setScalar(1.02);
    cutterGroup.add(wireCone);

    // 截齿 (Picks) - 分布在锥体表面
    const pickGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
    const pickMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    
    for (let i = 0; i < 48; i++) {
        const angle = i * 0.8;
        const radius = 1 + (i / 48) * 2;
        const y = -3 + (i / 48) * 6;
        const pick = new THREE.Mesh(pickGeo, pickMat);
        pick.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        pick.lookAt(new THREE.Vector3(0, y, 0));
        pick.rotateX(-Math.PI / 2);
        cutterGroup.add(pick);
    }

    // --- 磨损热力标记点 ---
    const markerMeshes: THREE.Mesh[] = [];
    hotspots.forEach(hp => {
        const geo = new THREE.SphereGeometry(0.3, 16, 16);
        const color = hp.intensity > 0.8 ? 0xef4444 : 0xf59e0b;
        const mat = new THREE.MeshPhongMaterial({ 
            color, 
            emissive: color, 
            emissiveIntensity: 1 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...hp.position);
        mesh.userData = { id: hp.id };
        
        // 增加扩散光环
        const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.lookAt(new THREE.Vector3(0,0,0));
        mesh.add(ring);

        cutterGroup.add(mesh);
        markerMeshes.push(mesh);
    });

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sun = new THREE.PointLight(0xf59e0b, 15, 50);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    // 交互逻辑
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markerMeshes);
        if (intersects.length > 0) onNodeClick(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      cutterGroup.rotation.y += rotationSpeed;
      wireCone.visible = showBlueprint;
      
      markerMeshes.forEach(m => {
          m.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
          if (m.userData.id === activeId) {
             m.scale.setScalar(1.5);
             (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 2 + Math.sin(time * 10);
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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [hotspots, rotationSpeed, activeId, showBlueprint]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

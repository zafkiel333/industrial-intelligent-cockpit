
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MetalStructureThreeProps } from './three-types';

export const MetalStructureScene: React.FC<MetalStructureThreeProps> = ({ 
  hotspots, 
  activeHotspotId, 
  onNodeClick,
  showStressMap,
  waterPressure
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020610, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8; // 高亮度设定
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业级光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const topLight = new THREE.DirectionalLight(0xffffff, 3.0);
    topLight.position.set(10, 30, 10);
    scene.add(topLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 15, 40);
    amberLight.position.set(-10, 5, 10);
    scene.add(amberLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 10, 30);
    blueLight.position.set(5, -5, -10);
    scene.add(blueLight);

    // --- 结构模型构建 ---
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    const steelMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const stressMat = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });

    // 建立主框架 (桁架结构模拟)
    for (let i = -2; i <= 2; i++) {
      const beamGeo = new THREE.BoxGeometry(12, 0.4, 0.4);
      const beam = new THREE.Mesh(beamGeo, steelMat);
      beam.position.y = i * 2;
      structureGroup.add(beam);

      const vertGeo = new THREE.BoxGeometry(0.4, 10, 0.4);
      const vert = new THREE.Mesh(vertGeo, steelMat);
      vert.position.x = i * 3;
      structureGroup.add(vert);
    }

    // --- 交互节点 ---
    const markers: THREE.Mesh[] = [];
    hotspots.forEach(hp => {
      const color = hp.status === 'corroded' ? 0xf59e0b : (hp.status === 'stressed' ? 0xef4444 : 0x10b981);
      const geo = hp.type === 'anode' ? new THREE.BoxGeometry(0.6, 0.3, 0.3) : new THREE.SphereGeometry(0.25, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...hp.position);
      mesh.userData = { id: hp.id };
      
      const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      structureGroup.add(mesh);
      markers.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers);
      if (intersects.length > 0) onNodeClick(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      structureGroup.rotation.y = Math.sin(frame * 0.2) * 0.1;
      
      markers.forEach(m => {
        const isActive = m.userData.id === activeHotspotId;
        m.scale.setScalar(isActive ? 1.5 + Math.sin(frame * 10) * 0.2 : 1 + Math.sin(frame * 2) * 0.05);
        if (m.children[0]) {
           m.children[0].scale.setScalar(1 + Math.sin(frame * 5) * 0.5);
           (m.children[0] as any).material.opacity = 0.3 - (m.children[0].scale.x - 1);
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
  }, [activeHotspotId, showStressMap, waterPressure]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningWearThreeProps } from './three-types';

export const WearPartScene: React.FC<MiningWearThreeProps> = ({ 
  activePartId, 
  scanProgress, 
  isAnalyzing,
  onNodeClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业光影方案 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // 顶部冷白工业射灯
    const spotLight = new THREE.SpotLight(0xffffff, 150);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.4;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // 侧向蓝色金属勾勒光
    const sideBlue = new THREE.PointLight(0x0ea5e9, 10, 30);
    sideBlue.position.set(-10, 5, -5);
    scene.add(sideBlue);

    // --- 衬板模型构建 ---
    const mantleGroup = new THREE.Group();
    scene.add(mantleGroup);

    // 材质：高锰钢质感
    const manganeseSteelMat = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 1,
      roughness: 0.3,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1
    });

    // 几何体：圆锥破动锥衬板
    const geometry = new THREE.CylinderGeometry(2, 5, 8, 48, 8, true);
    const mantle = new THREE.Mesh(geometry, manganeseSteelMat);
    mantle.castShadow = true;
    mantleGroup.add(mantle);

    // 内部结构线框 (Blueprint)
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const wire = new THREE.Mesh(geometry, wireMat);
    wire.scale.setScalar(1.01);
    mantleGroup.add(wire);

    // --- 扫描激光线 ---
    const scanLineGeo = new THREE.TorusGeometry(5.2, 0.05, 16, 100);
    const scanLineMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending 
    });
    const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
    scanLine.rotation.x = Math.PI / 2;
    scene.add(scanLine);

    // --- 磨损标记点 ---
    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);
    const hotspotsData = [
      { id: 'Z1', pos: [2, 1, 3], color: 0xef4444 },
      { id: 'Z2', pos: [-3, -2, 1], color: 0xf59e0b },
      { id: 'Z3', pos: [0, 3, -4], color: 0x10b981 },
    ];

    const markers: THREE.Mesh[] = [];
    hotspotsData.forEach(h => {
      const geo = new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ color: h.color, emissive: h.color, emissiveIntensity: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...h.pos as [number, number, number]);
      mesh.userData = { id: h.id };
      hotspotsGroup.add(mesh);
      markers.push(mesh);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      mantleGroup.rotation.y += 0.005;
      hotspotsGroup.rotation.y += 0.005;

      if (isAnalyzing) {
        scanLineMat.opacity = 0.6 + Math.sin(time * 10) * 0.4;
        scanLine.position.y = Math.sin(time * 2) * 4;
      } else {
        scanLineMat.opacity = 0;
      }

      // 标记点呼吸效果
      markers.forEach((m, i) => {
        const s = 1 + Math.sin(time * 4 + i) * 0.2;
        m.scale.setScalar(s);
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
  }, [isAnalyzing]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ lightIntensity?: number, isSync?: boolean }> = ({ 
  lightIntensity = 1,
  isSync = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ lightIntensity, isSync });
  useEffect(() => {
    propsRef.current = { lightIntensity, isSync };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

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

    // 1. 灯塔主体 (Lighthouse Structure)
    const towerGroup = new THREE.Group();
    
    // 塔基
    const baseGeo = new THREE.CylinderGeometry(3, 4, 2, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    towerGroup.add(base);

    // 塔身 (渐变半透明，体现科技感)
    const bodyGeo = new THREE.CylinderGeometry(1.5, 3, 10, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.2, 
      wireframe: true 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 6;
    towerGroup.add(body);

    // 灯室 (Lantern Room)
    const lanternGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.5, 16);
    const lanternMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transmission: 0.9, 
      thickness: 0.5, 
      roughness: 0.1 
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 12;
    towerGroup.add(lantern);

    // 核心光源 (Point Light)
    const beaconLight = new THREE.PointLight(0xfff700, 5 * lightIntensity, 50);
    beaconLight.position.set(0, 12, 0);
    scene.add(beaconLight);

    // 旋转光束 (Volumetric Beam)
    const beamGroup = new THREE.Group();
    beamGroup.position.y = 12;
    const beamGeo = new THREE.ConeGeometry(3, 30, 32, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 15);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0xfff700, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beamGroup.add(beam);
    scene.add(beamGroup);

    scene.add(towerGroup);

    // 2. 巡检指示点 (Inspection Points)
    const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
    const markers = [
      { pos: [0, 12.5, 1.9], label: '透镜' },
      { pos: [0, 11, 0], label: '光源' },
      { pos: [1.8, 13.5, 0], label: 'AIS天线' }
    ];
    markers.forEach(m => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(m.pos[0], m.pos[1], m.pos[2]);
      scene.add(marker);
      
      // 扫描环特效
      const ringGeo = new THREE.TorusGeometry(0.3, 0.02, 16, 100);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5 }));
      ring.position.copy(marker.position);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // 3. 环境背景 (海平面)
    const waterGeo = new THREE.PlaneGeometry(100, 100);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x020617, 
      transparent: true, 
      opacity: 0.8,
      shininess: 50
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    scene.add(water);

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dLight = new THREE.DirectionalLight(0x0ea5e9, 1);
    dLight.position.set(10, 20, 10);
    scene.add(dLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentLightIntensity = propsRef.current.lightIntensity;

      // 灯束旋转
      beamGroup.rotation.y += 0.02;
      
      // 模拟灯光闪烁 (Characteristic)
      const flash = (Math.sin(time * 2) > 0.5) ? 1 : 0.2;
      beamMat.opacity = 0.1 * flash * currentLightIntensity;
      beaconLight.intensity = 5 * flash * currentLightIntensity;

      // 海水微动
      water.position.y = -1 + Math.sin(time) * 0.05;

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


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WaterSurgeProps } from './three-types';

export const WaterSurgeThreeScene: React.FC<WaterSurgeProps> = ({
  waterLevel,
  surgeRate,
  pressureWavePos,
  vortexIntensity,
  isWarning,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const vortexRef = useRef<THREE.Group | null>(null);
  const pulseRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a192f, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 25, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.4);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(50, 100, 50);
    scene.add(mainLight);

    // 1. 地貌与大坝模型 (简化版)
    const terrainGeo = new THREE.BoxGeometry(40, 20, 60);
    const terrainMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const dam = new THREE.Mesh(terrainGeo, terrainMat);
    dam.position.y = -10;
    scene.add(dam);

    // 2. 引水管腔
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2, -10),
      new THREE.Vector3(0, -10, 5),
      new THREE.Vector3(0, -15, 20),
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 64, 2, 16, false);
    const pipeMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // 3. 水体 (Reservoir Water)
    const waterGeo = new THREE.BoxGeometry(40.1, 20, 30);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transmission: 0.7,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0, -15);
    waterRef.current = water;
    scene.add(water);

    // 4. 压力脉冲 (Internal Wave)
    const pulseGeo = new THREE.SphereGeometry(2.1, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4 });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulseRef.current = pulse;
    scene.add(pulse);

    // 5. 进水口旋涡
    const vortexGroup = new THREE.Group();
    vortexRef.current = vortexGroup;
    vortexGroup.position.set(0, 2, -10);
    scene.add(vortexGroup);
    
    for(let i=0; i<5; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1 + i * 0.2, 0.05, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 })
        );
        ring.rotation.x = Math.PI / 2;
        vortexGroup.add(ring);
    }

    // 动画
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 水位动态响应
      if (waterRef.current) {
        const targetHeightScale = waterLevel / 100;
        waterRef.current.scale.y = THREE.MathUtils.lerp(waterRef.current.scale.y, targetHeightScale, 0.05);
        waterRef.current.position.y = (waterRef.current.scale.y * 20) / 2 - 10;
        
        // 根据水位变率增加表面波浪
        (waterRef.current.material as THREE.MeshPhysicalMaterial).roughness = Math.abs(surgeRate) * 0.5;
      }

      // 压力波传递
      if (pulseRef.current) {
        const pt = pipeCurve.getPointAt(pressureWavePos);
        pulseRef.current.position.copy(pt);
        pulseRef.current.visible = Math.abs(surgeRate) > 0.2;
        pulseRef.current.scale.setScalar(1 + Math.sin(time * 20) * 0.2);
      }

      // 旋涡动画
      if (vortexRef.current) {
        vortexRef.current.visible = vortexIntensity > 0.1;
        vortexRef.current.children.forEach((r, i) => {
            r.rotation.z += 0.1 * (i + 1) * vortexIntensity;
            r.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.1);
        });
        vortexRef.current.position.y = waterRef.current ? waterRef.current.position.y + 10 : 2;
      }

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
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [waterLevel, surgeRate, pressureWavePos, vortexIntensity]);

  return <div ref={mountRef} className="w-full h-full" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PulsationSceneProps } from './three-types';

export const PulsationThreeScene: React.FC<PulsationSceneProps> = ({ 
  vortexIntensity,
  swirlSpeed,
  pressurePulse,
  isUnstableZone,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vortexRef = useRef<THREE.Mesh | null>(null);
  const bubblesRef = useRef<THREE.Points | null>(null);

  const vortexIntensityRef = useRef(vortexIntensity);
  const swirlSpeedRef = useRef(swirlSpeed);
  const pressurePulseRef = useRef(pressurePulse);
  const isUnstableZoneRef = useRef(isUnstableZone);
  const viewModeRef = useRef(viewMode);

  vortexIntensityRef.current = vortexIntensity;
  swirlSpeedRef.current = swirlSpeed;
  pressurePulseRef.current = pressurePulse;
  isUnstableZoneRef.current = isUnstableZone;
  viewModeRef.current = viewMode;

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-pulsation useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -6, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ===================== 灯光调整核心区域 =====================
    // 1. 环境光：提升基础亮度，保留原有色调
    const ambientLight = new THREE.AmbientLight(0x0ea5e9, 2.5); // 强度从1.2提升至2.5
    scene.add(ambientLight);

    // 新增半球光：增强环境光层次感，模拟水体上下光差
    const hemisphereLight = new THREE.HemisphereLight(0x0ea5e9, 0x075985, 1.8); // 天顶光/地面光匹配深水色调，强度1.8
    hemisphereLight.position.set(0, 5, 0);
    scene.add(hemisphereLight);

    // 2. 主聚光灯：提升强度+优化光照范围/柔和度
    const mainLight = new THREE.SpotLight(0x22d3ee, 25); // 强度从10提升至25
    mainLight.position.set(0, 10, 5);
    mainLight.distance = 50; // 增加光照距离（默认无限制，补充后光照范围更广）
    mainLight.angle = Math.PI / 3; // 扩大照射角度（默认PI/4）
    mainLight.penumbra = 0.5; // 增加半影效果（0-1），让光照过渡更柔和
    mainLight.decay = 1.2; // 优化衰减系数，让远近距离光照更自然
    scene.add(mainLight);

    // 3. 预警点光源：保留逻辑，仅优化基础参数（非核心亮度调整）
    const alertLight = new THREE.PointLight(0xef4444, 0, 20); // 光照范围从15扩至20
    alertLight.position.set(0, 0, 0);
    alertLight.decay = 1.5; // 衰减更自然
    scene.add(alertLight);
    // ==========================================================

    // 材质定义（完全保留原有逻辑，未修改任何色彩/透明度参数）
    const tubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });

    const vortexMat = new THREE.MeshPhongMaterial({
        color: 0x22d3ee,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        wireframe: viewModeRef.current === 'structure'
    });

    // 几何体构建（完全保留原有逻辑）
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const tubeGeo = new THREE.CylinderGeometry(2, 5, 8, 32, 1, true);
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    mainGroup.add(tube);

    const generateVortexPath = (intensity: number) => {
        const pts = [];
        for(let i=0; i<50; i++) {
            const t = i / 50;
            const radius = (1 - t) * intensity * 1.5;
            const angle = t * Math.PI * 4;
            pts.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                4 - t * 8,
                Math.sin(angle) * radius
            ));
        }
        return new THREE.CatmullRomCurve3(pts);
    };

    const vortexPath = generateVortexPath(vortexIntensityRef.current);
    const vortexGeo = new THREE.TubeGeometry(vortexPath, 64, 0.3, 8, false);
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortexRef.current = vortex;
    mainGroup.add(vortex);

    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*4;
        pPos[i*3+1] = (Math.random()-0.5)*8;
        pPos[i*3+2] = (Math.random()-0.5)*4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.3 });
    const bubbles = new THREE.Points(pGeo, pMat);
    bubblesRef.current = bubbles;
    mainGroup.add(bubbles);

    // 动画循环（完全保留原有逻辑）
    let frameId: number;
    let time = 0;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.01;
        controls.update();

        if (vortexRef.current) {
            vortexRef.current.rotation.y += swirlSpeedRef.current * 0.05;
            const shake = pressurePulseRef.current * 0.1;
            vortexRef.current.position.x = Math.sin(time * 20) * shake;
            vortexRef.current.position.z = Math.cos(time * 20) * shake;
            vortexRef.current.scale.set(1 + Math.sin(time*5)*0.05, 1, 1 + Math.sin(time*5)*0.05);
            
            if (vortexMat.wireframe !== (viewModeRef.current === 'structure')) {
                vortexMat.wireframe = viewModeRef.current === 'structure';
                vortexMat.needsUpdate = true;
            }
        }

        if (bubblesRef.current) {
            const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<pCount; i++) {
                positions[i*3+1] -= 0.05;
                if (positions[i*3+1] < -4) positions[i*3+1] = 4;
            }
            bubblesRef.current.geometry.attributes.position.needsUpdate = true;
            bubblesRef.current.visible = isUnstableZoneRef.current;
        }

        if (isUnstableZoneRef.current) {
            alertLight.intensity = 5 + Math.sin(time * 10) * 5;
        } else {
            alertLight.intensity = 0;
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
      tubeMat.dispose();
      vortexMat.dispose();
      pMat.dispose();
      tubeGeo.dispose();
      vortexGeo.dispose();
      pGeo.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
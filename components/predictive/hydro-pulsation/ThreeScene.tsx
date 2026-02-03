
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

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -6, 12); // 从侧下方观察尾水管内部
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光设计：模拟深水环境
    const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0x22d3ee, 10);
    mainLight.position.set(0, 10, 5);
    scene.add(mainLight);

    const alertLight = new THREE.PointLight(0xef4444, 0, 15);
    alertLight.position.set(0, 0, 0);
    scene.add(alertLight);

    // 材质定义
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
        wireframe: viewMode === 'structure'
    });

    // 几何体构建
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 尾水管锥体 (Draft Tube Cone)
    const tubeGeo = new THREE.CylinderGeometry(2, 5, 8, 32, 1, true);
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    mainGroup.add(tube);

    // 2. 核心：螺旋涡带 (Vortex Rope)
    // 使用螺旋线路径生成管状几何体
    const generateVortexPath = (intensity: number) => {
        const pts = [];
        for(let i=0; i<50; i++) {
            const t = i / 50;
            const radius = (1 - t) * intensity * 1.5;
            const angle = t * Math.PI * 4; // 2圈螺旋
            pts.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                4 - t * 8, // 从上往下
                Math.sin(angle) * radius
            ));
        }
        return new THREE.CatmullRomCurve3(pts);
    };

    const vortexPath = generateVortexPath(vortexIntensity);
    const vortexGeo = new THREE.TubeGeometry(vortexPath, 64, 0.3, 8, false);
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortexRef.current = vortex;
    mainGroup.add(vortex);

    // 3. 空化气泡粒子 (Cavitation Bubbles)
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

    // 动画循环
    let frameId: number;
    let time = 0;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.01;
        controls.update();

        // 涡带旋转与形态抖动
        if (vortexRef.current) {
            vortexRef.current.rotation.y += swirlSpeed * 0.05;
            // 模拟压力脉动引起的振动
            const shake = pressurePulse * 0.1;
            vortexRef.current.position.x = Math.sin(time * 20) * shake;
            vortexRef.current.position.z = Math.cos(time * 20) * shake;
            
            // 动态更新涡带强度（通过缩放模拟）
            vortexRef.current.scale.set(1 + Math.sin(time*5)*0.05, 1, 1 + Math.sin(time*5)*0.05);
        }

        // 气泡飘动
        if (bubblesRef.current) {
            const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<pCount; i++) {
                positions[i*3+1] -= 0.05; // 水流向下
                if (positions[i*3+1] < -4) positions[i*3+1] = 4;
            }
            bubblesRef.current.geometry.attributes.position.needsUpdate = true;
            bubblesRef.current.visible = isUnstableZone;
        }

        // 危险区预警灯光
        if (isUnstableZone) {
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
    };
  }, [vortexIntensity, swirlSpeed, pressurePulse, isUnstableZone, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

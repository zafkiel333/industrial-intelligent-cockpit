import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SwitchboardAnimatables } from './three-types';

interface ThreeSceneProps {
  hotspotIntensity?: number; // 0-1
  isScanning?: boolean;
  phaseLoads?: [number, number, number]; // A, B, C 相负荷
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  hotspotIntensity = 0.3, 
  isScanning = true,
  phaseLoads = [0.7, 0.75, 0.65]
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业光影环境 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SwitchboardAnimatables = { 
        contactBolts: new Map(), 
        thermalClouds: new THREE.Group() 
    };
    const disposables: any[] = [];

    // --- 1. 铜母排 (Copper Busbars) ---
    const barGeo = new THREE.BoxGeometry(0.2, 0.8, 8);
    const colors = [0xd97706, 0xeab308, 0x0ea5e9]; // A(黄), B(绿), C(红) 的科技变体配色
    
    for(let i=0; i<3; i++) {
        const barMat = new THREE.MeshStandardMaterial({ 
            color: 0xcd7f32, 
            metalness: 0.9, 
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.x = (i - 1) * 1.5;
        group.add(bar);
        
        // 2. 连接螺栓 (Contact Bolts) - PM的核心监测点
        const boltGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
        const boltMatNormal = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const boltMatHot = new THREE.MeshStandardMaterial({ 
            color: 0xff4400, 
            emissive: 0xff0000, 
            emissiveIntensity: 0.8 
        });

        for(let j=0; j<4; j++) {
            const isHot = (i === 1 && j === 2); // 模拟 B 相第 3 个接点过热
            const bolt = new THREE.Mesh(boltGeo, isHot && hotspotIntensity > 0.5 ? boltMatHot : boltMatNormal);
            bolt.position.set((i - 1) * 1.5, 0, (j - 1.5) * 2);
            bolt.rotation.z = Math.PI / 2;
            group.add(bolt);
            
            if(isHot) {
                const heatGeo = new THREE.SphereGeometry(0.5, 16, 16);
                const heatMat = new THREE.MeshBasicMaterial({ 
                    color: 0xff0000, 
                    transparent: true, 
                    opacity: 0 
                });
                const heatCloud = new THREE.Mesh(heatGeo, heatMat);
                heatCloud.position.copy(bolt.position);
                animatables.thermalClouds?.add(heatCloud);
                disposables.push(heatGeo, heatMat);
            }
        }
        disposables.push(barGeo, barMat, boltGeo, boltMatNormal, boltMatHot);
    }
    group.add(animatables.thermalClouds!);

    // --- 3. 扫描激光面 (Infrared Scanner) ---
    const scanGeo = new THREE.PlaneGeometry(5, 0.05);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.x = Math.PI / 2;
    group.add(scanner);
    animatables.scanningRay = scanner;
    disposables.push(scanGeo, scanMat);

    // --- 4. 电子流粒子 (Electron Flow) ---
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.floor(Math.random() * 3) - 1) * 1.5;
        pPos[i*3+1] = (Math.random() - 0.5) * 0.7;
        pPos[i*3+2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.03, transparent: true, opacity: 0.4 });
    const electrons = new THREE.Points(pGeo, pMat);
    group.add(electrons);
    animatables.electronFlow = electrons;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 扫描线移动
      if (isScanning && animatables.scanningRay) {
          animatables.scanningRay.position.z = Math.sin(time * 1.5) * 4;
      }

      // 热点脉动
      if (animatables.thermalClouds) {
          animatables.thermalClouds.children.forEach(c => {
              const mesh = c as THREE.Mesh;
              const mat = mesh.material as THREE.MeshBasicMaterial;
              mat.opacity = (0.2 + Math.sin(time * 5) * 0.2) * hotspotIntensity;
              mesh.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
          });
      }

      // 电子流移动 (模拟电流)
      if (animatables.electronFlow) {
          const pos = animatables.electronFlow.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+2] += 0.05;
              if (pos[i*3+2] > 4) pos[i*3+2] = -4;
          }
          animatables.electronFlow.geometry.attributes.position.needsUpdate = true;
      }

      group.rotation.y = Math.sin(time * 0.2) * 0.2;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [hotspotIntensity, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
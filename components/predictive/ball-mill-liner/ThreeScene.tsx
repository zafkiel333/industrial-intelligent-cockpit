
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LinerAnimatables } from './three-types';

interface ThreeSceneProps {
  wearFactor?: number; // 0 (new) to 1 (worn out)
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearFactor = 0.3,
  isScanning = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ball-mill-liner useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业级全方位照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0xf97316, 15, 30);
    accentLight.position.set(-5, 2, 5);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: LinerAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 筒体剖面 (Shell Section) ---
    const shellGeo = new THREE.CylinderGeometry(5.2, 5.2, 12, 64, 1, true, 0, Math.PI);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        side: THREE.DoubleSide, 
        metalness: 0.8, 
        roughness: 0.4 
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);
    disposables.push(shellGeo, shellMat);

    // --- 2. 衬板组 (Liner Blocks) ---
    const linerGroup = new THREE.Group();
    group.add(linerGroup);
    animatables.linerGroup = linerGroup;

    const createLinerBlock = (angle: number, zPos: number, wear: number) => {
        // 根据磨损度计算颜色：0(蓝) -> 1(红)
        const hue = (1 - wear) * 0.6; // 0.6 is blue, 0 is red
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        
        // 阶梯衬板形状
        const shapeGeo = new THREE.BoxGeometry(1.2, 0.6 * (1 - wear * 0.7), 1.5);
        const shapeMat = new THREE.MeshStandardMaterial({ 
            color: color,
            metalness: 0.9,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: wear > 0.6 ? (wear - 0.6) * 2 : 0
        });
        const block = new THREE.Mesh(shapeGeo, shapeMat);
        
        // 沿圆周排列
        const radius = 4.8;
        block.position.set(
            zPos,
            Math.sin(angle) * radius,
            Math.cos(angle) * radius
        );
        block.rotation.x = angle;
        return block;
    };

    // 铺设 10x8 的衬板阵列
    for(let z = -5; z <= 5; z += 1.5) {
        for(let a = 0; a < Math.PI; a += 0.4) {
            // 模拟不同位置磨损不均
            const localWear = Math.min(1, wearFactor + (Math.random() * 0.1) + (Math.abs(z)/15));
            linerGroup.add(createLinerBlock(a, z, localWear));
        }
    }

    // --- 3. 激光扫描面 ---
    const scanGeo = new THREE.PlaneGeometry(0.1, 10);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x00f2ff, 
        transparent: true, 
        opacity: 0.4, 
        side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.z = Math.PI / 2;
    scanPlane.position.y = 1;
    group.add(scanPlane);
    animatables.scanningLine = scanPlane;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体缓慢自转模拟工作
      group.rotation.x = -0.4;
      
      // 扫描线移动
      if (isScanning && animatables.scanningLine) {
          animatables.scanningLine.position.x = Math.sin(time) * 5.5;
          animatables.scanningLine.visible = true;
      } else if (animatables.scanningLine) {
          animatables.scanningLine.visible = false;
      }

      // 衬板高亮脉动
      if (wearFactor > 0.7) {
          linerGroup.children.forEach((b: any) => {
              if (b.material.emissiveIntensity > 0) {
                  b.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.5;
              }
          });
      }

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
  }, [wearFactor, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

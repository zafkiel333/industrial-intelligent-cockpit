
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineRulAnimatables, ComponentLifeState } from './three-types';

interface ThreeSceneProps {
  components: ComponentLifeState[];
  globalIntensity?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  components,
  globalIntensity = 1.0 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 18);

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

    // --- 高级工业级光影 (解决光线不正常问题) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    // 主光源：模拟上方射灯
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 20, 10);
    topLight.castShadow = true;
    scene.add(topLight);

    // 侧光源：科技蓝调
    const bluePoint = new THREE.PointLight(0x0ea5e9, 10, 50);
    bluePoint.position.set(-10, 5, 5);
    scene.add(bluePoint);

    // 氛围补光：紫红色提示风险
    const riskLight = new THREE.PointLight(0xef4444, 2, 20);
    riskLight.position.set(0, -5, 0);
    scene.add(riskLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: EngineRulAnimatables = { components: new Map() };
    const disposables: any[] = [];

    // --- 1. 数字化透明机壳 ---
    const blockGeo = new THREE.BoxGeometry(10, 5, 4);
    const blockMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    mainGroup.add(block);
    disposables.push(blockGeo, blockMat);

    // --- 2. 关键核心部件构建 ---
    const componentGeos = {
        crankshaft: new THREE.CylinderGeometry(0.5, 0.5, 9, 32),
        piston: new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32),
        bearing: new THREE.TorusGeometry(0.7, 0.15, 16, 32)
    };

    components.forEach((comp, idx) => {
        // 根据RUL寿命计算颜色映射 (Green -> Yellow -> Red)
        const color = new THREE.Color();
        if (comp.remainingLife > 0.7) color.setHex(0x10b981); // 极草绿
        else if (comp.remainingLife > 0.4) color.setHex(0xf59e0b); // 琥珀黄
        else color.setHex(0xef4444); // 炽热红

        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 0.3 + (1 - comp.remainingLife) * 1.5,
            metalness: 0.8,
            roughness: 0.2
        });

        let mesh: THREE.Mesh;
        if (comp.id === 'crank') {
            mesh = new THREE.Mesh(componentGeos.crankshaft, mat);
            mesh.rotation.z = Math.PI / 2;
            mesh.position.y = -1.5;
        } else {
            mesh = new THREE.Mesh(componentGeos.piston, mat);
            mesh.position.set((idx - 2.5) * 1.8, 1, 0);
        }

        mainGroup.add(mesh);
        animatables.components?.set(comp.id, mesh);
        disposables.push(mat);
    });

    // --- 3. 动态寿命扫描环 ---
    const scanGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(7, 0.05, 8, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scanGroup.add(ring);
    scene.add(scanGroup);
    animatables.scanningRing = scanGroup;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体漂浮
      mainGroup.position.y = Math.sin(time * 0.5) * 0.3;
      mainGroup.rotation.y += 0.001;

      // 扫描环上下移动
      if (animatables.scanningRing) {
          animatables.scanningRing.position.y = Math.sin(time * 1.2) * 5;
      }

      // 部件寿命律动
      animatables.components?.forEach((mesh, id) => {
          const comp = components.find(c => c.id === id);
          if (comp && comp.remainingLife < 0.4) {
              const pulse = 1 + Math.sin(time * 10) * 0.05;
              mesh.scale.setScalar(pulse);
          }
      });

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
      Object.values(componentGeos).forEach(g => g.dispose());
      renderer.dispose();
    };
  }, [components, globalIntensity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

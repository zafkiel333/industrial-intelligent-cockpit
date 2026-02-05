
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BrakeAnimatables } from './three-types';

interface ThreeSceneProps {
  clampingStrength?: number; // 0 to 1
  isBraking?: boolean;
  discTemp?: number; // 0 to 1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  clampingStrength = 0,
  isBraking = false,
  discTemp = 0.2
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

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

    // --- 高动态照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    rimLight.position.set(-10, 5, -5);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BrakeAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 制动盘 (Disc) ---
    const discGeo = new THREE.CylinderGeometry(6, 6, 0.5, 64);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 1.0, 
        roughness: 0.1,
        emissive: 0xff0000,
        emissiveIntensity: discTemp * 0.5
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    group.add(disc);
    animatables.disc = disc;
    disposables.push(discGeo, discMat);

    // --- 2. 制动闸瓦单元 (Brake Shoe Units) ---
    const createShoeUnit = (xPos: number) => {
        const shoeGroup = new THREE.Group();
        shoeGroup.position.x = xPos;

        // Piston House
        const houseGeo = new THREE.BoxGeometry(2, 2, 3);
        const houseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const house = new THREE.Mesh(houseGeo, houseMat);
        shoeGroup.add(house);

        // Piston
        const pistonGeo = new THREE.CylinderGeometry(0.6, 0.6, 1, 32);
        pistonGeo.rotateZ(Math.PI / 2);
        const piston = new THREE.Mesh(pistonGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        piston.position.x = xPos > 0 ? -0.8 : 0.8;
        shoeGroup.add(piston);

        // Shoe Plate
        const plateGeo = new THREE.BoxGeometry(0.2, 1.8, 2.5);
        const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
        plate.position.x = xPos > 0 ? -1.4 : 1.4;
        shoeGroup.add(plate);

        return { shoeGroup, piston };
    };

    const leftUnit = createShoeUnit(-4);
    const rightUnit = createShoeUnit(4);
    group.add(leftUnit.shoeGroup, rightUnit.shoeGroup);
    animatables.shoeLeft = leftUnit.shoeGroup;
    animatables.shoeRight = rightUnit.shoeGroup;

    // --- 3. 摩擦生热辉光 ---
    const glowGeo = new THREE.TorusGeometry(5.8, 0.2, 16, 100);
    glowGeo.rotateY(Math.PI / 2);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);
    animatables.heatGlow = glow;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 制动盘匀速转动
      if (animatables.disc) {
          animatables.disc.rotation.z += isBraking ? 0.005 : 0.02;
      }

      // 夹紧位移模拟 (微位移)
      const targetGap = isBraking ? 0.8 : 0;
      if (animatables.shoeLeft && animatables.shoeRight) {
          animatables.shoeLeft.position.x = -4 + targetGap;
          animatables.shoeRight.position.x = 4 - targetGap;
      }

      // 摩擦生热视觉效果
      if (animatables.heatGlow) {
          (animatables.heatGlow.material as THREE.MeshBasicMaterial).opacity = isBraking ? 0.4 + Math.sin(time * 10) * 0.2 : 0;
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
  }, [isBraking, discTemp]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

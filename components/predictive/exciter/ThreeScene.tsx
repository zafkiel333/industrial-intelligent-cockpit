
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExciterAnimatables } from './three-types';

interface ThreeSceneProps {
  intensity?: number; // 0 to 1
  isSyncing?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  intensity = 0.4,
  isSyncing = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0x2dd4bf, 50, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ExciterAnimatables = {};
    const disposables: any[] = [];

    // --- Build Exciter Model ---
    
    // 1. Main Casing (Translucent)
    const casingGeo = new THREE.BoxGeometry(6, 3, 4);
    const casingMat = new THREE.MeshStandardMaterial({ 
        color: 0x134e4a, 
        transparent: true, 
        opacity: 0.3,
        wireframe: true
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    group.add(casing);
    animatables.casing = casing;
    disposables.push(casingGeo, casingMat);

    // 2. Twin Shafts with Eccentric Weights
    const createShaft = (posZ: number) => {
        const sGroup = new THREE.Group();
        sGroup.position.z = posZ;
        
        // Central Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 5, 16);
        shaftGeo.rotateZ(Math.PI / 2);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        sGroup.add(shaft);
        
        // Eccentric Mass (The Block)
        const blockGeo = new THREE.BoxGeometry(1.5, 0.8, 0.8);
        blockGeo.translate(0.75, 0, 0); // Offset for eccentricity
        const blockMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, metalness: 1.0, roughness: 0.2 });
        const block = new THREE.Mesh(blockGeo, blockMat);
        sGroup.add(block);
        
        return sGroup;
    };

    const shaftA = createShaft(-1);
    const shaftB = createShaft(1);
    group.add(shaftA, shaftB);
    animatables.shaftA = shaftA;
    animatables.shaftB = shaftB;

    // 3. Force Vector Arrow
    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 2, 0);
    const arrow = new THREE.ArrowHelper(dir, origin, 2, 0x14b8a6);
    group.add(arrow);
    animatables.forceVector = arrow;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Shaft Rotation (Counter-rotating for exciter)
      if (animatables.shaftA && animatables.shaftB) {
          const speed = 10;
          animatables.shaftA.rotation.x += speed * 0.02;
          animatables.shaftB.rotation.x -= speed * 0.02;
          
          // Casing Vibration simulation
          const vibAmount = intensity * 0.1;
          animatables.casing!.position.y = Math.sin(time * speed * 2) * vibAmount;
          
          // Force vector intensity
          animatables.forceVector!.setLength(1 + Math.abs(Math.sin(time * speed)) * intensity * 2);
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [intensity, isSyncing]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

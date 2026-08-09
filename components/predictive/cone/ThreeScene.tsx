
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConeAnimatables } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0 (new) to 1 (worn out)
  isExploded?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.3,
  isExploded = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===cone useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
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

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const spotLight = new THREE.SpotLight(0x0ea5e9, 200, 50, Math.PI/4);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ConeAnimatables = {};
    const disposables: any[] = [];

    // --- Create Cone Crusher Parts using LatheGeometry for accuracy ---
    
    // 1. Concave (Outer Liner) - Fixed Bowl
    const createConcave = (wear: number) => {
        const points = [];
        // Profile of the bowl (inner surface)
        for (let i = 0; i <= 10; i++) {
            const y = (i - 5) * 0.8;
            // Radius increases with wear (thinning)
            const r = 3 + (i * 0.15) + (wear * 0.2); 
            points.push(new THREE.Vector2(r, y));
        }
        const geo = new THREE.LatheGeometry(points, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x334155, 
            side: THREE.DoubleSide, 
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        return new THREE.Mesh(geo, mat);
    };

    const concave = createConcave(wearLevel);
    group.add(concave);
    animatables.concave = concave;

    // 2. Mantle (Inner Liner) - Moving Head
    const createMantle = (wear: number) => {
        const points = [];
        for (let i = 0; i <= 10; i++) {
            const y = (i - 5) * 0.8;
            // Radius decreases with wear (thinning)
            const r = 1 + (i * 0.25) - (wear * 0.15); 
            points.push(new THREE.Vector2(r, y));
        }
        const geo = new THREE.LatheGeometry(points, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: wear > 0.7 ? 0xef4444 : 0x0ea5e9, 
            metalness: 0.8, 
            roughness: 0.2,
            emissive: wear > 0.7 ? 0x450a0a : 0x075985,
            emissiveIntensity: 0.5
        });
        return new THREE.Mesh(geo, mat);
    };

    const mantle = createMantle(wearLevel);
    mantle.position.y = 0.5; // Offset vertically
    group.add(mantle);
    animatables.mantle = mantle;

    // 3. Main Shaft (Visual only)
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.7, 8, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = -1;
    group.add(shaft);

    // 4. Particle System (Crushed Material)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*5;
        pPos[i*3+1] = 2 + Math.random()*5;
        pPos[i*3+2] = (Math.random()-0.5)*5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.08 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.particles = particles;

    // Animation logic
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Cone nutation (wobble) animation
      if (animatables.mantle) {
          animatables.mantle.rotation.z = Math.sin(time * 4) * 0.08;
          animatables.mantle.rotation.x = Math.cos(time * 4) * 0.08;
      }

      // Material flow
      if (animatables.particles) {
          const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] -= 0.1; // Fall down
              // Collision check with cone walls (simplified)
              if (pos[i*3+1] < -3) {
                  pos[i*3] = (Math.random()-0.5)*2;
                  pos[i*3+1] = 4;
                  pos[i*3+2] = (Math.random()-0.5)*2;
              }
          }
          animatables.particles.geometry.attributes.position.needsUpdate = true;
      }

      if (controls) controls.update();
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
  }, [wearLevel, isExploded]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

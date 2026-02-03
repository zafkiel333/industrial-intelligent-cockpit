import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LubricationThreeProps } from './three-types';

export const LubricationThreeScene: React.FC<LubricationThreeProps> = ({ 
  level = 0.7, 
  color = '#f59e0b', 
  isFlowing = true,
  viscosity = 0.5 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Subtle fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Objects ---

    // 1. Tank Glass Shell
    const tankGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transmission: 0.9, 
      opacity: 0.3, 
      metalness: 0, 
      roughness: 0, 
      ior: 1.5, 
      thickness: 0.1,
      transparent: true,
      side: THREE.DoubleSide
    });
    const tank = new THREE.Mesh(tankGeo, glassMat);
    scene.add(tank);

    // Tank Cap & Base
    const capGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.2, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const cap = new THREE.Mesh(capGeo, metalMat);
    cap.position.y = 3.1;
    scene.add(cap);
    const base = new THREE.Mesh(capGeo, metalMat);
    base.position.y = -3.1;
    scene.add(base);

    // 2. Liquid Fluid
    const liquidGeo = new THREE.CylinderGeometry(2.4, 2.4, 6 * level, 32);
    liquidGeo.translate(0, -3 + (3 * level), 0); // Align bottom to tank bottom
    const liquidMat = new THREE.MeshPhysicalMaterial({ 
      color: new THREE.Color(color), 
      metalness: 0.1, 
      roughness: 0.1,
      transmission: 0.2, // Semi-transparent fluid
      opacity: 0.9,
      transparent: true,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.2
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    scene.add(liquid);

    // 3. Bubbles (Viscosity Simulation)
    const bubbleCount = 30;
    const bubblesGroup = new THREE.Group();
    scene.add(bubblesGroup);
    
    for(let i=0; i<bubbleCount; i++) {
        const bg = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
        const bm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
        const bubble = new THREE.Mesh(bg, bm);
        bubble.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 4
        );
        // Only inside tank radius approx
        if (Math.hypot(bubble.position.x, bubble.position.z) > 2.2) {
            bubble.position.x *= 0.5;
            bubble.position.z *= 0.5;
        }
        bubblesGroup.add(bubble);
        (bubble as any).userData = { speed: 0.02 + Math.random() * 0.05 };
    }

    // 4. Pipes
    const pipePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, -2, 0),
        new THREE.Vector3(4, -2, 0),
        new THREE.Vector3(4, 4, 0),
        new THREE.Vector3(2.5, 4, 0)
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipePath, 20, 0.2, 8, false);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    const fluidLight = new THREE.PointLight(color, 2, 10);
    fluidLight.position.set(0, 0, 0);
    scene.add(fluidLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate bubbles
      if (isFlowing) {
          bubblesGroup.children.forEach(b => {
              b.position.y += (b as any).userData.speed * (1 / viscosity);
              if (b.position.y > 3 * level - 3) { // Reset if above liquid surface
                  b.position.y = -3;
              }
          });
      }

      // Gentle liquid surface bobbing
      liquid.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.005);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [level, color, isFlowing, viscosity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
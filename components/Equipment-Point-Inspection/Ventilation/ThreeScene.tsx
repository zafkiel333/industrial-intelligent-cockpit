import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ speed?: number }> = ({ speed = 1.0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ speed });
  useEffect(() => {
    propsRef.current = { speed };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 15, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 井口基座
    const baseGeo = new THREE.CylinderGeometry(4, 5, 2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1;
    scene.add(base);

    // 2. 垂直井筒 (半透明透视)
    const shaftGeo = new THREE.CylinderGeometry(3.5, 3.5, 20, 32, 1, true);
    const shaftMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      wireframe: true 
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = -11;
    scene.add(shaft);

    // 3. 巨型风机叶片
    const fanGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.2, 0.05, 3);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for(let i=0; i<4; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (i * Math.PI) / 2;
      blade.position.set(Math.cos(blade.rotation.y)*1.5, 0, Math.sin(blade.rotation.y)*1.5);
      fanGroup.add(blade);
    }
    fanGroup.position.y = 0.2;
    scene.add(fanGroup);

    // 4. 气流粒子系统
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
      posArray[i*3] = (Math.random() - 0.5) * 6;
      posArray[i*3+1] = Math.random() * -20;
      posArray[i*3+2] = (Math.random() - 0.5) * 6;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ 
      color: 0x00ffcc, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending 
    });
    const flowParticles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(flowParticles);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x0ea5e9, 2, 30);
    spotLight.position.set(0, 10, 0);
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentSpeed = propsRef.current.speed;

      // 风机旋转
      fanGroup.rotation.y += 0.05 * currentSpeed;

      // 粒子上升 (模拟排风)
      const positions = flowParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
        positions[i*3+1] += 0.05 * currentSpeed;
        if(positions[i*3+1] > 2) {
          positions[i*3+1] = -20;
          positions[i*3] = (Math.random() - 0.5) * 6;
          positions[i*3+2] = (Math.random() - 0.5) * 6;
        }
      }
      flowParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

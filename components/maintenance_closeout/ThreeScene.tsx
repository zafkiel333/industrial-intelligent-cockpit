import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CloseoutThreeProps } from './three-types';

export const CloseoutThreeScene: React.FC<CloseoutThreeProps> = ({ 
  isClosing = false, 
  status = 'pending' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // The Archive Cube (Lattice of points)
    const geometry = new THREE.BoxGeometry(3, 3, 3, 10, 10, 10);
    const material = new THREE.PointsMaterial({ 
      color: status === 'success' ? 0x10b981 : 0x0ea5e9, 
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const cubePoints = new THREE.Points(geometry, material);
    scene.add(cubePoints);

    // Inner Core
    const coreGeo = new THREE.OctahedronGeometry(1, 0);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: status === 'success' ? 0x10b981 : 0x334155, 
      emissive: status === 'success' ? 0x10b981 : 0x000000,
      emissiveIntensity: 0.5,
      wireframe: true 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Scanning Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Particles for closing effect
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x10b981, size: 0.02, transparent: true, opacity: 0 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 5, 20);
    point.position.set(2, 5, 2);
    scene.add(point);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.02;

      cubePoints.rotation.y += 0.002;
      cubePoints.rotation.x += 0.001;
      core.rotation.z -= 0.01;
      
      // Animate Ring
      ring.position.y = Math.sin(frame) * 2;
      ring.scale.setScalar(1 + Math.cos(frame) * 0.2);

      // Closing Animation
      if (isClosing) {
          particlesMat.opacity = Math.min(1, particlesMat.opacity + 0.05);
          const positions = particlesGeo.attributes.position.array as Float32Array;
          for(let i=0; i < particlesCount; i++) {
              const i3 = i * 3;
              // Move towards center
              positions[i3] *= 0.95;
              positions[i3+1] *= 0.95;
              positions[i3+2] *= 0.95;
          }
          particlesGeo.attributes.position.needsUpdate = true;
          cubePoints.scale.setScalar(Math.max(0.1, cubePoints.scale.x * 0.98));
          core.scale.setScalar(1 + Math.sin(frame * 10) * 0.2);
          coreMat.emissiveIntensity = 2;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [isClosing, status]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
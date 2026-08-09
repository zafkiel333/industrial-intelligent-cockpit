import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StandardCodingThreeProps } from './three-types';

export const StandardCodingScene: React.FC<StandardCodingThreeProps> = ({ 
  codingFactor, 
  partType,
  isProcessing 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isProcessing;

    // --- 工业几何体 (作为标准化的对象) ---
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);

    let geometry;
    if (partType === 'valve') {
      geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
    } else if (partType === 'sensor') {
      geometry = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    } else {
      geometry = new THREE.TorusGeometry(1.5, 0.6, 16, 100);
    }

    // 原始状态：噪点材质
    const rawMaterial = new THREE.MeshPhongMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const rawMesh = new THREE.Mesh(geometry, rawMaterial);
    objectGroup.add(rawMesh);

    // 标准化状态：高科技材质
    const stdMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 1,
      transparent: true,
      opacity: 0
    });
    const stdMesh = new THREE.Mesh(geometry, stdMaterial);
    stdMesh.scale.setScalar(1.01);
    objectGroup.add(stdMesh);

    // --- 编码扫描光环 ---
    const ringGeo = new THREE.TorusGeometry(3, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // --- 粒子流 (模拟数据属性) ---
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 10;
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0x10b981, transparent: true, opacity: 0.4 });
    const points = new THREE.Points(particlesGeo, particlesMat);
    scene.add(points);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 5, 5);
    scene.add(point);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 随着编码进度变化
      stdMaterial.opacity = codingFactor * 0.6;
      rawMaterial.opacity = (1 - codingFactor) * 0.4;
      
      if (isProcessing) {
        ringMat.opacity = 0.5 + Math.sin(time * 5) * 0.3;
        ring.position.y = Math.sin(time * 2) * 3;
        points.rotation.y += 0.02;
        // 粒子向中心坍缩效果
        const pos = particlesGeo.attributes.position.array as Float32Array;
        for(let i=0; i<particlesCount; i++) {
           const i3 = i * 3;
           pos[i3] *= 0.98;
           pos[i3+1] *= 0.98;
           pos[i3+2] *= 0.98;
           if (Math.abs(pos[i3]) < 0.1) {
              pos[i3] = (Math.random() - 0.5) * 10;
              pos[i3+1] = (Math.random() - 0.5) * 10;
              pos[i3+2] = (Math.random() - 0.5) * 10;
           }
        }
        particlesGeo.attributes.position.needsUpdate = true;
      } else {
        ringMat.opacity = 0;
        points.rotation.y += 0.002;
      }

      objectGroup.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [partType, isProcessing, codingFactor]);

  return <div ref={mountRef} className="w-full h-full" />;
};
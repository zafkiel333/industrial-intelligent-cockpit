import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DamSeepageMonitoringProps } from './three-types';

export const ThreeScene: React.FC<DamSeepageMonitoringProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  // Update ref when props change to avoid re-initializing the scene
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Cleanup existing canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // Grid helper for sci-fi feel
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x003333);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    
    // Dam structure
    const damGeometry = new THREE.BoxGeometry(10, 8, 4);
    const damMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a3b4c, 
      transparent: true, 
      opacity: 0.8,
      wireframe: true 
    });
    const dam = new THREE.Mesh(damGeometry, damMaterial);
    scene.add(dam);

    // Seepage particles
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Sensor nodes
    const nodes = new THREE.Group();
    for(let i=0; i<5; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, 2);
      nodes.add(node);
    }
    scene.add(nodes);

    const animateScene = (time) => {
      const { status, maintenanceProgress = 0 } = propsRef.current;
      
      dam.rotation.y = Math.sin(time * 0.2) * 0.1;
      
      // Update particles based on maintenance progress
      const positions = particlesGeometry.attributes.position.array;
      for(let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.02 * (1 - maintenanceProgress / 100);
        if (positions[i] < -4) positions[i] = 4;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      
      particlesMaterial.opacity = 0.6 * (1 - maintenanceProgress / 100);

      // Node colors based on status
      nodes.children.forEach((node, i) => {
        const mat = node.material;
        if (status === '维护中') {
          mat.color.setHex(0xffff00);
          node.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.2);
        } else if (status === '正常') {
          mat.color.setHex(0x00ff00);
          node.scale.setScalar(1);
        } else {
          mat.color.setHex(0xff3366);
          node.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.1);
        }
      });
      
      // Dam color based on progress
      damMaterial.color.setHSL(0.6, 0.5, 0.2 + (maintenanceProgress / 100) * 0.3);
    };
    

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      animateScene(time);
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
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
      
      // Dispose resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array ensures initialization only happens once

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

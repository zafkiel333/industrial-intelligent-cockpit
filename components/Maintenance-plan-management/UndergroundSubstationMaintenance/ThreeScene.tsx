import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UndergroundSubstationMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<UndergroundSubstationMaintenanceProps> = (props) => {
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

    
    // Transformer
    const transGeo = new THREE.BoxGeometry(4, 6, 4);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.7, roughness: 0.3 });
    const transformer = new THREE.Mesh(transGeo, transMat);
    scene.add(transformer);

    // Coils
    const coilGeo = new THREE.CylinderGeometry(0.5, 0.5, 6.5, 16);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.1 });
    for(let i=-1; i<=1; i+=2) {
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(i * 2.5, 0, 0);
      scene.add(coil);
    }

    // Electric Arcs
    const arcCount = 5;
    const arcs = new THREE.Group();
    const arcMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    for(let i=0; i<arcCount; i++) {
      const arcGeo = new THREE.BufferGeometry();
      const arcPos = new Float32Array(30); // 10 points
      arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
      const arc = new THREE.Line(arcGeo, arcMat);
      arcs.add(arc);
    }
    scene.add(arcs);

    const animateScene = (time) => {
      const { voltage = 0, temperature = 0, status } = propsRef.current;
      
      // Transformer heat glow
      transMat.emissive.setHex(0xff0000);
      transMat.emissiveIntensity = (temperature / 100) * 0.5;

      // Arcs animation based on voltage
      arcs.children.forEach((arc, i) => {
        const positions = arc.geometry.attributes.position.array;
        for(let j=0; j<10; j++) {
          positions[j*3] = (Math.random() - 0.5) * 6;
          positions[j*3+1] = (Math.random() - 0.5) * 8;
          positions[j*3+2] = (Math.random() - 0.5) * 6;
        }
        arc.geometry.attributes.position.needsUpdate = true;
        arc.visible = Math.random() < (voltage / 20000);
      });

      if (status === '维护中') {
        transMat.color.setHex(0xffff00);
        arcMat.color.setHex(0xffff00);
      } else if (status === '异常') {
        transMat.color.setHex(0xff0000);
        arcMat.color.setHex(0xff0000);
      } else {
        transMat.color.setHex(0x223344);
        arcMat.color.setHex(0x00ffff);
      }
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

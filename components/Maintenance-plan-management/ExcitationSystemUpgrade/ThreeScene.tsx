import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExcitationSystemUpgradeProps } from './three-types';

export const ThreeScene: React.FC<ExcitationSystemUpgradeProps> = (props) => {
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

    
    // Cabinet
    const cabinetGeo = new THREE.BoxGeometry(4, 8, 3);
    const cabinetMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    scene.add(cabinet);

    // Internal components
    const components = new THREE.Group();
    for(let i=0; i<6; i++) {
      const compGeo = new THREE.BoxGeometry(3, 0.8, 2);
      const compMat = new THREE.MeshStandardMaterial({ color: 0x334455 });
      const comp = new THREE.Mesh(compGeo, compMat);
      comp.position.y = -3 + i * 1.2;
      components.add(comp);
    }
    scene.add(components);

    // Energy arcs
    const arcGeo = new THREE.TorusGeometry(2.5, 0.05, 16, 100);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
    const arc1 = new THREE.Mesh(arcGeo, arcMat);
    const arc2 = new THREE.Mesh(arcGeo, arcMat);
    arc1.rotation.x = Math.PI / 2;
    arc2.rotation.y = Math.PI / 2;
    scene.add(arc1);
    scene.add(arc2);

    const animateScene = (time) => {
      const { status, upgradeProgress = 0 } = propsRef.current;
      
      cabinet.rotation.y = Math.sin(time * 0.5) * 0.2;
      components.rotation.y = Math.sin(time * 0.5) * 0.2;

      arc1.rotation.z = time * 2;
      arc2.rotation.x = time * 2;

      if (status === '升级中') {
        const progressRatio = upgradeProgress / 100;
        
        components.children.forEach((comp, i) => {
          const isUpgraded = (i / 6) < progressRatio;
          comp.material.color.setHex(isUpgraded ? 0x00ff88 : 0x334455);
          comp.scale.setScalar(isUpgraded ? 1.05 : 1);
        });

        arcMat.color.setHex(0xffaa00);
        arcMat.opacity = 0.8 + Math.sin(time * 20) * 0.2;
        arc1.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
      } else {
        components.children.forEach(comp => comp.material.color.setHex(0x00ff88));
        arcMat.color.setHex(0x00ffff);
        arcMat.opacity = 0.4;
        arc1.scale.setScalar(1);
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

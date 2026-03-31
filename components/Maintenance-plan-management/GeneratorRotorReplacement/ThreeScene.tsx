import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GeneratorRotorReplacementProps } from './three-types';

export const ThreeScene: React.FC<GeneratorRotorReplacementProps> = (props) => {
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

    
    // Stator (outer ring)
    const statorGeo = new THREE.TorusGeometry(4, 1, 32, 64);
    const statorMat = new THREE.MeshStandardMaterial({ 
      color: 0x334455, 
      metalness: 0.7,
      wireframe: true 
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.x = Math.PI / 2;
    scene.add(stator);

    // Rotor (inner cylinder)
    const rotorGeo = new THREE.CylinderGeometry(2.8, 2.8, 4, 32);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9, roughness: 0.2 });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    scene.add(rotor);

    // Crane hook
    const hookGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 16);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.y = 8;
    scene.add(hook);

    // Connection lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(0, 2, 0)
    ]);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    const animateScene = (time) => {
      const { rotorPosition = 0, status, maintenanceProgress = 0 } = propsRef.current;
      
      scene.rotation.y = time * 0.2;

      // Rotor position (0 is inside stator, 100 is fully lifted)
      const targetY = (rotorPosition / 100) * 8;
      rotor.position.y += (targetY - rotor.position.y) * 0.1;

      if (status === '更换中') {
        hook.position.y = rotor.position.y + 5;
        lineMat.opacity = 0.8;
        lineGeo.setFromPoints([
          new THREE.Vector3(0, hook.position.y - 5, 0),
          new THREE.Vector3(0, rotor.position.y + 2, 0)
        ]);
        
        rotorMat.color.setHSL(0.1, 1, 0.5 + Math.sin(time * 10) * 0.2);
      } else {
        hook.position.y = 12;
        lineMat.opacity = 0;
        rotorMat.color.setHex(0xffaa00);
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

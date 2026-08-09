import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConveyorBeltSplicingProps } from './three-types';

export const ThreeScene: React.FC<ConveyorBeltSplicingProps> = (props) => {
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

    
    // Rollers
    const rollers = new THREE.Group();
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.5 });
    
    for(let i=-5; i<=5; i+=2) {
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.position.x = i;
      roller.rotation.x = Math.PI / 2;
      rollers.add(roller);
    }
    scene.add(rollers);

    // Belt
    const beltGeo = new THREE.BoxGeometry(12, 0.1, 3.8);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.55;
    scene.add(belt);

    // Splicing joint (highlighted)
    const jointGeo = new THREE.BoxGeometry(1, 0.12, 3.8);
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0x552200 });
    const joint = new THREE.Mesh(jointGeo, jointMat);
    joint.position.y = 0.56;
    scene.add(joint);

    // Vulcanizing machine (appears during splicing)
    const machineGeo = new THREE.BoxGeometry(2, 2, 4.5);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0xcc3300, metalness: 0.7, transparent: true, opacity: 0 });
    const machine = new THREE.Mesh(machineGeo, machineMat);
    machine.position.y = 1.5;
    scene.add(machine);

    const animateScene = (time) => {
      const { beltSpeed = 2, tension = 50, status } = propsRef.current;
      
      scene.rotation.y = time * 0.1;
      scene.rotation.x = Math.PI / 6;

      if (status === '硫化中') {
        machineMat.opacity = 0.8;
        joint.position.x = 0;
        jointMat.emissive.setHex(0xff5500);
        jointMat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.5;
      } else {
        machineMat.opacity = 0;
        jointMat.emissive.setHex(0x000000);
        
        // Move belt
        const speed = beltSpeed * 0.05;
        joint.position.x += speed;
        if (joint.position.x > 6) joint.position.x = -6;
        
        // Rotate rollers
        rollers.children.forEach(r => r.rotation.y += speed * 2);
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

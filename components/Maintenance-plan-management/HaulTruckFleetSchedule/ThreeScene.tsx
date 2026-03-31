import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HaulTruckFleetScheduleProps } from './three-types';

export const ThreeScene: React.FC<HaulTruckFleetScheduleProps> = (props) => {
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

    
    // Fleet group
    const fleet = new THREE.Group();
    scene.add(fleet);

    const trucks = [];
    const truckGeo = new THREE.BoxGeometry(2, 1, 1);
    const truckMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.6, roughness: 0.4 });

    for(let i=0; i<20; i++) {
      const truck = new THREE.Mesh(truckGeo, truckMat.clone());
      const angle = (i / 20) * Math.PI * 2;
      const radius = 8 + Math.random() * 2;
      truck.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      truck.rotation.y = -angle;
      truck.userData = { angle, radius, speed: 0.5 + Math.random() * 0.5 };
      trucks.push(truck);
      fleet.add(truck);
    }

    // Central Hub
    const hubGeo = new THREE.CylinderGeometry(3, 3, 2, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    scene.add(hub);

    const animateScene = (time) => {
      const { activeTrucks = 0, efficiency = 0, status } = propsRef.current;
      
      trucks.forEach((truck, i) => {
        if (i < activeTrucks) {
          truck.visible = true;
          truck.userData.angle += truck.userData.speed * (efficiency / 100) * 0.02;
          truck.position.x = Math.cos(truck.userData.angle) * truck.userData.radius;
          truck.position.z = Math.sin(truck.userData.angle) * truck.userData.radius;
          truck.rotation.y = -truck.userData.angle;
          
          if (status === '调度异常') {
            truck.material.color.setHex(0xff0000);
          } else if (status === '维护中') {
            truck.material.color.setHex(0xffff00);
          } else {
            truck.material.color.setHex(0x00aaff);
          }
        } else {
          truck.visible = false;
        }
      });
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

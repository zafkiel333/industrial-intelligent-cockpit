import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydraulicHoistMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<HydraulicHoistMaintenanceProps> = (props) => {
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

    
    // Cylinder
    const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
    const cylinderMat = new THREE.MeshStandardMaterial({ 
      color: 0x223344, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.6
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    scene.add(cylinder);

    // Piston
    const pistonGeo = new THREE.CylinderGeometry(1.4, 1.4, 8, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.1 });
    const piston = new THREE.Mesh(pistonGeo, pistonMat);
    scene.add(piston);

    // Oil particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) {
      pPos[i] = (Math.random() - 0.5) * 2.8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.1, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Maintenance rings
    const rings = new THREE.Group();
    for(let i=0; i<3; i++) {
      const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -3 + i * 3;
      rings.add(ring);
    }
    scene.add(rings);

    const animateScene = (time) => {
      const { pressure = 0, status, maintenanceProgress = 0 } = propsRef.current;
      
      scene.rotation.y = time * 0.3;
      scene.rotation.z = Math.sin(time * 0.5) * 0.1;

      // Piston moves based on pressure
      const targetY = (pressure / 20) * 4;
      piston.position.y += (targetY - piston.position.y) * 0.1;

      // Oil particles stay below piston
      const positions = pGeo.attributes.position.array;
      for(let i=1; i<pCount*3; i+=3) {
        if (positions[i] > piston.position.y - 4) {
          positions[i] = -4;
        } else {
          positions[i] += 0.05;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      if (status === '维保中') {
        cylinderMat.color.setHex(0x334466);
        rings.children.forEach((ring, i) => {
          ring.material.opacity = 0.5 + Math.sin(time * 5 + i) * 0.5;
          ring.position.y = -4 + ((maintenanceProgress / 100) * 8 + i) % 8;
        });
      } else {
        cylinderMat.color.setHex(0x223344);
        rings.children.forEach(ring => ring.material.opacity = 0);
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

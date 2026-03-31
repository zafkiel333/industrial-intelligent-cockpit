import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BallMillGearLubricationProps } from './three-types';

export const ThreeScene: React.FC<BallMillGearLubricationProps> = (props) => {
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

    
    // Mill Cylinder
    const millGeo = new THREE.CylinderGeometry(3, 3, 8, 32);
    const millMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.6, roughness: 0.4 });
    const mill = new THREE.Mesh(millGeo, millMat);
    mill.rotation.z = Math.PI / 2;
    scene.add(mill);

    // Large Gear (Girth Gear)
    const gearGeo = new THREE.TorusGeometry(3.2, 0.4, 16, 64);
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x778899, metalness: 0.9 });
    const gear = new THREE.Mesh(gearGeo, gearMat);
    gear.rotation.y = Math.PI / 2;
    scene.add(gear);

    // Pinion Gear
    const pinionGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
    const pinion = new THREE.Mesh(pinionGeo, gearMat);
    pinion.position.set(0, -3.8, 0);
    pinion.rotation.x = Math.PI / 2;
    pinion.rotation.z = Math.PI / 2;
    scene.add(pinion);

    // Lubrication Spray
    const sprayGeo = new THREE.ConeGeometry(0.5, 2, 16);
    const sprayMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const spray = new THREE.Mesh(sprayGeo, sprayMat);
    spray.position.set(0, -2.5, 0);
    scene.add(spray);

    // Oil particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 100;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 0.5;
      pPos[i*3+1] = -2.5 - Math.random() * 1.5;
      pPos[i*3+2] = (Math.random() - 0.5) * 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.1, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const animateScene = (time) => {
      const { oilLevel = 50, temperature = 40, status } = propsRef.current;
      
      scene.rotation.y = time * 0.2;
      scene.rotation.z = Math.PI / 12;

      if (status === '保养中') {
        mill.rotation.x = 0;
        gear.rotation.z = 0;
        pinion.rotation.y = 0;
        
        sprayMat.opacity = 0.8 + Math.sin(time * 10) * 0.2;
        pMat.opacity = 0.8;
        
        // Spray animation
        const positions = pGeo.attributes.position.array;
        for(let i=1; i<pCount*3; i+=3) {
          positions[i] -= 0.1;
          if(positions[i] < -4) positions[i] = -2.5;
        }
        pGeo.attributes.position.needsUpdate = true;
      } else {
        mill.rotation.x += 0.02;
        gear.rotation.z -= 0.02;
        pinion.rotation.y += 0.08; // Pinion rotates faster
        
        sprayMat.opacity = (oilLevel / 100) * 0.3;
        pMat.opacity = (oilLevel / 100) * 0.3;
      }

      // Gear color based on temperature
      if (temperature > 70) {
        gearMat.emissive.setHex(0x550000);
      } else {
        gearMat.emissive.setHex(0x000000);
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

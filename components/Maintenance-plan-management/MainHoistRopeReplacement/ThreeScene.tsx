import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MainHoistRopeReplacementProps } from './three-types';

export const ThreeScene: React.FC<MainHoistRopeReplacementProps> = (props) => {
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

    
    // Hoist Wheel
    const wheelGeo = new THREE.CylinderGeometry(4, 4, 1, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    scene.add(wheel);

    // Spokes
    for(let i=0; i<6; i++) {
      const spokeGeo = new THREE.BoxGeometry(0.5, 8, 0.5);
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.rotation.z = (Math.PI / 3) * i;
      wheel.add(spoke);
    }

    // Rope
    const ropeGeo = new THREE.CylinderGeometry(0.2, 0.2, 20, 16);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, wireframe: true });
    const rope1 = new THREE.Mesh(ropeGeo, ropeMat);
    rope1.position.set(-4, -10, 0);
    scene.add(rope1);
    
    const rope2 = new THREE.Mesh(ropeGeo, ropeMat);
    rope2.position.set(4, -10, 0);
    scene.add(rope2);

    // Glowing particles along rope
    const pGeo = new THREE.BufferGeometry();
    const pCount = 100;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
      pPos[i*3] = -4;
      pPos[i*3+1] = (Math.random() - 0.5) * 20 - 10;
      pPos[i*3+2] = (Math.random() - 0.5) * 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.2, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const animateScene = (time) => {
      const { ropeTension = 50, wearLevel = 0, status } = propsRef.current;
      
      const speed = status === '更换中' ? 0 : 0.05;
      wheel.rotation.z -= speed;

      // Move particles
      const positions = pGeo.attributes.position.array;
      for(let i=1; i<pCount*3; i+=3) {
        positions[i] += speed * 10;
        if(positions[i] > 0) positions[i] = -20;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Rope color based on wear level
      const wearColor = new THREE.Color().setHSL(0.3 - (wearLevel/100)*0.3, 1, 0.5);
      ropeMat.color.copy(wearColor);
      
      if (status === '更换中') {
        pMat.color.setHex(0xffaa00);
      } else {
        pMat.color.setHex(0x00ffff);
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

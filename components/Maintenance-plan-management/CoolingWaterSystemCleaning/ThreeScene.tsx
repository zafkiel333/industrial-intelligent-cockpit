import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CoolingWaterSystemCleaningProps } from './three-types';

export const ThreeScene: React.FC<CoolingWaterSystemCleaningProps> = (props) => {
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

    
    // Pipe network
    const pipes = new THREE.Group();
    const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x445566, 
      metalness: 0.6, 
      roughness: 0.4,
      transparent: true,
      opacity: 0.7
    });

    const createPipe = (x, y, z, rotZ) => {
      const geo = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
      const pipe = new THREE.Mesh(geo, pipeMat);
      pipe.position.set(x, y, z);
      pipe.rotation.z = rotZ;
      pipes.add(pipe);
    };

    createPipe(-2, 0, 0, 0);
    createPipe(2, 0, 0, 0);
    createPipe(0, 4, 0, Math.PI / 2);
    createPipe(0, -4, 0, Math.PI / 2);
    scene.add(pipes);

    // Water particles inside pipes
    const particleCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 6;
      pPos[i*3+1] = (Math.random() - 0.5) * 8;
      pPos[i*3+2] = (Math.random() - 0.5) * 0.8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.2, color: 0x00aaff, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const animateScene = (time) => {
      const { status, cleaningProgress = 0 } = propsRef.current;
      
      pipes.rotation.y = time * 0.2;
      particles.rotation.y = time * 0.2;

      // Particle flow
      const positions = pGeo.attributes.position.array;
      const speed = status === '清洗中' ? 0.1 + (cleaningProgress/100)*0.2 : 0.05;
      
      for(let i=1; i<particleCount*3; i+=3) {
        positions[i] -= speed;
        if(positions[i] < -4) positions[i] = 4;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Color change based on progress
      if (status === '清洗中') {
        const cleanColor = new THREE.Color(0x00ffff);
        const dirtyColor = new THREE.Color(0x8b4513);
        pipeMat.color.lerpColors(dirtyColor, cleanColor, cleaningProgress / 100);
        pMat.color.lerpColors(new THREE.Color(0x556622), new THREE.Color(0x00aaff), cleaningProgress / 100);
      } else if (status === '正常') {
        pipeMat.color.setHex(0x445566);
        pMat.color.setHex(0x00aaff);
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

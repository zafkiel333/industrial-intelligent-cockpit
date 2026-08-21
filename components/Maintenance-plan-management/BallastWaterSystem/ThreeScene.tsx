import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BallastWaterSystemProps } from './three-types';

export const ThreeScene: React.FC<BallastWaterSystemProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const systemGroup = new THREE.Group();

    // Main Pipe
    const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, 20, 32);
    const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x223344, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.6 // Semi-transparent to see water/UV
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    systemGroup.add(pipe);

    // Filter Unit (Left)
    const filterGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32);
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.4 });
    const filter = new THREE.Mesh(filterGeo, filterMat);
    filter.position.set(-6, 0, 0);
    filter.rotation.z = Math.PI / 2;
    systemGroup.add(filter);

    // UV Reactor Unit (Right)
    const uvGeo = new THREE.CylinderGeometry(2, 2, 8, 32);
    const uvMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.9, roughness: 0.1 });
    const uvReactor = new THREE.Mesh(uvGeo, uvMat);
    uvReactor.position.set(4, 0, 0);
    uvReactor.rotation.z = Math.PI / 2;
    systemGroup.add(uvReactor);

    // UV Lamps (Inside Reactor)
    const lampGeo = new THREE.CylinderGeometry(0.2, 0.2, 7, 16);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan glow
    const lamps: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.rotation.z = Math.PI / 2;
      const angle = (i * Math.PI) / 2;
      lamp.position.set(4, Math.sin(angle) * 1, Math.cos(angle) * 1);
      lamps.push(lamp);
      systemGroup.add(lamp);
    }

    // Water Flow Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        particlePos[i] = (Math.random() - 0.5) * 20; // x
        particlePos[i+1] = (Math.random() - 0.5) * 2.5; // y
        particlePos[i+2] = (Math.random() - 0.5) * 2.5; // z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x0088ff,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const waterParticles = new THREE.Points(particleGeo, particleMat);
    systemGroup.add(waterParticles);

    // Backwash Drain Pipe
    const drainGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 16);
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x552222, metalness: 0.6 });
    const drain = new THREE.Mesh(drainGeo, drainMat);
    drain.position.set(-6, -4, 0);
    systemGroup.add(drain);

    scene.add(systemGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x0055ff, 0x001133);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { flowRate, uvIntensity, isBackwashing } = propsRef.current;

      // UV Lamp Intensity
      const uvColor = new THREE.Color(0x002244).lerp(new THREE.Color(0x00ffff), uvIntensity / 100);
      lamps.forEach(lamp => {
        lamp.material.color.copy(uvColor);
      });

      // Water Flow Animation
      const positions = waterParticles.geometry.attributes.position.array as Float32Array;
      const speed = isBackwashing ? -2 : (flowRate / 1000) * 10; // Reverse flow if backwashing

      for(let i=0; i < particleCount; i++) {
          positions[i*3] += speed * delta;
          
          if (isBackwashing) {
              // Particles go down the drain
              if (positions[i*3] < -5 && positions[i*3] > -7) {
                  positions[i*3+1] -= 5 * delta;
              }
              // Reset if out of bounds
              if (positions[i*3+1] < -8 || positions[i*3] < -10) {
                  positions[i*3] = 10;
                  positions[i*3+1] = (Math.random() - 0.5) * 2.5;
              }
              particleMat.color.setHex(0xaa5533); // Dirty water color
          } else {
              // Normal flow left to right
              if (positions[i*3] > 10) {
                  positions[i*3] = -10;
                  positions[i*3+1] = (Math.random() - 0.5) * 2.5;
              }
              particleMat.color.setHex(0x0088ff); // Clean water color
          }
      }
      waterParticles.geometry.attributes.position.needsUpdate = true;

      // Filter shake effect during backwash
      if (isBackwashing) {
          filter.position.x = -6 + Math.sin(time * 20) * 0.05;
          filterMat.color.setHex(0x553322);
      } else {
          filter.position.x = -6;
          filterMat.color.setHex(0x334455);
      }

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
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      
      cancelAnimationFrame(animationId);
      renderer.dispose();
      pipeGeo.dispose();
      pipeMat.dispose();
      filterGeo.dispose();
      filterMat.dispose();
      uvGeo.dispose();
      uvMat.dispose();
      lampGeo.dispose();
      lampMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      drainGeo.dispose();
      drainMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlotationMachineRotorProps } from './three-types';

export const ThreeScene: React.FC<FlotationMachineRotorProps> = (props) => {
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

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x00ffff, 2);
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x0088ff, 1.5, 50);
    blueLight.position.set(10, -5, 10);
    scene.add(blueLight);

    const tankGeo = new THREE.CylinderGeometry(6, 6, 10, 32, 1, true);
    const tankMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    scene.add(tank);

    const statorGeo = new THREE.CylinderGeometry(4.5, 4.5, 3, 16, 1, true);
    const statorMat = new THREE.MeshStandardMaterial({ 
      color: 0x445566,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.position.y = -2;
    scene.add(stator);

    const rotorGroup = new THREE.Group();
    rotorGroup.position.y = -2;
    
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 4;
    rotorGroup.add(shaft);

    const bladeGeo = new THREE.BoxGeometry(7, 1, 0.2);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.5 });
    
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (Math.PI / 2) * i;
      rotorGroup.add(blade);
    }
    
    scene.add(rotorGroup);

    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { rotorSpeed, wearLevel, isReplacing } = propsRef.current;

      if (isReplacing) {
        rotorGroup.position.y = -2 + Math.sin(time * 2) * 2 + 2;
        statorMat.color.setHex(0xffaa00);
        bladeMat.color.setHex(0xff5500);
        particles.visible = false;
      } else {
        rotorGroup.position.y = -2;
        rotorGroup.rotation.y += rotorSpeed * delta;
        
        const wearColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff3300), wearLevel / 100);
        bladeMat.color.copy(wearColor);
        statorMat.color.setHex(0x445566);
        
        particles.visible = true;
        const positions = particleGeo.attributes.position.array as Float32Array;
        for(let i = 1; i < particleCount * 3; i += 3) {
          positions[i] += 0.05 + Math.random() * 0.05;
          if (positions[i] > 5) {
            positions[i] = -5;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
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
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      tankGeo.dispose();
      tankMat.dispose();
      statorGeo.dispose();
      statorMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

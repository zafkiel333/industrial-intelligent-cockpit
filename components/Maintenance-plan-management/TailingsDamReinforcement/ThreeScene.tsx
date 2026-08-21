import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TailingsDamReinforcementProps } from './three-types';

export const ThreeScene: React.FC<TailingsDamReinforcementProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffcc88, 1.2);
    dirLight.position.set(20, 30, 10);
    scene.add(dirLight);

    // Original Dam (Base)
    const damShape = new THREE.Shape();
    damShape.moveTo(-15, -5);
    damShape.lineTo(15, -5);
    damShape.lineTo(5, 5);
    damShape.lineTo(-5, 5);
    damShape.lineTo(-15, -5);

    const extrudeSettings = { depth: 20, bevelEnabled: false };
    const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
    
    // Center the geometry
    damGeo.computeBoundingBox();
    const centerOffset = -0.5 * (damGeo.boundingBox!.max.z - damGeo.boundingBox!.min.z);
    damGeo.translate(0, 0, centerOffset);

    const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x554433, 
      roughness: 0.9,
      metalness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const dam = new THREE.Mesh(damGeo, damMat);
    scene.add(dam);

    // Tailings Pond (Water/Sludge behind dam)
    const pondGeo = new THREE.BoxGeometry(10, 8, 20);
    const pondMat = new THREE.MeshStandardMaterial({ 
      color: 0x224433, 
      transparent: true, 
      opacity: 0.7 
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(-10, -1, 0);
    scene.add(pond);

    // Reinforcement Layer (Dynamic)
    const reinfShape = new THREE.Shape();
    reinfShape.moveTo(5, 5);
    reinfShape.lineTo(15, -5);
    reinfShape.lineTo(20, -5);
    reinfShape.lineTo(10, 5);
    reinfShape.lineTo(5, 5);

    const reinfGeo = new THREE.ExtrudeGeometry(reinfShape, extrudeSettings);
    reinfGeo.translate(0, 0, centerOffset);
    
    const reinfMat = new THREE.MeshStandardMaterial({ 
      color: 0xffaa00, 
      roughness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    const reinforcement = new THREE.Mesh(reinfGeo, reinfMat);
    scene.add(reinforcement);

    // Seepage Indicators (Particles)
    const seepageGeo = new THREE.BufferGeometry();
    const seepageCount = 200;
    const posArray = new Float32Array(seepageCount * 3);
    for(let i = 0; i < seepageCount * 3; i+=3) {
      posArray[i] = 10 + Math.random() * 5; // x (downstream face)
      posArray[i+1] = -5 + Math.random() * 8; // y (height)
      posArray[i+2] = (Math.random() - 0.5) * 20; // z (width)
    }
    seepageGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const seepageMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const seepageParticles = new THREE.Points(seepageGeo, seepageMat);
    scene.add(seepageParticles);

    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ffcc, 0x003344);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const { progress, seepageLevel, isReinforcing } = propsRef.current;

      // Animate reinforcement layer based on progress
      // Scale it up from bottom to top
      const scaleY = Math.max(0.01, progress / 100);
      reinforcement.scale.set(1, scaleY, 1);
      reinforcement.position.y = -5 * (1 - scaleY);

      if (isReinforcing) {
        reinfMat.color.setHex(0xffaa00);
        reinfMat.opacity = 0.8 + Math.sin(time * 5) * 0.2; // pulse
      } else {
        reinfMat.color.setHex(0x886644); // settled color
        reinfMat.opacity = 0.9;
      }

      // Animate seepage particles
      const positions = seepageGeo.attributes.position.array as Float32Array;
      for(let i = 0; i < seepageCount * 3; i+=3) {
        // Only show particles below seepage level
        const isActive = (positions[i+1] + 5) < (seepageLevel / 10);
        
        if (isActive) {
          positions[i] += 0.02; // flow downstream
          positions[i+1] -= 0.01; // flow down
          
          // Reset if too far
          if (positions[i] > 20 || positions[i+1] < -5) {
            positions[i] = 10 + Math.random() * 5;
            positions[i+1] = -5 + Math.random() * (seepageLevel / 10);
          }
        } else {
          // Hide inactive particles by moving them far away
          positions[i] = 100; 
        }
      }
      seepageGeo.attributes.position.needsUpdate = true;

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
      damGeo.dispose();
      damMat.dispose();
      pondGeo.dispose();
      pondMat.dispose();
      reinfGeo.dispose();
      reinfMat.dispose();
      seepageGeo.dispose();
      seepageMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VentilationFanOverhaulProps } from './three-types';

export const ThreeScene: React.FC<VentilationFanOverhaulProps> = (props) => {
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
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

    
    // Fan Casing
    const casingGeo = new THREE.CylinderGeometry(5, 5, 4, 32, 1, true);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    scene.add(casing);

    // Rotor
    const rotor = new THREE.Group();
    const hubGeo = new THREE.CylinderGeometry(1, 1, 2, 16);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.8 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    rotor.add(hub);

    // Blades
    for(let i=0; i<8; i++) {
      const bladeGeo = new THREE.BoxGeometry(3.5, 0.1, 1);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = 2.5;
      blade.rotation.x = Math.PI / 6; // pitch
      
      const pivot = new THREE.Group();
      pivot.rotation.y = (Math.PI / 4) * i;
      pivot.add(blade);
      rotor.add(pivot);
    }
    rotor.rotation.x = Math.PI / 2;
    scene.add(rotor);

    // Airflow particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
      const r = Math.random() * 4 + 1;
      const theta = Math.random() * Math.PI * 2;
      pPos[i*3] = r * Math.cos(theta);
      pPos[i*3+1] = r * Math.sin(theta);
      pPos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00aaff, size: 0.1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const animateScene = (time) => {
      const { rpm = 1000, vibration = 0, status } = propsRef.current;
      
      const speed = status === '大修中' ? 0 : (rpm / 1000) * 0.2;
      rotor.rotation.y += speed;

      // Vibration effect
      if (status !== '大修中') {
        rotor.position.x = (Math.random() - 0.5) * (vibration / 100) * 0.2;
        rotor.position.y = (Math.random() - 0.5) * (vibration / 100) * 0.2;
      }

      // Airflow
      const positions = pGeo.attributes.position.array;
      for(let i=2; i<pCount*3; i+=3) {
        positions[i] += speed * 2;
        if(positions[i] > 5) positions[i] = -5;
      }
      pGeo.attributes.position.needsUpdate = true;

      if (status === '大修中') {
        pMat.opacity = 0;
        casingMat.color.setHex(0x443322);
      } else {
        pMat.opacity = 0.6;
        casingMat.color.setHex(0x223344);
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

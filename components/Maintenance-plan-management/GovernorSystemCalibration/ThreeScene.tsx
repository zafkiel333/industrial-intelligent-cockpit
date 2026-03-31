import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GovernorSystemCalibrationProps } from './three-types';

export const ThreeScene: React.FC<GovernorSystemCalibrationProps> = (props) => {
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

    
    // Central rotor
    const rotorGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.8 });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    scene.add(rotor);

    // Guide vanes
    const vanes = new THREE.Group();
    const vaneCount = 12;
    for(let i=0; i<vaneCount; i++) {
      const vaneGeo = new THREE.BoxGeometry(1.5, 0.8, 0.1);
      const vaneMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
      const vane = new THREE.Mesh(vaneGeo, vaneMat);
      
      const angle = (i / vaneCount) * Math.PI * 2;
      vane.position.x = Math.cos(angle) * 3;
      vane.position.z = Math.sin(angle) * 3;
      vane.rotation.y = -angle;
      
      // Store base rotation
      vane.userData.baseRotation = -angle;
      vanes.add(vane);
    }
    scene.add(vanes);

    // Calibration ring
    const ringGeo = new THREE.TorusGeometry(4.5, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const animateScene = (time) => {
      const { guideVaneOpening = 0, status, calibrationStep = 0 } = propsRef.current;
      
      // Rotate entire assembly slowly
      scene.rotation.y = time * 0.1;

      // Adjust vanes based on opening (0-100)
      const openingAngle = (guideVaneOpening / 100) * (Math.PI / 4);
      vanes.children.forEach(vane => {
        vane.rotation.y = vane.userData.baseRotation + openingAngle;
      });

      if (status === '校验中') {
        ringMat.opacity = 0.5 + Math.sin(time * 5) * 0.5;
        ringMat.color.setHSL((time * 0.1) % 1, 1, 0.5);
        
        // Highlight vanes based on step
        vanes.children.forEach((vane, i) => {
          if (i % 3 === calibrationStep % 3) {
            vane.material.color.setHex(0xffffff);
            vane.material.emissive.setHex(0x00ffcc);
          } else {
            vane.material.color.setHex(0x00ffcc);
            vane.material.emissive.setHex(0x000000);
          }
        });
      } else {
        ringMat.opacity = 0;
        vanes.children.forEach(vane => {
          vane.material.color.setHex(0x00ffcc);
          vane.material.emissive.setHex(0x000000);
        });
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

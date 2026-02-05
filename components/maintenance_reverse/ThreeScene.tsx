import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReverseThreeProps } from './three-types';

export const ReverseThreeScene: React.FC<ReverseThreeProps> = ({ 
  partType, 
  defects,
  isScanning,
  scanProgress
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(5, 4, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Geometry ---

    // Platform
    const platformGeo = new THREE.CylinderGeometry(3, 3.2, 0.2, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1;
    scene.add(platform);

    // The Broken Part (Representation)
    const partGroup = new THREE.Group();
    
    // Main Body
    const bodyGeo = new THREE.BoxGeometry(2, 2, 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    partGroup.add(body);

    // Add some complexity based on type (Simplified)
    if (partType === 'motor') {
        const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 32);
        const cyl = new THREE.Mesh(cylGeo, bodyMat);
        cyl.rotation.z = Math.PI / 2;
        partGroup.add(cyl);
    } else if (partType === 'pump') {
        const torusGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 32);
        const torus = new THREE.Mesh(torusGeo, bodyMat);
        partGroup.add(torus);
    }

    scene.add(partGroup);

    // Defect Markers
    defects.forEach(defect => {
        const color = defect.type === 'crack' ? 0xff0000 : (defect.type === 'corrosion' ? 0xffa500 : 0xffff00);
        const markerGeo = new THREE.SphereGeometry(0.15 * defect.severity, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(...defect.position);
        
        // Pulsing animation helper
        marker.userData = { originalScale: 1, pulseSpeed: 2 + Math.random() };
        
        partGroup.add(marker);

        // Label line
        const points = [new THREE.Vector3(...defect.position), new THREE.Vector3(defect.position[0]*1.5, defect.position[1]*1.5 + 1, defect.position[2]*1.5)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        partGroup.add(line);
    });

    // Scanner Laser Plane
    const scanGeo = new THREE.PlaneGeometry(6, 6);
    const scanMat = new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6, // Violet
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x8b5cf6, 5);
    spotLight.position.set(0, 5, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 10);
    blueLight.position.set(3, 2, 3);
    scene.add(blueLight);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Scan Animation
      if (isScanning) {
          scanPlane.visible = true;
          // Map 0-100 progress to Y position -1.5 to 1.5
          const yPos = -1.5 + (scanProgress / 100) * 3;
          scanPlane.position.y = yPos;
          
          // Flicker effect
          scanMat.opacity = 0.1 + Math.sin(time * 20) * 0.05;
      } else {
          scanPlane.visible = false;
      }

      // Defect Pulse
      partGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData.pulseSpeed) {
              const s = child.userData.originalScale + Math.sin(time * child.userData.pulseSpeed) * 0.2;
              child.scale.setScalar(s);
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [partType, defects, isScanning, scanProgress]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BerthFenderReplacementProps } from './three-types';

export const ThreeScene: React.FC<BerthFenderReplacementProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x1a2a3a, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 10, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Dock Wall
    const dockGeo = new THREE.BoxGeometry(10, 20, 40);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.8 });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.set(-5, 0, 0);
    scene.add(dock);

    // Water
    const waterGeo = new THREE.PlaneGeometry(50, 50);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x004466, 
      transparent: true, 
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);

    // Fender Group
    const fenderGroup = new THREE.Group();
    fenderGroup.position.set(0, 2, 0);
    scene.add(fenderGroup);

    // Fender Body (Cylindrical)
    const fenderGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
    fenderGeo.rotateZ(Math.PI / 2);
    const fenderMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const fender = new THREE.Mesh(fenderGeo, fenderMat);
    fender.position.set(2, 0, 0);
    fenderGroup.add(fender);

    // Front Panel (UHMW-PE pad)
    const padGeo = new THREE.BoxGeometry(0.5, 5, 5);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(4.25, 0, 0);
    fenderGroup.add(pad);

    // Ship Hull (Simplified)
    const hullGeo = new THREE.BoxGeometry(10, 15, 30);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.4, metalness: 0.6 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(15, 2, 0);
    scene.add(hull);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { compression, wearLevel, isReplacing } = propsRef.current;

      if (isReplacing) {
        // Replacement animation: Move ship away, lift fender
        hull.position.x += (25 - hull.position.x) * 0.05;
        fenderGroup.position.y += (10 - fenderGroup.position.y) * 0.05;
        fenderGroup.position.x += (-5 - fenderGroup.position.x) * 0.05;
        fenderMat.color.setHex(0xff5500); // Highlight for removal
      } else {
        // Normal operation: Ship presses against fender
        fenderGroup.position.set(0, 2, 0);
        
        // Calculate target hull position based on compression (0-100)
        // Compression 0 = hull at x=15, Compression 100 = hull at x=5 (touching pad)
        const targetX = 15 - (compression / 100) * 10;
        hull.position.x += (targetX - hull.position.x) * 0.1;

        // Compress fender visually
        const scaleX = 1 - (compression / 100) * 0.4; // Max 40% compression
        fender.scale.x = scaleX;
        pad.position.x = 2 + 2 * scaleX + 0.25;

        // Wear effect
        const wearColor = new THREE.Color(0x222222).lerp(new THREE.Color(0x554433), wearLevel / 100);
        fenderMat.color.copy(wearColor);
      }

      // Water gentle wave
      water.position.y = -5 + Math.sin(time * 2) * 0.2;

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
      dockGeo.dispose();
      dockMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      fenderGeo.dispose();
      fenderMat.dispose();
      padGeo.dispose();
      padMat.dispose();
      hullGeo.dispose();
      hullMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

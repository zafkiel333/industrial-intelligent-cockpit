import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydraulicSupportOverhaulProps } from './three-types';

export const ThreeScene: React.FC<HydraulicSupportOverhaulProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x050a15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    const supportGroup = new THREE.Group();

    // Base
    const baseGeo = new THREE.BoxGeometry(6, 1, 12);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.6, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5;
    supportGroup.add(base);

    // Canopy (Top)
    const canopyGeo = new THREE.BoxGeometry(6, 0.8, 14);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.3 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 8;
    canopy.position.z = 1;
    supportGroup.add(canopy);

    // Hydraulic Legs (Pillars)
    const legGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.9, roughness: 0.1 });
    const innerLegGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    const innerLegMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 });

    const legs: { outer: THREE.Mesh, inner: THREE.Mesh }[] = [];
    const legPositions = [
      [-2, 3, -3], [2, 3, -3],
      [-2, 3, 3], [2, 3, 3]
    ];

    legPositions.forEach(pos => {
      const outer = new THREE.Mesh(legGeo, legMat);
      outer.position.set(pos[0], pos[1], pos[2]);
      
      const inner = new THREE.Mesh(innerLegGeo, innerLegMat);
      inner.position.set(0, 2, 0); // Relative to outer
      
      outer.add(inner);
      supportGroup.add(outer);
      legs.push({ outer, inner });
    });

    // Shield (Back)
    const shieldGeo = new THREE.BoxGeometry(5.8, 8, 0.5);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.5, roughness: 0.5 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 4.5, -5);
    shield.rotation.x = -0.2;
    supportGroup.add(shield);

    scene.add(supportGroup);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffcc, 0x003344);
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { pressure, height, isOverhauling } = propsRef.current;

      // Calculate target height based on props (height is 0-100%)
      const targetCanopyY = 4 + (height / 100) * 6; // Range 4 to 10
      
      // Smoothly interpolate canopy height
      canopy.position.y += (targetCanopyY - canopy.position.y) * delta * 2;
      
      // Adjust inner legs to match canopy height
      const legExtension = canopy.position.y - 5; // Base leg height is 4, pos is 3
      legs.forEach(leg => {
        leg.inner.position.y = 2 + legExtension / 2;
        leg.inner.scale.y = legExtension / 4;
      });

      // Adjust shield to connect base and canopy
      shield.position.y = 1 + canopy.position.y / 2;
      shield.scale.y = canopy.position.y / 8;

      if (isOverhauling) {
        // Overhaul mode: highlight legs, pulse color based on pressure
        const pressureColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), pressure / 40);
        legs.forEach(leg => {
          leg.outer.material.color.copy(pressureColor);
          leg.outer.material.emissive.copy(pressureColor).multiplyScalar(0.3 + Math.sin(time * 5) * 0.2);
        });
        canopyMat.opacity = 0.5;
        canopyMat.transparent = true;
      } else {
        // Normal mode
        legs.forEach(leg => {
          leg.outer.material.color.setHex(0x556677);
          leg.outer.material.emissive.setHex(0x000000);
        });
        canopyMat.opacity = 1.0;
        canopyMat.transparent = false;
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
      baseGeo.dispose();
      baseMat.dispose();
      canopyGeo.dispose();
      canopyMat.dispose();
      legGeo.dispose();
      legMat.dispose();
      innerLegGeo.dispose();
      innerLegMat.dispose();
      shieldGeo.dispose();
      shieldMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};

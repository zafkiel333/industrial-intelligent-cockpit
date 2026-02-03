
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WindingSceneProps } from './three-types';

export const WindingThermalScene: React.FC<WindingSceneProps> = ({ 
  hvTemp, 
  lvTemp, 
  oilTemp,
  loadFactor,
  hotspotHeight
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const hvCoilRef = useRef<THREE.Mesh | null>(null);
  const lvCoilRef = useRef<THREE.Mesh | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0505, 0.05); // Dark reddish fog for heat theme

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const heatLight = new THREE.PointLight(0xff4500, 2, 20); // Orange-Red heat source
    heatLight.position.set(5, 5, 5);
    scene.add(heatLight);

    const coolLight = new THREE.PointLight(0x0000ff, 1, 20); // Blue cool source (bottom)
    coolLight.position.set(-5, -5, -5);
    scene.add(coolLight);

    // --- Geometry ---
    const group = new THREE.Group();
    scene.add(group);

    // Core (Iron)
    const coreGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.7, roughness: 0.4 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0;
    group.add(core);

    // Helper to create Coil Spiral
    const createCoil = (radius: number, tubeRadius: number, turns: number, color: number) => {
        const points = [];
        const height = 6;
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            points.push(new THREE.Vector3(x, y, z));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.TubeGeometry(curve, 128, tubeRadius, 8, false);
        // Using vertex colors for heat map later
        return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
            color: 0xffffff, // Will tint this
            vertexColors: false, // We will update .color
            metalness: 0.3,
            roughness: 0.5,
            emissive: 0x000000
        }));
    };

    // LV Winding (Inner)
    const lvCoil = createCoil(2.2, 0.3, 8, 0xcd7f32);
    lvCoilRef.current = lvCoil;
    group.add(lvCoil);

    // HV Winding (Outer)
    const hvCoil = createCoil(3.2, 0.2, 12, 0xb87333);
    hvCoilRef.current = hvCoil;
    group.add(hvCoil);

    // Insulation Paper Barriers (Transparent Cylinders)
    const barrierGeo = new THREE.CylinderGeometry(2.7, 2.7, 6.5, 32, 1, true);
    const barrierMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5f5dc, // Beige (Paper)
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        roughness: 0.8
    });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    group.add(barrier);

    // Oil Flow Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 2 + Math.random() * 2; // In between coils
        const theta = Math.random() * Math.PI * 2;
        pPos[i*3] = Math.cos(theta) * r;
        pPos[i*3+1] = (Math.random() - 0.5) * 8;
        pPos[i*3+2] = Math.sin(theta) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x60a5fa,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    oilParticlesRef.current = particles;
    group.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Heat Coloring Logic
      // Map temperature to Color: Blue(40) -> Green(60) -> Yellow(80) -> Red(100+)
      const getHeatColor = (temp: number) => {
          const tNorm = Math.max(0, Math.min(1, (temp - 40) / 80)); // 40-120 range
          const color = new THREE.Color();
          color.setHSL(0.6 - tNorm * 0.6, 1.0, 0.5); // Blue to Red
          return color;
      };

      if (hvCoilRef.current) {
          const color = getHeatColor(hvTemp);
          (hvCoilRef.current.material as THREE.MeshStandardMaterial).color.copy(color);
          (hvCoilRef.current.material as THREE.MeshStandardMaterial).emissive.copy(color);
          // Pulse emissivity with load
          (hvCoilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + loadFactor * 0.3 * (Math.sin(time*2)+1)/2;
      }

      if (lvCoilRef.current) {
          const color = getHeatColor(lvTemp);
          (lvCoilRef.current.material as THREE.MeshStandardMaterial).color.copy(color);
          (lvCoilRef.current.material as THREE.MeshStandardMaterial).emissive.copy(color);
          (lvCoilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + loadFactor * 0.2;
      }

      // 2. Oil Flow Animation (Convection)
      if (oilParticlesRef.current) {
          const positions = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          // Speed increases with temp/load
          const speed = 0.02 + loadFactor * 0.05;
          
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] += speed;
              // Reset to bottom
              if (positions[i*3+1] > 4) {
                  positions[i*3+1] = -4;
              }
              // Slight thermal turbulence
              positions[i*3] += (Math.random()-0.5)*0.01;
              positions[i*3+2] += (Math.random()-0.5)*0.01;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hvTemp, lvTemp, oilTemp, loadFactor, hotspotHeight]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

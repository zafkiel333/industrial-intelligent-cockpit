
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StatorSceneProps } from './three-types';

export const StatorWindingScene: React.FC<StatorSceneProps> = ({ 
  activeSlot = null,
  pdLocation,
  tempMap = [],
  vibrationAmp = 0,
  wireframe = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const windingsRef = useRef<THREE.Group | null>(null);
  const pdSpriteRef = useRef<THREE.Sprite | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    scene.add(hemiLight);
    
    const purpleLight = new THREE.PointLight(0xd946ef, 1.5, 20);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 1.5, 20);
    blueLight.position.set(-5, -5, -5);
    scene.add(blueLight);

    // --- Geometry: Stator Core & Windings ---
    const group = new THREE.Group();
    windingsRef.current = group;
    scene.add(group);

    // 1. Core (Iron)
    const coreGeo = new THREE.CylinderGeometry(4, 4, 3, 64, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.5, 
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe: wireframe
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Core Slots Visualization (Lines)
    const slotsCount = 48;
    for(let i=0; i<slotsCount; i++) {
        const angle = (i / slotsCount) * Math.PI * 2;
        const x = Math.cos(angle) * 3.95;
        const z = Math.sin(angle) * 3.95;
        
        // Vertical slot line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, -1.5, z),
            new THREE.Vector3(x, 1.5, z)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    }

    // 2. Windings (Copper Bars & End Turns)
    // Simplified representation: Upper and Lower end windings
    const windingMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Copper
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0xb45309,
        emissiveIntensity: 0.1
    });

    const activeWindingMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Hot/Active
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0xef4444,
        emissiveIntensity: 0.8
    });

    for(let i=0; i<slotsCount; i++) {
        const angle = (i / slotsCount) * Math.PI * 2;
        const isSelected = activeSlot !== null && i === (activeSlot - 1);
        
        // Bar inside slot
        const barGeo = new THREE.BoxGeometry(0.1, 3.2, 0.1);
        const bar = new THREE.Mesh(barGeo, isSelected ? activeWindingMat : windingMat);
        bar.position.set(Math.cos(angle)*3.9, 0, Math.sin(angle)*3.9);
        bar.rotation.y = -angle;
        group.add(bar);

        // Upper End Winding (Diamond shape approximation)
        const upperCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle)*3.9, 1.6, Math.sin(angle)*3.9),
            new THREE.Vector3(Math.cos(angle)*4.2, 2.0, Math.sin(angle)*4.2),
            new THREE.Vector3(Math.cos(angle + 0.1)*4.5, 2.2, Math.sin(angle + 0.1)*4.5), // Twist
        ]);
        const tubeGeo = new THREE.TubeGeometry(upperCurve, 8, 0.04, 6, false);
        const tube = new THREE.Mesh(tubeGeo, isSelected ? activeWindingMat : windingMat);
        group.add(tube);

        // Lower End Winding
        const lowerCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle)*3.9, -1.6, Math.sin(angle)*3.9),
            new THREE.Vector3(Math.cos(angle)*4.2, -2.0, Math.sin(angle)*4.2),
            new THREE.Vector3(Math.cos(angle - 0.1)*4.5, -2.2, Math.sin(angle - 0.1)*4.5), // Twist opp
        ]);
        const tubeGeoLow = new THREE.TubeGeometry(lowerCurve, 8, 0.04, 6, false);
        const tubeLow = new THREE.Mesh(tubeGeoLow, isSelected ? activeWindingMat : windingMat);
        group.add(tubeLow);
    }

    // 3. Partial Discharge Effect (Sprite)
    const map = new THREE.TextureLoader().load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png' );
    const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, blending: THREE.AdditiveBlending } );
    const sprite = new THREE.Sprite( material );
    sprite.scale.set(1.5, 1.5, 1.5);
    sprite.visible = false;
    scene.add( sprite );
    pdSpriteRef.current = sprite;

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // End Winding Vibration Simulation
      if (windingsRef.current && vibrationAmp > 0) {
          // Subtle scaling or jitter
          const scale = 1 + Math.sin(time * 20) * (vibrationAmp * 0.005);
          windingsRef.current.scale.set(1, scale, 1);
      }

      // PD Effect
      if (pdSpriteRef.current) {
          if (pdLocation) { // pdLocation should be slot index or normalized coord
             // Random flicker logic
             if (Math.random() > 0.8) {
                 pdSpriteRef.current.visible = true;
                 pdSpriteRef.current.material.opacity = Math.random();
                 
                 // Map random slot to position if specific location not precise
                 const angle = time * 0.5; // Moving around or fixed
                 pdSpriteRef.current.position.set(Math.cos(angle)*3.8, 1.8, Math.sin(angle)*3.8);
             } else {
                 pdSpriteRef.current.visible = false;
             }
          } else {
              pdSpriteRef.current.visible = false;
          }
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
  }, [activeSlot, pdLocation, vibrationAmp, wireframe]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

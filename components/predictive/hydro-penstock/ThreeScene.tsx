
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PenstockSceneProps } from './three-types';

export const PenstockScene: React.FC<PenstockSceneProps> = ({ 
  pressure,
  flowRate,
  stressFactor,
  vibration,
  showInternal,
  waterHammerPulse,
  jointDisplacement
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<THREE.Mesh | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const pulseRef = useRef<THREE.Mesh | null>(null);
  const bellowsRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(15, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const stressLight = new THREE.PointLight(0xff0000, 0, 20);
    stressLight.position.set(0, 2, 0);
    scene.add(stressLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.7, 
        roughness: 0.3,
        side: THREE.DoubleSide
    });

    const transparentSteelMat = new THREE.MeshPhysicalMaterial({
        color: 0x475569,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.8,
        opacity: 0.2,
        transparent: true,
        side: THREE.DoubleSide
    });

    const concreteMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, roughness: 0.9, metalness: 0.1 
    });

    const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xff4500, // Red-Orange pulse
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Define Pipe Path (Curved Elbow)
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 5, 0),
        new THREE.Vector3(-5, 4, 0),
        new THREE.Vector3(0, 0, 0), // Elbow bend
        new THREE.Vector3(2, -4, 2),
        new THREE.Vector3(4, -8, 4),
    ]);

    // 1. Pipe Shell
    const pipeGeo = new THREE.TubeGeometry(curve, 64, 2.0, 32, false);
    const pipe = new THREE.Mesh(pipeGeo, steelMat);
    pipeRef.current = pipe;
    mainGroup.add(pipe);

    // 2. Internal Water Body
    const waterGeo = new THREE.TubeGeometry(curve, 64, 1.9, 32, false);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.visible = false; // Only visible in internal mode
    waterRef.current = water;
    mainGroup.add(water);

    // 3. Pressure Pulse (Visual Ring)
    // We'll create a torus that moves along the curve
    const pulseGeo = new THREE.TubeGeometry(curve, 64, 2.05, 32, false); 
    // Actually, scaling a segment is hard. Let's use a Sphere that travels the path and scale it to fit pipe.
    const pulseSphere = new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 32), pulseMat);
    pulseRef.current = pulseSphere;
    mainGroup.add(pulseSphere);

    // 4. Anchor Blocks (Concrete Supports)
    const anchorGeo = new THREE.BoxGeometry(6, 6, 6);
    const anchor1 = new THREE.Mesh(anchorGeo, concreteMat);
    anchor1.position.copy(curve.getPointAt(0.2));
    mainGroup.add(anchor1);
    
    const anchor2 = new THREE.Mesh(anchorGeo, concreteMat);
    anchor2.position.copy(curve.getPointAt(0.8));
    mainGroup.add(anchor2);

    // 5. Expansion Joint (Bellows)
    const bellowsGroup = new THREE.Group();
    // Position at start of curve roughly
    const bellowsPos = curve.getPointAt(0.1);
    const bellowsTan = curve.getTangentAt(0.1);
    bellowsGroup.position.copy(bellowsPos);
    bellowsGroup.lookAt(bellowsPos.clone().add(bellowsTan));
    bellowsRef.current = bellowsGroup;
    mainGroup.add(bellowsGroup);

    // Create ripples for bellows
    for(let i=0; i<5; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.2, 0.15, 16, 64),
            new THREE.MeshStandardMaterial({color: 0x94a3b8})
        );
        ring.position.z = i * 0.4 - 1;
        bellowsGroup.add(ring);
    }

    // 6. Flow Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pOffset = new Float32Array(pCount); // Track position along curve (0-1)
    
    for(let i=0; i<pCount; i++) {
        pOffset[i] = Math.random();
        const pt = curve.getPointAt(pOffset[i]);
        // Random scatter inside tube radius (approx 1.8)
        const offset = new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*3, (Math.random()-0.5)*3);
        const final = pt.add(offset); // Rough approximation
        pPos[i*3] = final.x;
        pPos[i*3+1] = final.y;
        pPos[i*3+2] = final.z;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.5
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    mainGroup.add(particles);


    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Material & Visibility
      if (pipeRef.current) {
          pipeRef.current.material = showInternal ? transparentSteelMat : steelMat;
          if (waterRef.current) waterRef.current.visible = showInternal;
          
          // Stress Heatmap Effect
          // If not transparent, emissive indicates stress
          if (!showInternal) {
              const mat = pipeRef.current.material as THREE.MeshStandardMaterial;
              if (stressFactor > 0.3) {
                  // Pulse red at high stress areas (e.g. elbow at 0.5 of curve)
                  mat.emissive.setHex(0xff0000);
                  // Global stress + dynamic pulse
                  mat.emissiveIntensity = (stressFactor - 0.3) * 0.5 + (pressure > 6 ? Math.sin(time*10)*0.2 : 0);
              } else {
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
              }
          }
      }

      // 2. Vibration
      if (vibration > 0) {
          mainGroup.position.x = (Math.random() - 0.5) * vibration * 0.05;
          mainGroup.position.y = (Math.random() - 0.5) * vibration * 0.05;
      }

      // 3. Water Hammer Pulse
      if (pulseRef.current) {
          if (waterHammerPulse > 0) {
              const pt = curve.getPointAt(waterHammerPulse % 1);
              pulseRef.current.position.copy(pt);
              pulseRef.current.visible = true;
              (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - Math.abs(0.5 - waterHammerPulse));
              
              // Scale visual pulse
              const s = 1 + Math.sin(time * 20) * 0.1;
              pulseRef.current.scale.set(s, s, s);
          } else {
              pulseRef.current.visible = false;
          }
      }

      // 4. Bellows Expansion
      if (bellowsRef.current) {
          // Scale Z based on displacement
          // Base scale 1. jointDisplacement (mm) adds to it. Visual scale factor.
          const scaleZ = 1 + (jointDisplacement / 50); 
          bellowsRef.current.scale.z = scaleZ;
      }

      // 5. Particles Flow
      if (particlesRef.current && showInternal) {
          particlesRef.current.visible = true;
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const speed = flowRate / 10000; // Scale flow
          
          for(let i=0; i<pCount; i++) {
              pOffset[i] += speed;
              if (pOffset[i] > 1) pOffset[i] = 0;
              
              const pt = curve.getPointAt(pOffset[i]);
              // Add randomness to width
              // Re-use random logic or just oscillate
              const jitter = Math.sin(i + time) * 1.5;
              
              // Tangent to orient jitter perpendicular? Simplified: Just random sphere around point
              positions[i*3] = pt.x + (Math.random()-0.5)*2;
              positions[i*3+1] = pt.y + (Math.random()-0.5)*2;
              positions[i*3+2] = pt.z + (Math.random()-0.5)*2;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (particlesRef.current) {
          particlesRef.current.visible = false;
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
  }, [pressure, flowRate, stressFactor, vibration, showInternal, waterHammerPulse, jointDisplacement]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

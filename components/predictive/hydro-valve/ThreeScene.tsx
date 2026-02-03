
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ValveSceneProps } from './three-types';

export const ValveStictionScene: React.FC<ValveSceneProps> = ({ 
  spoolPosition, 
  commandSignal,
  stictionLevel,
  oilQuality,
  isDithering
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const spoolRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frictionGlowRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0a10, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 20);
    blueLight.position.set(5, 5, 5);
    scene.add(blueLight);

    const orangeLight = new THREE.PointLight(0xf97316, 1, 20); // Friction warning light
    orangeLight.position.set(-5, 2, -5);
    scene.add(orangeLight);

    // --- Geometry: Servo Valve ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    
    const sleeveMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8, // Glassy sleeve
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const frictionMat = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
    });

    // 1. Valve Sleeve (Body) - Cutaway look
    // A cylinder with gaps for ports
    const sleeveGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32, 1, true);
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeve.rotation.z = Math.PI / 2;
    mainGroup.add(sleeve);

    // Port rings (Visual indication of P, T, A, B ports)
    const portGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 64);
    [-2, -0.7, 0.7, 2].forEach((x, i) => {
        const port = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ 
            color: i === 0 || i === 3 ? 0x0ea5e9 : 0x64748b, // Outer ports vs Inner
            emissive: i === 0 || i === 3 ? 0x0ea5e9 : 0x000000,
            emissiveIntensity: 0.5
        }));
        port.rotation.y = Math.PI / 2;
        port.position.x = x;
        mainGroup.add(port);
    });

    // 2. Spool (The moving part)
    const spoolGroup = new THREE.Group();
    spoolRef.current = spoolGroup;
    mainGroup.add(spoolGroup);

    // Spool Stem
    const stemGeo = new THREE.CylinderGeometry(0.4, 0.4, 10, 32);
    const stem = new THREE.Mesh(stemGeo, metalMat);
    stem.rotation.z = Math.PI / 2;
    spoolGroup.add(stem);

    // Spool Lands (The blocking parts)
    const landGeo = new THREE.CylinderGeometry(1.45, 1.45, 1.2, 32);
    [-2.5, 0, 2.5].forEach(x => {
        const land = new THREE.Mesh(landGeo, metalMat);
        land.rotation.z = Math.PI / 2;
        land.position.x = x;
        spoolGroup.add(land);
    });

    // Friction Highlight (Glow overlay on lands)
    const glowGeo = new THREE.CylinderGeometry(1.55, 1.55, 1.2, 32);
    const glowMesh = new THREE.Mesh(glowGeo, frictionMat);
    glowMesh.rotation.z = Math.PI / 2;
    glowMesh.position.x = 0; // Center land usually has critical control edge
    spoolGroup.add(glowMesh);
    frictionGlowRef.current = glowMesh;

    // 3. Oil Particles
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 6; // Along length
        pPos[i*3+1] = (Math.random() - 0.5) * 2;
        pPos[i*3+2] = (Math.random() - 0.5) * 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
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

      // 1. Spool Movement
      if (spoolRef.current) {
          // Map -100..100 to physical position limits approx -1.0 to 1.0
          const targetX = (spoolPosition / 100) * 1.0; 
          
          // Dither vibration
          const dither = isDithering ? Math.sin(time * 50) * 0.05 : 0;
          
          // Smooth interpolation
          spoolRef.current.position.x += (targetX + dither - spoolRef.current.position.x) * 0.2;
      }

      // 2. Friction/Stiction Glow
      if (frictionGlowRef.current) {
          // Intensity based on Stiction Level AND Velocity (Friction acts when moving, stiction acts when starting)
          // Simplified: Glow intense if stiction level is high and position changes
          const diff = Math.abs(commandSignal - spoolPosition);
          const frictionIntensity = (stictionLevel / 100) * 0.8 + (diff > 5 ? 0.2 : 0);
          
          (frictionGlowRef.current.material as THREE.MeshBasicMaterial).opacity = frictionIntensity;
          (frictionGlowRef.current.material as THREE.MeshBasicMaterial).color.setHSL(0.05, 1.0, 0.5 + frictionIntensity*0.5); // Orange to White hot
      }

      // 3. Particle Flow
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          // Flow speed depends on valve opening (abs position)
          const flowSpeed = Math.abs(spoolPosition) * 0.001 + 0.01; 
          
          for(let i=0; i<pCount; i++) {
              // Flow towards ports or through valve
              if (positions[i*3] > 0) positions[i*3] += flowSpeed;
              else positions[i*3] -= flowSpeed;

              // Reset
              if (Math.abs(positions[i*3]) > 4) positions[i*3] = 0;
              
              // Jitter based on Oil Quality (Dirtier = more chaotic)
              const jitter = (100 - oilQuality) * 0.0002;
              positions[i*3+1] += (Math.random()-0.5) * jitter;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // Color dirty oil darker
          const cleanColor = new THREE.Color(0x0ea5e9);
          const dirtyColor = new THREE.Color(0x57534e);
          (particlesRef.current.material as THREE.PointsMaterial).color.lerpColors(dirtyColor, cleanColor, oilQuality/100);
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
  }, [spoolPosition, commandSignal, stictionLevel, oilQuality, isDithering]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpVibrationProps } from './three-types';

export const PumpVibrationScene: React.FC<PumpVibrationProps> = ({ 
  rpm, 
  pressure, 
  vibration, 
  temperature,
  cavitation,
  flowRate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gearsRef = useRef<THREE.Group[]>([]);
  const housingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050202, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff0000, 1, 20);
    redLight.position.set(5, 5, 5);
    scene.add(redLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 1, 20);
    cyanLight.position.set(-5, -5, -5);
    scene.add(cyanLight);

    // --- Geometry: Gear Pump ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.8, 
      roughness: 0.3 
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7, // Glassy
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    // 1. Gears
    const createGear = (x: number) => {
        const gearGroup = new THREE.Group();
        gearGroup.position.x = x;
        
        const coreGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
        const core = new THREE.Mesh(coreGeo, metalMat);
        core.rotation.x = Math.PI / 2;
        gearGroup.add(core);

        // Teeth
        const teethCount = 8;
        const toothGeo = new THREE.BoxGeometry(0.4, 2.4, 1);
        for(let i=0; i<teethCount; i++) {
            const tooth = new THREE.Mesh(toothGeo, metalMat);
            tooth.rotation.z = (i / teethCount) * Math.PI * 2;
            gearGroup.add(tooth);
        }
        return gearGroup;
    };

    const gear1 = createGear(-1.1);
    const gear2 = createGear(1.1);
    // Offset rotation for meshing
    gear2.rotation.z = (Math.PI * 2 / 8) / 2;
    
    mainGroup.add(gear1);
    mainGroup.add(gear2);
    gearsRef.current = [gear1, gear2];

    // 2. Housing
    // Simple box shape with rounded look roughly
    const housingGeo = new THREE.BoxGeometry(5.5, 3.5, 2);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housingRef.current = housing;
    mainGroup.add(housing);

    // Inlet/Outlet pipes
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const inlet = new THREE.Mesh(pipeGeo, metalMat);
    inlet.position.y = 2.5;
    mainGroup.add(inlet);
    
    const outlet = new THREE.Mesh(pipeGeo, metalMat);
    outlet.position.y = -2.5;
    mainGroup.add(outlet);

    // 3. Flow Particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 4;
        pPos[i*3+1] = (Math.random() - 0.5) * 6; // Vertical flow range
        pPos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.1,
        transparent: true,
        opacity: 0.6
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

      // 1. Rotate Gears
      const rotSpeed = rpm / 60 * 0.1;
      if (gearsRef.current.length === 2) {
          gearsRef.current[0].rotation.z -= rotSpeed;
          gearsRef.current[1].rotation.z += rotSpeed;
      }

      // 2. Vibration Shake
      if (mainGroupRef.current) {
          const shake = vibration * 0.01; // Scale factor
          mainGroupRef.current.position.x = (Math.random() - 0.5) * shake;
          mainGroupRef.current.position.y = (Math.random() - 0.5) * shake;
      }

      // 3. Pressure Color Effect on Housing
      if (housingRef.current) {
          const mat = housingRef.current.material as THREE.MeshPhysicalMaterial;
          // Pressure 2.0 to 6.0 MPa map to color
          const pNorm = Math.min(1, Math.max(0, (pressure - 2.5) / 3.5));
          const targetColor = new THREE.Color().lerpColors(new THREE.Color(0x475569), new THREE.Color(0xff0000), pNorm);
          mat.color.lerp(targetColor, 0.1);
          mat.emissive.lerp(targetColor, 0.1);
          mat.emissiveIntensity = pNorm * 0.5;
      }

      // 4. Particle Flow
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const flowSpeed = flowRate * 0.001; 
          for(let i=0; i<pCount; i++) {
              // Flow downwards (Pump suction to discharge usually, let's say top to bottom for visual)
              // Actually pumps usually suck bottom discharge top or side-side. Let's do top-down for gravity feel or bottom-up.
              // Let's do Top(In) to Bottom(Out) visual flow
              positions[i*3+1] -= flowSpeed;
              
              // Cavitation Bubbles (expand/contract jitter)
              if (cavitation) {
                  positions[i*3] += (Math.random()-0.5)*0.05;
              }

              // Reset
              if (positions[i*3+1] < -3) {
                  positions[i*3+1] = 3;
                  positions[i*3] = (Math.random() - 0.5) * 4;
                  positions[i*3+2] = (Math.random() - 0.5) * 1.5;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // Cavitation Color change
          (particlesRef.current.material as THREE.PointsMaterial).color.setHex(cavitation ? 0xffffff : 0xffaa00);
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
  }, [rpm, pressure, vibration, temperature, cavitation, flowRate]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ProbabilitySceneProps } from './three-types';

export const ProbabilityTimeScene: React.FC<ProbabilitySceneProps> = ({ 
  timeHorizon, 
  components,
  showParticles = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const compMeshesRef = useRef<THREE.Group[]>([]);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const timeRingRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 20);
    blueLight.position.set(5, 10, 5);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 20);
    purpleLight.position.set(-5, -5, -5);
    scene.add(purpleLight);

    // --- Time Rings (Visualizing the Tunnel of Time) ---
    const ringGroup = new THREE.Group();
    timeRingRef.current = ringGroup;
    scene.add(ringGroup);

    for(let i=0; i<10; i++) {
        const ringGeo = new THREE.TorusGeometry(6 + i * 0.5, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0x334155, 
            transparent: true, 
            opacity: 0.2 - (i * 0.02) 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -2 + i * 0.5;
        ringGroup.add(ring);
    }

    // --- Geometry Construction (Abstract Unit) ---
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    compMeshesRef.current = [];

    // Helper to create glowing parts
    const createPart = (id: string, geo: THREE.BufferGeometry, y: number, colorHex: string) => {
        const group = new THREE.Group();
        group.userData = { id, baseColor: new THREE.Color(colorHex) };
        
        // Inner Solid
        const matSolid = new THREE.MeshPhysicalMaterial({
            color: colorHex,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.6,
            transmission: 0.2,
            emissive: colorHex,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, matSolid);
        group.add(mesh);

        // Outer Wireframe
        const wireGeo = new THREE.WireframeGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        group.add(wire);

        group.position.y = y;
        machineGroup.add(group);
        compMeshesRef.current.push(group);
    };

    // Stator
    createPart('stator', new THREE.CylinderGeometry(3, 3, 2, 32, 1, true), 2, '#3b82f6');
    // Rotor
    createPart('rotor', new THREE.CylinderGeometry(2.5, 2.5, 1.8, 32), 2, '#10b981');
    // Shaft
    createPart('shaft', new THREE.CylinderGeometry(0.5, 0.5, 7, 16), 0, '#94a3b8');
    // Bearing
    createPart('bearing', new THREE.CylinderGeometry(1.5, 1.5, 0.6, 32), -1, '#f59e0b');
    // Runner
    createPart('runner', new THREE.TorusGeometry(2, 0.6, 16, 32), -3.5, '#ef4444');

    // --- Particles (Entropy/Chaos representation) ---
    if (showParticles) {
        const pCount = 500;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pUserData = []; // store initial positions and speeds
        
        for(let i=0; i<pCount; i++) {
            const r = 2 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 8;
            
            pPos[i*3] = r * Math.cos(theta);
            pPos[i*3+1] = y;
            pPos[i*3+2] = r * Math.sin(theta);
            
            pUserData.push({
                r, theta, y, 
                speed: 0.005 + Math.random() * 0.01,
                drift: (Math.random() - 0.5) * 0.01
            });
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({
            color: 0xcccccc,
            size: 0.05,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.userData = { info: pUserData };
        particleSystemRef.current = particles;
        scene.add(particles);
    }

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 1. Time Horizon Effect on Components
      compMeshesRef.current.forEach(group => {
          const { id, baseColor } = group.userData;
          const compDef = components.find(c => c.id === id);
          
          if (compDef) {
              // Calculate Failure Probability: P(t) = 1 - exp(-(t/eta)^beta)
              // timeHorizon is in days.
              const t = timeHorizon * 24; // convert to hours approx for scale
              const prob = 1 - Math.exp(-Math.pow(t / compDef.eta, compDef.beta));
              
              // Visual changes based on probability
              const mesh = group.children[0] as THREE.Mesh;
              const mat = mesh.material as THREE.MeshPhysicalMaterial;
              
              // Color shift from Base -> Red based on probability
              const targetColor = new THREE.Color().lerpColors(baseColor, new THREE.Color(0xff0000), prob);
              mat.color.lerp(targetColor, 0.1);
              mat.emissive.lerp(targetColor, 0.1);
              
              // Emission intensity pulsates with risk
              mat.emissiveIntensity = 0.2 + prob * 0.8 + (prob > 0.5 ? Math.sin(time * 10) * 0.3 : 0);
              
              // Jitter/Vibration visual if high risk
              if (prob > 0.6) {
                  group.position.x = (Math.random() - 0.5) * 0.05 * prob;
                  group.position.z = (Math.random() - 0.5) * 0.05 * prob;
              } else {
                  group.position.x = 0;
                  group.position.z = 0;
              }
          }
      });

      // 2. Particle Animation (Chaos increases with timeHorizon)
      if (particleSystemRef.current) {
          const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
          const info = particleSystemRef.current.userData.info;
          
          // Chaos factor
          const chaos = 1 + (timeHorizon / 365) * 5; 

          for(let i=0; i<info.length; i++) {
              const p = info[i];
              p.theta += p.speed * chaos;
              p.y += p.drift * chaos;
              
              if (p.y > 6) p.y = -6;
              if (p.y < -6) p.y = 6;

              positions[i*3] = p.r * Math.cos(p.theta);
              positions[i*3+1] = p.y;
              positions[i*3+2] = p.r * Math.sin(p.theta);
          }
          particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
          
          // Color shift for particles too
          (particleSystemRef.current.material as THREE.PointsMaterial).color.setHSL(0.6 - (timeHorizon/700), 0.5, 0.5);
      }

      // 3. Time Ring Animation
      if (timeRingRef.current) {
          timeRingRef.current.rotation.z += 0.002;
          timeRingRef.current.children.forEach((ring, i) => {
              ring.scale.setScalar(1 + Math.sin(time + i) * 0.05);
          });
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
  }, [timeHorizon, components, showParticles]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

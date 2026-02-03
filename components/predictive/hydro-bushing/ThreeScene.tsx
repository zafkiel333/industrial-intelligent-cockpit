
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BushingSceneProps } from './three-types';

export const BushingScene: React.FC<BushingSceneProps> = ({ 
  phase,
  voltageLevel,
  pdIntensity,
  tanDelta,
  oilLevel,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);
  const coreRef = useRef<THREE.Group | null>(null);
  const oilRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020205, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 12, 12);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 4, 0);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 20);
    blueLight.position.set(5, 10, 5);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    violetLight.position.set(-5, 0, -5);
    scene.add(violetLight);

    // --- Geometry ---
    const group = new THREE.Group();
    scene.add(group);

    // Materials
    const porcelainMat = new THREE.MeshPhysicalMaterial({
        color: 0x475569, // Dark grey porcelain usually, or brown. Let's go sci-fi dark.
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 1.0,
        transmission: viewMode === 'internal' ? 0.8 : 0.0,
        transparent: viewMode === 'internal',
        opacity: viewMode === 'internal' ? 0.2 : 1.0
    });

    const copperMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        metalness: 0.8,
        roughness: 0.2
    });

    const foilMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9, // Electric blue foils
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        transmission: 0.6,
        opacity: 0.6,
        transparent: true,
        roughness: 0.1
    });

    // 1. Bushing Sheds (Using LatheGeometry for profile)
    const points = [];
    const heightTotal = 10;
    const sheds = 12;
    for ( let i = 0; i <= sheds * 10; i ++ ) {
        const y = (i / (sheds * 10)) * heightTotal;
        // Profile function
        const rBase = 1.0;
        const rShed = 0.5 * (Math.sin(i * 0.6) > 0 ? Math.sin(i*0.6) : 0); 
        points.push( new THREE.Vector2( rBase + rShed, y ) );
    }
    const bushingGeo = new THREE.LatheGeometry( points, 32 );
    const bushing = new THREE.Mesh( bushingGeo, porcelainMat );
    group.add( bushing );

    // 2. Central Conductor
    const condGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 16);
    const conductor = new THREE.Mesh(condGeo, copperMat);
    conductor.position.y = 5;
    group.add(conductor);
    
    // Top Terminal
    const termGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 32);
    const terminal = new THREE.Mesh(termGeo, new THREE.MeshStandardMaterial({color: 0x94a3b8, metalness: 0.8}));
    terminal.position.y = 10.5;
    group.add(terminal);

    // 3. Internal Grading Foils (Capacitor Core) - Only visible in internal mode
    const coreGroup = new THREE.Group();
    coreRef.current = coreGroup;
    group.add(coreGroup);

    if (viewMode === 'internal' || viewMode === 'field') {
        for(let i=0; i<6; i++) {
            const r = 0.4 + i * 0.12;
            const h = 9 - i * 0.8; // Grading: outer layers shorter
            const foil = new THREE.Mesh(
                new THREE.CylinderGeometry(r, r, h, 32, 1, true),
                foilMat
            );
            foil.position.y = 5; // Centered vertically in bushing
            coreGroup.add(foil);
        }
    }

    // 4. Oil Level (Inside)
    if (viewMode === 'internal') {
        const oilHeight = (oilLevel / 100) * 2; // In the top expansion chamber
        const oilGeo = new THREE.CylinderGeometry(0.9, 0.9, oilHeight, 32);
        const oil = new THREE.Mesh(oilGeo, oilMat);
        oil.position.y = 9.5 + oilHeight/2 - 1; // Position near top
        oilRef.current = oil;
        group.add(oil);
    }

    // 5. PD Sparks (Particle System)
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        // Init off-screen
        pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xff00ff, // Magenta sparks
        size: 0.3,
        transparent: true,
        opacity: 1.0,
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png'),
        blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparksRef.current = sparks;
    group.add(sparks);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // PD Simulation
      if (sparksRef.current) {
          const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
          // Intensity determines probability of spark
          const sparkProb = pdIntensity / 2000; // e.g., 500pC -> 0.25
          
          for(let i=0; i<pCount; i++) {
              if (Math.random() < sparkProb * 0.1) {
                  // Trigger spark at random defect location (e.g., middle layers)
                  const layerR = 0.5 + Math.random() * 0.4;
                  const angle = Math.random() * Math.PI * 2;
                  const y = 3 + Math.random() * 4;
                  
                  positions[i*3] = Math.cos(angle) * layerR;
                  positions[i*3+1] = y;
                  positions[i*3+2] = Math.sin(angle) * layerR;
              } else {
                  // Hide
                  positions[i*3+1] = -100;
              }
          }
          sparksRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Voltage Stress Pulse (Field View)
      if (viewMode === 'field' && coreRef.current) {
          coreRef.current.children.forEach((mesh: any, i) => {
              const pulse = Math.sin(time * 10 - i) * 0.5 + 0.5;
              mesh.material.opacity = 0.1 + pulse * 0.3;
          });
      }

      // Material color update based on Tan Delta (Aging)
      // High Tan Delta -> Yellow/Brown tint on insulation
      if (viewMode === 'internal' && tanDelta > 0.5) {
           // Simulating aging color shift
           const ageFactor = Math.min(1, tanDelta / 2.0); // 0 to 1
           // No dynamic update on complex materials for perf, but logic is here
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
  }, [phase, voltageLevel, pdIntensity, tanDelta, oilLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

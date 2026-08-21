import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { UnloaderState } from './three-types';

export const ThreeScene: React.FC<{ state: UnloaderState }> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    
    // Fog for depth
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(80, 60, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00ffff, 2.0);
    mainLight.position.set(100, 100, 50);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const neonPinkLight = new THREE.PointLight(0xff00ff, 2, 200);
    neonPinkLight.position.set(-50, 30, -50);
    scene.add(neonPinkLight);

    const neonGreenLight = new THREE.PointLight(0x39ff14, 1.5, 200);
    neonGreenLight.position.set(50, 30, 50);
    scene.add(neonGreenLight);

    // --- Ship Unloader Model (Procedural) ---
    const unloaderGroup = new THREE.Group();
    scene.add(unloaderGroup);

    // 1. Gantry (Main Base)
    const gantryGeo = new THREE.BoxGeometry(40, 5, 40);
    const techMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xbc13fe, // Neon Purple
      roughness: 0.1, 
      metalness: 0.9,
      emissive: 0xbc13fe,
      emissiveIntensity: 0.2
    });
    const gantry = new THREE.Mesh(gantryGeo, techMaterial);
    gantry.position.y = 2.5;
    unloaderGroup.add(gantry);

    // Legs
    const legGeo = new THREE.BoxGeometry(4, 30, 4);
    const legPositions = [
      [15, 15, 15], [-15, 15, 15], [15, 15, -15], [-15, 15, -15]
    ];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, techMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      unloaderGroup.add(leg);
    });

    // 2. Main Boom (Horizontal Arm)
    const boomGroup = new THREE.Group();
    boomGroup.position.y = 35;
    unloaderGroup.add(boomGroup);

    const boomGeo = new THREE.BoxGeometry(100, 6, 8);
    const boomMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff, // Neon Blue
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3
    });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.x = 30; // Extend forward
    boomGroup.add(boom);

    // Boom Support Structure
    const towerGeo = new THREE.BoxGeometry(10, 20, 10);
    const tower = new THREE.Mesh(towerGeo, boomMat);
    tower.position.y = 10;
    boomGroup.add(tower);

    // 3. Trolley (Moves along boom)
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.y = -4;
    boomGroup.add(trolleyGroup);

    const trolleyGeo = new THREE.BoxGeometry(8, 4, 6);
    const trolleyMat = new THREE.MeshStandardMaterial({ 
      color: 0x39ff14, // Neon Green
      emissive: 0x39ff14,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.7
    });
    const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolleyGroup.add(trolley);

    // 4. Grab Bucket
    const grabGroup = new THREE.Group();
    trolleyGroup.add(grabGroup);

    const ropeGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Neon Yellow
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.scale.y = 20;
    rope.position.y = -10;
    grabGroup.add(rope);

    const bucketGeo = new THREE.SphereGeometry(3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bucketMat = new THREE.MeshStandardMaterial({ 
      color: 0xff10f0, // Neon Pink
      emissive: 0xff10f0,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide 
    });
    const bucketLeft = new THREE.Mesh(bucketGeo, bucketMat);
    bucketLeft.rotation.z = Math.PI;
    bucketLeft.position.y = -20;
    grabGroup.add(bucketLeft);

    const bucketRight = bucketLeft.clone();
    bucketRight.rotation.y = Math.PI;
    grabGroup.add(bucketRight);

    // 5. Ground / Dock
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x020617,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper
    const grid = new THREE.GridHelper(200, 20, 0x00ffff, 0xff00ff);
    grid.position.y = 0.1;
    scene.add(grid);

    // Particles (Material Flow)
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -1000; // Hide initially
      positions[i * 3 + 2] = 0;
      velocities[i * 3 + 1] = -Math.random() * 0.5 - 0.2;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.5, transparent: true, opacity: 0.8 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Animation Variables
    let trolleyPos = 0;
    let trolleyDir = 1;
    let grabHeight = 0;
    let grabState = 'moving'; // 'moving', 'lowering', 'grabbing', 'lifting', 'dropping'
    let grabOpen = 0;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Logic for Unloader Operation
      if (grabState === 'moving') {
        trolleyPos += 0.2 * trolleyDir;
        if (trolleyPos > 60 || trolleyPos < 10) {
          grabState = trolleyDir > 0 ? 'lowering' : 'dropping';
        }
      } else if (grabState === 'lowering') {
        grabHeight -= 0.3;
        grabOpen = Math.min(grabOpen + 0.05, 1);
        if (grabHeight < -25) grabState = 'grabbing';
      } else if (grabState === 'grabbing') {
        grabOpen -= 0.05;
        if (grabOpen <= 0) {
          grabOpen = 0;
          grabState = 'lifting';
        }
      } else if (grabState === 'lifting') {
        grabHeight += 0.3;
        if (grabHeight >= 0) {
          grabHeight = 0;
          trolleyDir = -1;
          grabState = 'moving';
        }
      } else if (grabState === 'dropping') {
        grabOpen += 0.05;
        // Trigger particles
        if (grabOpen >= 1) {
          grabOpen = 1;
          trolleyDir = 1;
          grabState = 'moving';
        }
      }

      // Apply animations
      trolleyGroup.position.x = trolleyPos;
      grabGroup.position.y = grabHeight;
      rope.scale.y = 20 - grabHeight;
      rope.position.y = (grabHeight - 20) / 2;
      
      bucketLeft.rotation.z = Math.PI + grabOpen * 0.5;
      bucketRight.rotation.z = -grabOpen * 0.5;

      // Particle Animation (Drop effect)
      if (grabState === 'dropping' && grabOpen > 0.5) {
        const posAttr = particleSystem.geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          if (posAttr.getY(i) < -50) {
            posAttr.setXYZ(i, trolleyPos + (Math.random() - 0.5) * 2, 30, (Math.random() - 0.5) * 2);
          } else {
            posAttr.setY(i, posAttr.getY(i) - 0.5);
          }
        }
        posAttr.needsUpdate = true;
      }

      // Vibration Effect (Subtle shake on trolley)
      const vibIntensity = stateRef.current.vibrationIntensity || 0.1;
      trolley.position.y = Math.sin(time * 50) * vibIntensity * 0.5;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

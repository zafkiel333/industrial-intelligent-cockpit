import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShaftState } from './three-types';

interface ThreeSceneProps {
  state: ShaftState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<ShaftState>(state);

  // Update state ref when props change
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Cleanup existing canvas and renderer
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // 2. Initialize Scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 3. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);

    // 4. Create Engine & Shaft Model (Abstract)
    const shaftGroup = new THREE.Group();

    // Main Shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    const shaftMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      metalness: 0.8, 
      roughness: 0.2,
      wireframe: false
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaftGroup.add(shaft);

    // Engine Block (Abstract)
    const engineGeometry = new THREE.BoxGeometry(4, 4, 6);
    const engineMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.x = -6;
    shaftGroup.add(engine);

    // Propeller (Abstract)
    const propellerGroup = new THREE.Group();
    propellerGroup.position.x = 6;
    shaftGroup.add(propellerGroup);

    const bladeGeometry = new THREE.BoxGeometry(0.2, 4, 1);
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      blade.rotation.x = (i * Math.PI) / 2;
      propellerGroup.add(blade);
    }

    // Torsional Stress Visualization (Glow Rings)
    const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = -4 + i * 2;
      shaftGroup.add(ring);
      rings.push(ring);
    }

    scene.add(shaftGroup);

    // Grid Helper
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -5;
    scene.add(grid);

    // 5. Animation Loop
    let rotationAngle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { rpm, vibrationAmplitude } = stateRef.current;
      
      // Rotate shaft based on RPM
      const rotationSpeed = (rpm / 60) * (Math.PI * 2) * 0.016; // 60fps
      rotationAngle += rotationSpeed;
      shaftGroup.rotation.x = rotationAngle;

      // Simulate Torsional Vibration (Twist)
      const twist = Math.sin(Date.now() * 0.01) * vibrationAmplitude * 0.1;
      propellerGroup.rotation.x = twist;

      // Update Stress Rings
      rings.forEach((ring, index) => {
        const pulse = Math.sin(Date.now() * 0.005 + index) * 0.2 + 1;
        ring.scale.set(pulse, pulse, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + vibrationAmplitude * 0.5;
        mat.color.setHSL(0, 1, 0.5 - vibrationAmplitude * 0.3);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      // Cleanup scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="shafting-3d-container" />;
};

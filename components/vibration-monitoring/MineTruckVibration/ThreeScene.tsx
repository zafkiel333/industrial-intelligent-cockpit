import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TruckState } from './three-types';

interface ThreeSceneProps {
  state?: TruckState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<TruckState>(state || {
    vibration: 0.5,
    speed: 0,
    loadWeight: 240,
    suspensionHeight: 0,
    dumpAngle: 0
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Transparent background to blend with UI
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 50);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // --- Mine Truck Model ---
    const truckGroup = new THREE.Group();
    scene.add(truckGroup);

    // Chassis (Main Frame)
    const chassisGeom = new THREE.BoxGeometry(18, 2, 8);
    const chassisMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0f172a,
      emissiveIntensity: 0.2
    });
    const chassis = new THREE.Mesh(chassisGeom, chassisMat);
    truckGroup.add(chassis);

    // Wheels & Suspension
    const wheelGeom = new THREE.CylinderGeometry(3.5, 3.5, 2.5, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8 });
    const suspensionMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 1 });
    
    const wheels: THREE.Mesh[] = [];
    const suspensionArms: THREE.Group[] = [];
    
    const wheelPositions = [
      { x: -6, z: 5, id: 'fl' }, { x: -6, z: -5, id: 'fr' },
      { x: 6, z: 5, id: 'rl' }, { x: 6, z: -5, id: 'rr' }
    ];

    wheelPositions.forEach(pos => {
      const suspGroup = new THREE.Group();
      suspGroup.position.set(pos.x, -1, pos.z);
      
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2), suspensionMat);
      arm.position.y = -0.5;
      suspGroup.add(arm);
      
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.y = -1.5;
      suspGroup.add(wheel);
      
      truckGroup.add(suspGroup);
      wheels.push(wheel);
      suspensionArms.push(suspGroup);
    });

    // Dump Body (The "Bucket")
    const dumpBodyGroup = new THREE.Group();
    dumpBodyGroup.position.set(-8, 1, 0); // Pivot point at the rear
    truckGroup.add(dumpBodyGroup);

    const dumpGeom = new THREE.BoxGeometry(16, 6, 9);
    // Cut out the inside of the dump body (simplified as a hollow-ish look)
    const dumpMat = new THREE.MeshStandardMaterial({ 
      color: 0xfacc15, // Yellow for mining truck
      metalness: 0.5,
      roughness: 0.3
    });
    const dump = new THREE.Mesh(dumpGeom, dumpMat);
    dump.position.set(8, 3, 0); // Offset from pivot
    dumpBodyGroup.add(dump);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(4, 4, 4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(6, 3, 2.5);
    truckGroup.add(cabin);

    // Grid Helper for context
    const grid = new THREE.GridHelper(100, 20, 0x3b82f6, 0x1e293b);
    grid.position.y = -6;
    scene.add(grid);

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration, speed, dumpAngle, suspensionHeight } = stateRef.current;

      // 1. Truck Body Vibration
      const vibY = Math.sin(time * 25) * (vibration * 0.05);
      const vibRot = Math.cos(time * 20) * (vibration * 0.005);
      truckGroup.position.y = vibY;
      truckGroup.rotation.z = vibRot;

      // 2. Wheel Rotation based on speed
      wheels.forEach(wheel => {
        wheel.rotation.z += speed * 0.02;
      });

      // 3. Suspension Animation
      suspensionArms.forEach((arm, i) => {
        const offset = Math.sin(time * 10 + i) * (vibration * 0.1);
        arm.position.y = -1 + offset + suspensionHeight;
      });

      // 4. Dump Body Tilt
      dumpBodyGroup.rotation.z = THREE.MathUtils.lerp(dumpBodyGroup.rotation.z, dumpAngle, 0.05);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

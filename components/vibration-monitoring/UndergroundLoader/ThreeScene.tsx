import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LoaderState } from './three-types';

export const ThreeScene: React.FC<{ state?: Partial<LoaderState> }> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<LoaderState>({
    vibration: 0.5,
    bucketAngle: 0,
    articulationAngle: 0,
    speed: 10,
  });

  useEffect(() => {
    if (state) {
      stateRef.current = { ...stateRef.current, ...state };
    }
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // LHD Loader Group
    const loaderGroup = new THREE.Group();
    scene.add(loaderGroup);

    const chassisMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.7, 
      roughness: 0.3 
    });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.2 });

    // Rear Chassis
    const rearChassis = new THREE.Group();
    const rearBody = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 8), chassisMat);
    rearChassis.add(rearBody);
    
    // Engine Bay
    const engineBay = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 6), chassisMat);
    engineBay.position.set(-2, 3.5, 0);
    rearChassis.add(engineBay);
    
    rearChassis.position.x = -8;
    loaderGroup.add(rearChassis);

    // Front Chassis
    const frontChassis = new THREE.Group();
    const frontBody = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 8), chassisMat);
    frontChassis.add(frontBody);
    
    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.7 }));
    cab.position.set(-3, 4, 2);
    frontChassis.add(cab);
    
    frontChassis.position.x = 5;
    loaderGroup.add(frontChassis);

    // Articulation Joint
    const joint = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 6, 16), chassisMat);
    joint.position.x = -1.5;
    loaderGroup.add(joint);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(3, 3, 2.5, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-14, -1, 5], [-14, -1, -5],
      [8, -1, 5], [8, -1, -5]
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      loaderGroup.add(wheel);
      wheels.push(wheel);
    });

    // Bucket System
    const bucketSystem = new THREE.Group();
    const boomL = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 1), chassisMat);
    boomL.position.set(6, 2, 3);
    bucketSystem.add(boomL);
    
    const boomR = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 1), chassisMat);
    boomR.position.set(6, 2, -3);
    bucketSystem.add(boomR);
    
    const bucket = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 10), accentMat);
    bucket.position.set(12, 1, 0);
    bucketSystem.add(bucket);
    
    bucketSystem.position.set(6, 0, 0);
    frontChassis.add(bucketSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration, bucketAngle, articulationAngle, speed } = stateRef.current;

      // Vibration effect
      const vibIntensity = vibration * 0.1;
      loaderGroup.position.y = Math.sin(time * 50) * vibIntensity;
      loaderGroup.rotation.z = Math.cos(time * 45) * vibIntensity * 0.05;

      // Articulation
      frontChassis.rotation.y = THREE.MathUtils.lerp(frontChassis.rotation.y, articulationAngle, 0.05);
      
      // Bucket movement
      bucketSystem.rotation.z = THREE.MathUtils.lerp(bucketSystem.rotation.z, bucketAngle, 0.05);
      
      // Wheel rotation
      wheels.forEach(w => {
        w.rotation.y += speed * 0.01;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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

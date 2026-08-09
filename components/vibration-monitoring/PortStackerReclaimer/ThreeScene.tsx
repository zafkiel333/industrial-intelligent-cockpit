import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StackerReclaimerState } from './three-types';

interface ThreeSceneProps {
  state?: StackerReclaimerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<StackerReclaimerState>(state || {
    bucketWheelSpeed: 6,
    vibrationIntensity: 0.2,
    reclaimingRate: 1500,
    boomAngle: 10,
    travelSpeed: 5
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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(10, 30, 10);
    scene.add(directionalLight);

    // Stacker Reclaimer Model
    const srGroup = new THREE.Group();
    scene.add(srGroup);

    // Gantry
    const gantryGeom = new THREE.BoxGeometry(10, 2, 8);
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const gantry = new THREE.Mesh(gantryGeom, gantryMat);
    srGroup.add(gantry);

    // Slewing Platform
    const platformGroup = new THREE.Group();
    platformGroup.position.y = 2;
    srGroup.add(platformGroup);

    const platformGeom = new THREE.CylinderGeometry(4, 4, 2, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platformGroup.add(platform);

    // Boom
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 1, 0);
    platformGroup.add(boomGroup);

    const boomGeom = new THREE.BoxGeometry(25, 1.5, 2);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x0e7490 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.x = 12.5;
    boomGroup.add(boom);

    // Bucket Wheel
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(25, 0, 0);
    boomGroup.add(wheelGroup);

    const wheelGeom = new THREE.CylinderGeometry(3, 3, 1.5, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, wireframe: true });
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheelGroup.add(wheel);

    // Buckets
    const bucketGeom = new THREE.BoxGeometry(1, 1, 1);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 8; i++) {
      const bucket = new THREE.Mesh(bucketGeom, bucketMat);
      const angle = (i / 8) * Math.PI * 2;
      bucket.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
      wheelGroup.add(bucket);
    }

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { bucketWheelSpeed, boomAngle, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Wheel rotation
      wheelGroup.rotation.z -= bucketWheelSpeed * 0.05;

      // Boom angle
      boomGroup.rotation.z = THREE.MathUtils.degToRad(boomAngle);

      // Vibration effect
      const vib = Math.sin(time * 40) * (vibrationIntensity * 0.1);
      wheelGroup.position.y = vib;

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

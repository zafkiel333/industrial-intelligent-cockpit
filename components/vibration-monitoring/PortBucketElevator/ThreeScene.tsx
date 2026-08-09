import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BucketElevatorState } from './three-types';

interface ThreeSceneProps {
  state?: BucketElevatorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<BucketElevatorState>(state || {
    chainSpeed: 1.2,
    vibrationIntensity: 0.18,
    motorTemp: 45,
    bucketLoad: 85,
    tension: 25
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Bucket Elevator Model
    const elevatorGroup = new THREE.Group();
    scene.add(elevatorGroup);

    // Housing (Transparent with visible frame)
    const housingGeom = new THREE.BoxGeometry(2.5, 12, 3.5);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const housing = new THREE.Mesh(housingGeom, housingMat);
    elevatorGroup.add(housing);

    const frameGeom = new THREE.BoxGeometry(2.6, 12.1, 3.6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    elevatorGroup.add(frame);

    // Sprockets (More detailed)
    const sprocketGeom = new THREE.CylinderGeometry(1.2, 1.2, 1.8, 32);
    const sprocketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const topSprocket = new THREE.Mesh(sprocketGeom, sprocketMat);
    topSprocket.rotation.z = Math.PI / 2;
    topSprocket.position.y = 5.5;
    elevatorGroup.add(topSprocket);

    const bottomSprocket = new THREE.Mesh(sprocketGeom, sprocketMat);
    bottomSprocket.rotation.z = Math.PI / 2;
    bottomSprocket.position.y = -5.5;
    elevatorGroup.add(bottomSprocket);

    // Chain (Visual representation)
    const chainGeom = new THREE.TorusGeometry(5.5, 0.05, 8, 100);
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const chain1 = new THREE.Mesh(chainGeom, chainMat);
    chain1.rotation.y = Math.PI / 2;
    chain1.position.z = 1.2;
    elevatorGroup.add(chain1);

    const chain2 = new THREE.Mesh(chainGeom, chainMat);
    chain2.rotation.y = Math.PI / 2;
    chain2.position.z = -1.2;
    elevatorGroup.add(chain2);

    // Buckets
    const bucketGroup = new THREE.Group();
    elevatorGroup.add(bucketGroup);
    const bucketGeom = new THREE.BoxGeometry(1.2, 0.8, 1.5);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.2 });
    
    const numBuckets = 16;
    for (let i = 0; i < numBuckets; i++) {
      const bucket = new THREE.Mesh(bucketGeom, bucketMat);
      bucketGroup.add(bucket);
    }

    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -7;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { chainSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Sprocket Rotation
      topSprocket.rotation.x += chainSpeed * 0.05;
      bottomSprocket.rotation.x += chainSpeed * 0.05;

      // Bucket Movement
      bucketGroup.children.forEach((b: any, i: number) => {
        const offset = (i / numBuckets) * 22; // Total path length ~22
        const pos = (time * chainSpeed * 2 + offset) % 22;
        
        if (pos < 11) { // Going up
          b.position.set(0, -5.5 + pos, 1.2);
          b.rotation.x = 0;
        } else { // Going down
          b.position.set(0, 5.5 - (pos - 11), -1.2);
          b.rotation.x = Math.PI; // Flip bucket when going down
        }
      });

      // Vibration effect
      const vib = Math.sin(time * 80) * (vibrationIntensity * 0.05);
      elevatorGroup.position.x = vib;
      elevatorGroup.position.z = vib;

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

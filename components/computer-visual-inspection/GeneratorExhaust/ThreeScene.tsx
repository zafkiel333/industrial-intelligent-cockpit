import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ExhaustStatus } from './three-types';

interface ThreeSceneProps {
  status: ExhaustStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<ExhaustStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
    camera.position.set(12, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Generator Model
    const generatorGroup = new THREE.Group();
    scene.add(generatorGroup);

    // Main Body
    const bodyGeom = new THREE.BoxGeometry(6, 4, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0f172a
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    generatorGroup.add(body);

    // Radiator
    const radGeom = new THREE.BoxGeometry(0.5, 3.5, 3.5);
    const radMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const radiator = new THREE.Mesh(radGeom, radMat);
    radiator.position.x = 3.2;
    generatorGroup.add(radiator);

    // Exhaust Pipe
    const pipeGeom = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const pipe = new THREE.Mesh(pipeGeom, pipeMat);
    pipe.position.set(-2, 2.5, 0);
    generatorGroup.add(pipe);

    // Exhaust Outlet
    const outletGeom = new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16);
    const outlet = new THREE.Mesh(outletGeom, pipeMat);
    outlet.position.set(-2, 3.5, 0);
    generatorGroup.add(outlet);

    // Smoke Particles
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount * 3);
    const lifeArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = -2;
      posArray[i * 3 + 1] = 3.5;
      posArray[i * 3 + 2] = 0;
      
      velArray[i * 3] = (Math.random() - 0.5) * 0.05;
      velArray[i * 3 + 1] = Math.random() * 0.1 + 0.05;
      velArray[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      
      lifeArray[i] = Math.random();
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMat = new THREE.PointsMaterial({ 
      color: 0xcccccc, 
      size: 0.2, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const smokeSystem = new THREE.Points(particles, pMat);
    scene.add(smokeSystem);

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x00ffff, 0x1e293b);
    grid.position.y = -2.5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Generator Vibration
      generatorGroup.position.y = Math.sin(time * 20) * (s.engineRpm / 2000) * 0.05;

      // Smoke Animation
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        lifeArray[i] += 0.01;
        if (lifeArray[i] > 1) {
          lifeArray[i] = 0;
          positions[i * 3] = -2;
          positions[i * 3 + 1] = 3.5;
          positions[i * 3 + 2] = 0;
        }

        positions[i * 3] += velArray[i * 3];
        positions[i * 3 + 1] += velArray[i * 3 + 1] * (s.engineRpm / 1500);
        positions[i * 3 + 2] += velArray[i * 3 + 2];
      }
      particles.attributes.position.needsUpdate = true;

      // Smoke Color based on status
      if (s.smokeColor === 'black') {
        pMat.color.setHex(0x333333);
        pMat.opacity = 0.8 * s.opacity;
      } else if (s.smokeColor === 'white') {
        pMat.color.setHex(0xffffff);
        pMat.opacity = 0.5 * s.opacity;
      } else if (s.smokeColor === 'blue') {
        pMat.color.setHex(0xaaaaff);
        pMat.opacity = 0.6 * s.opacity;
      } else {
        pMat.color.setHex(0xcccccc);
        pMat.opacity = 0.3 * s.opacity;
      }

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

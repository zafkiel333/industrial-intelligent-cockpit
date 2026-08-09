import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HoseStatus } from './three-types';

interface ThreeSceneProps {
  status: HoseStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<HoseStatus>(status);

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
    camera.position.set(10, 10, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Hose Model (CatmullRomCurve3)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(-2, 2, 2),
      new THREE.Vector3(2, -2, -2),
      new THREE.Vector3(5, 0, 0)
    ]);

    const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.5, 16, false);
    const tubeMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.5, 
      roughness: 0.8,
      emissive: 0x0f172a
    });
    const hose = new THREE.Mesh(tubeGeom, tubeMat);
    scene.add(hose);

    // Connectors
    const connectorGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 32);
    const connectorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1, roughness: 0.2 });
    
    const startConn = new THREE.Mesh(connectorGeom, connectorMat);
    startConn.position.set(-5, 0, 0);
    startConn.rotation.z = Math.PI / 2;
    scene.add(startConn);

    const endConn = new THREE.Mesh(connectorGeom, connectorMat);
    endConn.position.set(5, 0, 0);
    endConn.rotation.z = Math.PI / 2;
    scene.add(endConn);

    // Leak Particles
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = 0;
      posArray[i * 3 + 1] = 0;
      posArray[i * 3 + 2] = 0;
      velArray[i * 3] = (Math.random() - 0.5) * 0.1;
      velArray[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velArray[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const leakSystem = new THREE.Points(particles, pMat);
    scene.add(leakSystem);

    // Aging Highlights
    const agingGeom = new THREE.TubeGeometry(curve, 64, 0.52, 16, false);
    const agingMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const agingOverlay = new THREE.Mesh(agingGeom, agingMat);
    scene.add(agingOverlay);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Pulse based on pressure
      const pulse = 1 + Math.sin(time * 10) * (s.pressure / 50) * 0.05;
      hose.scale.set(pulse, pulse, pulse);

      // Aging visual
      agingMat.opacity = s.agingLevel * 0.5;
      tubeMat.roughness = 0.8 - s.agingLevel * 0.5;
      tubeMat.color.setHSL(0, 0, 0.1 + (1 - s.agingLevel) * 0.1);

      // Leak Animation
      if (s.leakDetected) {
        leakSystem.visible = true;
        leakSystem.position.set(s.leakPosition.x, s.leakPosition.y, s.leakPosition.z);
        const positions = particles.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velArray[i * 3];
          positions[i * 3 + 1] += velArray[i * 3 + 1];
          positions[i * 3 + 2] += velArray[i * 3 + 2];

          if (Math.sqrt(positions[i * 3]**2 + positions[i * 3 + 1]**2 + positions[i * 3 + 2]**2) > 1) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
          }
        }
        particles.attributes.position.needsUpdate = true;
      } else {
        leakSystem.visible = false;
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
